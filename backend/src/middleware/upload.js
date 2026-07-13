import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { cloudinary, isCloudinaryConfigured } from '../lib/cloudinary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '..', '..', 'uploads');

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.png';
    const name = `img-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, name);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;
  if (allowedTypes.test(file.mimetype)) {
    return cb(null, true);
  }
  cb(new Error('Only image files are allowed'));
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

export const uploadMultiple = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
}).array('images', 5);

// Uploads the saved file to Cloudinary when configured, returning a
// persistent HTTPS URL. Falls back to the local /uploads path (ephemeral on
// Render) when Cloudinary env vars are absent, so uploads never hard-fail.
export const uploadToCloudinary = (file) => {
  if (!file) return Promise.resolve({ secure_url: '' });

  if (!isCloudinaryConfigured) {
    return Promise.resolve({ secure_url: `/uploads/${file.filename}` });
  }

  return cloudinary.uploader
    .upload(file.path, { folder: 'savant', resource_type: 'auto' })
    .then((result) => {
      // Remove the temporary local copy so the ephemeral disk doesn't fill up.
      fs.unlink(file.path, () => {});
      return { secure_url: result.secure_url };
    })
    .catch(() => ({ secure_url: `/uploads/${file.filename}` }));
};
