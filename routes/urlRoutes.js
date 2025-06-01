const express = require('express');
const router = express.Router();
const multer = require('multer');
const urlController = require('../controllers/urlController');
const { auth } = require('../middleware/auth');
const { urlValidation } = require('../middleware/validation');
const { shortenLimiter } = require('../middleware/rateLimiter');

const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

router.post('/shorten', 
  auth, 
  shortenLimiter,
  upload.single('qrCodeImage'),
  urlValidation.shortenUrl,
  (req, res) => urlController.shortenUrl(req, res)
  
);

router.get('/user-urls', 
  auth,
  urlValidation.getUserUrls,
  (req, res) => urlController.getUserUrls(req, res)
);

router.get('/get/:id', 
  auth,
  urlValidation.getUrl, 
  (req,res)=> urlController.getUrlById(req, res)
);

router.delete('/delete/:id', 
  auth, 
  urlValidation.getUrl, 
  urlController.deleteUrl
);

//no auth required for redirect
router.get('/:shortUrl', (req, res) => urlController.redirectUrl(req, res));

module.exports = router;