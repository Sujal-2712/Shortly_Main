const { URL } = require('../models/Url');
const { USER } = require('../models/User');
const shortid = require('shortid');
const logger = require('../utils/logger/logger');

class UrlService {
  /**
   * Generate a unique short URL
   */
  async generateUniqueShortUrl() {
    let shortUrl;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      shortUrl = shortid.generate();
      const existing = await URL.findOne({ short_url: shortUrl });
      isUnique = !existing;
      attempts++;
    }

    if (!isUnique) {
      throw new Error('Unable to generate unique short URL');
    }

    return shortUrl;
  }

  async createShortUrl({ longUrl, customUrl, title, userId, qrCode }) {
    try {
      // Generate short URL
      const shortUrl = customUrl || await this.generateUniqueShortUrl();
      console.log(`Generated short URL: ${shortUrl}`);
      if (customUrl) {
        const existing = await URL.findOne({ 
          $or: [
            { custom_url: customUrl.toLowerCase() },
            { short_url: customUrl.toLowerCase() }
          ]
        });
        
        if (existing) {
          throw new Error('Custom URL already exists');
        }
      }

      // Create new URL document
      const newUrl = new URL({
        original_url: longUrl,
        custom_url: customUrl ? customUrl.toLowerCase() : null,
        short_url: shortUrl,
        user_id: userId,
        title: title || longUrl,
        qr: qrCode
      });
      console.log(`Creating new URL: ${JSON.stringify(newUrl)}`);
      await newUrl.save();

      // Update user's URLs array and total count
      await USER.findByIdAndUpdate(userId, {
        $push: { urls: newUrl._id },
        $inc: { total_links: 1 }
      });

      logger.info(`URL shortened successfully: ${longUrl} -> ${shortUrl}`);

      return {
        _id: newUrl._id,
        original_url: longUrl,
        short_url: shortUrl,
        custom_url: customUrl,
        title: newUrl.title,
        qr: qrCode,
        createdAt: newUrl.createdAt
      };

    } catch (error) {
      logger.error('Error creating short URL:', error);
      throw error;
    }
  }

  /**
   * Get URL by short URL
   */
  async getUrlByShortUrl(shortUrl) {
    try {
      const url = await URL.findOne({ 
        $or: [
          { short_url: shortUrl },
          { custom_url: shortUrl }
        ],
        is_active: true
      });

      if (!url) {
        return null;
      }

      // Check if URL is expired
      if (url.isExpired()) {
        return null;
      }

      return url;
    } catch (error) {
      logger.error('Error getting URL by short URL:', error);
      throw error;
    }
  }
}

module.exports = new UrlService();