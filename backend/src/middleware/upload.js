import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { cloudinary, isCloudinaryConfigured } from '../lib/cloudinary.js';
import { s3, isS3Configured, PutObjectCommand, S3_BUCKET_NAME } from '../lib/s3.js';

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

// Uploads the saved file to a persistent store when configured, returning a
// public HTTPS URL. Preference: S3 (then Cloudinary), with a local /uploads
// fallback (ephemeral on Render) so uploads never hard-fail.
export const uploadToCloudinary = (file) => {
  if (!file) return Promise.resolve({ secure_url: '' });

  if (isS3Configured) {
    return uploadToS3(file);
  }

  if (isCloudinaryConfigured) {
    return cloudinary.uploader
      .upload(file.path, { folder: 'savant', resource_type: 'auto' })
      .then((result) => {
        fs.unlink(file.path, () => {});
        return { secure_url: result.secure_url };
      })
      .catch(() => ({ secure_url: `/uploads/${file.filename}` }));
  }

  return Promise.resolve({ secure_url: `/uploads/${file.filename}` });
};

const uploadToS3 = async (file) => {
  const key = `savant/${Date.now()}-${Math.round(Math.random() * 1e6)}${path.extname(file.originalname) || '.png'}`;
  try {
    const body = fs.readFileSync(file.path);
    await s3.send(
      new PutObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: key,
        Body: body,
        ContentType: file.mimetype,
        ACL: 'public-read',
      })
    );
    fs.unlink(file.path, () => {});
    const endpoint = process.env.S3_PUBLIC_URL?.replace(/\/$/, '');
    return { secure_url: endpoint ? `${endpoint}/${key}` : `https://${S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}` };
  } catch (e) {
    return { secure_url: `/uploads/${file.filename}` };
  }
};
