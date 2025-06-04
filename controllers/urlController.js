const { URL } = require("../models/Url");
const { USER } = require("../models/User");
const { CLICKS } = require("../models/Clicks");
const urlService = require("../services/urlService");
const qrService = require("../services/qrService");
const geoService = require("../services/geoService");
const logger = require("../utils/logger/logger");
const { validationResult } = require("express-validator");

class UrlController {
  async shortenUrl(req, res) {
    try {
      const errors = validationResult(req);
      const { nanoid } = await import("nanoid");

      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { longUrl, customUrl, title } = req.body;
      const userId = req.user;
      const qrCodeBuffer = req.file?.buffer;
      let qrCodeBase64 = null;

      // Step 1: Check if longUrl already exists
      const existingLongUrl = await urlService.findByLongUrl(longUrl, userId);
      if (existingLongUrl) {
        return res.status(409).json({
          success: false,
          message: "This long URL already exists in your account",
          data: existingLongUrl,
        });
      }

      if (customUrl) {
        const existingCustomUrl = await urlService.findByCustomUrl(customUrl);
        if (existingCustomUrl) {
          return res.status(409).json({
            success: false,
            message: "Custom URL already used. Please choose another.",
            data: existingCustomUrl,
          });
        }
      }

      if (qrCodeBuffer) {
        qrCodeBase64 = `data:image/png;base64,${qrCodeBuffer.toString(
          "base64"
        )}`;
      } else {
        qrCodeBase64 = await qrService.generateQRCode(longUrl);
      }

      const shortId = customUrl || nanoid(8);
      const urlData = await urlService.createShortUrl({
        longUrl,
        customUrl: shortId,
        title: title || longUrl,
        userId,
        qrCode: qrCodeBase64,
      });

      res.status(201).json({
        success: true,
        message: "URL shortened successfully",
        data: urlData,
      });
    } catch (error) {
      console.error(error);
      logger.error("Error shortening URL:", error);

      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "Custom URL already exists",
        });
      }

      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  async getUserUrls(req, res) {
    try {
      const userId = req.user;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const urls = await URL.find({ user_id: userId })
        .populate({
          path: "clicks",
          select: "city device country browser os timestamp",
          options: { sort: { createdAt: -1 } },
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const totalUrls = await URL.countDocuments({ user_id: userId });
      const urlsWithAnalytics = urls.map((url) => {
        const analytics = this.calculateUrlAnalytics(url.clicks);
        return {
          ...url.toObject(),
          analytics,
        };
      });

      res.status(200).json({
        success: true,
        message: "URLs fetched successfully",
        data: {
          urls: urlsWithAnalytics,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalUrls / limit),
            totalUrls,
            hasNext: page < Math.ceil(totalUrls / limit),
            hasPrev: page > 1,
          },
        },
      });
    } catch (error) {
      logger.error("Error fetching user URLs:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch URLs",
      });
    }
  }

  async getUrlById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user;

      const url = await URL.findOne({ _id: id, user_id: userId }).populate({
        path: "clicks",
        select: "city device country browser os timestamp referer",
        options: { sort: { createdAt: -1 } },
      });

      if (!url) {
        return res.status(404).json({
          success: false,
          message: "URL not found",
        });
      }

      const analytics = this.calculateDetailedAnalytics(url.clicks);

      res.status(200).json({
        success: true,
        message: "URL fetched successfully",
        data: {
          ...url.toObject(),
          analytics,
        },
      });
    } catch (error) {
      
      logger.error("Error fetching URL:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch URL",
      });
    }
  }

  
  async deleteUrl(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user;

      const deletedURL = await URL.findOneAndDelete({
        _id: id,
        user_id: userId,
      });

      if (!deletedURL) {
        return res.status(404).json({
          success: false,
          message: "URL not found",
        });
      }

      await USER.findByIdAndUpdate(userId, {
        $pull: { urls: id },
        $inc: { total_links: -1 },
      });
      await CLICKS.deleteMany({ url_id: id });
      res.status(200).json({
        success: true,
        message: "URL deleted successfully",
      });
    } catch (error) {
      logger.error("Error deleting URL:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete URL",
      });
    }
  }

  async redirectUrl(req, res) {
    try {
      const { shortUrl } = req.params;

      const urlData = await URL.findOne({ short_url: shortUrl }).select(
        "_id original_url"
      );
      if (!urlData) {
        return res.status(404).json({
          success: false,
          message: "URL not found",
        });
      }
      await this.trackClick(urlData._id, req);
      res.redirect(301, urlData.original_url);
    } catch (error) {
      logger.error("Error redirecting URL:", error);
      res.status(500).json({
        success: false,
        message: "An error occurred while processing your request",
      });
    }
  }

  async trackClick(urlId, req) {
    try {
      const analyticsData = await geoService.getAnalyticsData(req);

      // Create click record
      const click = new CLICKS({
        url_id: urlId,
        city: analyticsData.city.toLowerCase(),
        country: analyticsData.country.toLowerCase(),
        device: analyticsData.device.toLowerCase(),
        browser: analyticsData.browser.toLowerCase(),
        os: analyticsData.os.toLowerCase(),
        ip: analyticsData.ip,
        userAgent: analyticsData.userAgent,
        referer: analyticsData.referer,
        timestamp: analyticsData.timestamp,
      });

      const savedClick = await click.save();

      // Update URL with new click
      await URL.findByIdAndUpdate(urlId, {
        $push: { clicks: savedClick._id },
      });

      logger.info(`Click tracked successfully for URL: ${urlId}`);
    } catch (error) {
      logger.error("Error tracking click:", error);
      throw error;
    }
  }

  calculateUrlAnalytics(clicks) {
    if (!clicks || clicks.length === 0) {
      return {
        totalClicks: 0,
        uniqueCountries: 0,
        uniqueCities: 0,
        deviceBreakdown: {},
        recentClicks: [],
      };
    }

    const countries = new Set();
    const cities = new Set();
    const devices = {};

    clicks.forEach((click) => {
      countries.add(click.country);
      cities.add(click.city);
      devices[click.device] = (devices[click.device] || 0) + 1;
    });

    return {
      totalClicks: clicks.length,
      uniqueCountries: countries.size,
      uniqueCities: cities.size,
      deviceBreakdown: devices,
      recentClicks: clicks.slice(0, 5),
    };
  }

  calculateDetailedAnalytics(clicks) {
    if (!clicks || clicks.length === 0) {
      return {
        totalClicks: 0,
        uniqueVisitors: 0,
        clicksByCountry: {},
        clicksByCity: {},
        clicksByDevice: {},
        clicksByBrowser: {},
        clicksByDay: {},
        topReferrers: {},
        recentClicks: [],
      };
    }

    const countries = {};
    const cities = {};
    const devices = {};
    const browsers = {};
    const dailyClicks = {};
    const referrers = {};
    const uniqueIPs = new Set();

    clicks.forEach((click) => {
      // Country stats
      countries[click.country] = (countries[click.country] || 0) + 1;

      // City stats
      cities[click.city] = (cities[click.city] || 0) + 1;

      // Device stats
      devices[click.device] = (devices[click.device] || 0) + 1;

      // Browser stats
      browsers[click.browser] = (browsers[click.browser] || 0) + 1;

      // Daily stats
      const date = new Date(click.timestamp).toISOString().split("T")[0];
      dailyClicks[date] = (dailyClicks[date] || 0) + 1;

      // Referrer stats
      if (click.referer && click.referer !== "direct") {
        referrers[click.referer] = (referrers[click.referer] || 0) + 1;
      }

      // Unique visitors (by IP)
      if (click.ip && click.ip !== "Unknown") {
        uniqueIPs.add(click.ip);
      }
    });

    return {
      totalClicks: clicks.length,
      uniqueVisitors: uniqueIPs.size,
      clicksByCountry: this.sortObjectByValue(countries),
      clicksByCity: this.sortObjectByValue(cities),
      clicksByDevice: this.sortObjectByValue(devices),
      clicksByBrowser: this.sortObjectByValue(browsers),
      clicksByDay: dailyClicks,
      topReferrers: this.sortObjectByValue(referrers),
      recentClicks: clicks.slice(0, 10),
    };
  }

  sortObjectByValue(obj) {
    return Object.entries(obj)
      .sort(([, a], [, b]) => b - a)
      .reduce((result, [key, value]) => {
        result[key] = value;
        return result;
      }, {});
  }
}

module.exports = new UrlController();
