const { cloudinary } = require('../config/cloudinary');

const handleUploadError = (err, req, res, next) => {
  if (err.name === 'MulterError') {
    return res.status(400).json({
      message: 'File upload error',
      error: err.message
    });
  }

  if (err.name === 'CloudinaryError') {
    return res.status(500).json({
      message: 'Cloud storage error',
      error: err.message
    });
  }

  // Clean up any uploaded files if an error occurs
  if (req.files) {
    const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
    files.forEach(async (file) => {
      if (file.path) {
        const publicId = file.path.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      }
    });
  }

  next(err);
};

module.exports = handleUploadError;