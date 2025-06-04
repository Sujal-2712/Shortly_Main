
const mongoose = require('mongoose');
const { Schema } = mongoose;

const profile_imgs_name_list = [
  "Garfield", "Tinkerbell", "Annie", "Loki", "Cleo", "Angel",
  "Bob", "Mia", "Coco", "Gracie", "Bear", "Bella", "Abby",
  "Harley", "Cali", "Leo", "Luna", "Jack", "Felix", "Kiki",
];

const profile_imgs_collections_list = [
  "notionists-neutral", "adventurer-neutral", "fun-emoji",
];

const userSchema = new Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function (value) {
        return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value);
      },
      message: 'Please provide a valid email address'
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  total_links: {
    type: Number,
    default: 0,
    min: 0
  },
  profile_img: {
    type: String,
    default: function() {
      const collection = profile_imgs_collections_list[
        Math.floor(Math.random() * profile_imgs_collections_list.length)
      ];
      const seed = profile_imgs_name_list[
        Math.floor(Math.random() * profile_imgs_name_list.length)
      ];
      return `https://api.dicebear.com/6.x/${collection}/svg?seed=${seed}`;
    }
  },
  reset_password_otp: {
    type: Number,
    default: null
  },
  reset_password_otp_expires: {
    type: Date,
    default: null
  },
  is_verified: {
    type: Boolean,
    default: false
  },
  is_active: {
    type: Boolean,
    default: true
  },
  last_login: {
    type: Date,
    default: null
  },
  urls: [{
    type: Schema.Types.ObjectId,
    ref: 'urls'
  }]
}, {
  timestamps: true
});

// // Indexes for performance
// userSchema.index({ email: 1 }, { unique: true });
// userSchema.index({ createdAt: -1 });

// Virtual for total clicks across all URLs
userSchema.virtual('totalClicks').get(function() {
  return this.urls.reduce((total, url) => {
    return total + (url.clicks ? url.clicks.length : 0);
  }, 0);
});

userSchema.set('toJSON', { virtuals: true });

const USER = mongoose.model('users', userSchema);
module.exports = { USER };