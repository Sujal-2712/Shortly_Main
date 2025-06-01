const mongoose = require("mongoose");
const { Schema } = mongoose;

const urlSchema = new Schema(
  {
    original_url: {
      type: String,
      required: [true, "Original URL is required"],
      validate: {
        validator: function (v) {
          return /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/.test(v);
        },
        message: "Please provide a valid URL",
      },
    },
    custom_url: {
      type: String,
      unique: true,
      sparse: true, // Allow multiple null values
      lowercase: true,
      trim: true,
      validate: {
        validator: function (value) {
          if (!value) return true; // Allow null/undefined
          return /^[a-zA-Z0-9_-]+$/.test(value);
        },
        message:
          "Custom URL can only contain letters, numbers, hyphens, and underscores",
      },
    },
    short_url: {
      type: String,
      required: [true, "Short URL is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: [true, "User ID is required"],
    },
    title: {
      type: String,
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    qr: {
      type: String, // Base64 encoded QR code
    },
    clicks: [
      {
        type: Schema.Types.ObjectId,
        ref: "clicks",
      },
    ],
    is_active: {
      type: Boolean,
      default: true,
    },
    expires_at: {
      type: Date,
      default: null, // null means never expires
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
// urlSchema.index({ short_url: 1 }, { unique: true });
// urlSchema.index({ custom_url: 1 }, { unique: true, sparse: true });
// urlSchema.index({ user_id: 1 });
// urlSchema.index({ createdAt: -1 });
// urlSchema.index({ is_active: 1 });
// urlSchema.index({ expires_at: 1 });

// Virtual for click count
urlSchema.virtual("clickCount").get(function () {
  return this.clicks ? this.clicks.length : 0;
});

// Method to check if URL is expired
urlSchema.methods.isExpired = function () {
  return this.expires_at && new Date() > this.expires_at;
};

urlSchema.set("toJSON", { virtuals: true });

const URL = mongoose.model("urls", urlSchema);
module.exports = { URL };
