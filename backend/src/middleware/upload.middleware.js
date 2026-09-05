const formidablePkg = require('formidable');
const path = require('path');
const fs = require('fs');

const createForm = typeof formidablePkg === 'function'
  ? formidablePkg
  : (formidablePkg.formidable || formidablePkg.default || ((opts) => new formidablePkg.IncomingForm(opts)));

const uploadDir = path.join(__dirname, '../../uploads/contacts');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * Middleware to parse multipart/form-data for contact creation and edits
 */
const handleContactUpload = (req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  if (!contentType.includes('multipart/form-data')) {
    return next();
  }

  const form = createForm({
    uploadDir,
    keepExtensions: true,
    maxFileSize: 5 * 1024 * 1024, // 5MB
    filter: ({ mimetype }) => {
      return Boolean(mimetype && mimetype.startsWith('image/'));
    },
    filename: (name, ext, part) => {
      const safeExt = ext || (part.mimetype === 'image/png' ? '.png' : part.mimetype === 'image/webp' ? '.webp' : '.jpg');
      return `contact-${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`;
    }
  });

  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: `File upload error: ${err.message}`,
      });
    }

    // Flatten formidable v3 fields (which may be wrapped in arrays)
    const flatFields = {};
    for (const [key, val] of Object.entries(fields || {})) {
      flatFields[key] = Array.isArray(val) ? val[0] : val;
    }
    req.body = { ...req.body, ...flatFields };

    const photo = files.photo || files.profile_image || files.image;
    if (photo) {
      const fileObj = Array.isArray(photo) ? photo[0] : photo;
      if (fileObj && (fileObj.newFilename || fileObj.filepath)) {
        const filename = fileObj.newFilename || path.basename(fileObj.filepath);
        req.uploadedFile = {
          filename: filename,
          filepath: fileObj.filepath,
          url: `/uploads/contacts/${filename}`,
        };
      }
    }

    next();
  });
};

module.exports = { handleContactUpload, uploadDir };
