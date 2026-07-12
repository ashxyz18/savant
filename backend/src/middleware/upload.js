import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import stream from 'stream';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;
  const mimetype = allowedTypes.test(file.mimetype);
  if (mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'roseo', transformation: [{ quality: 'auto', fetch_format: 'auto' }] },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    const bufferStream = new stream.PassThrough();
    bufferStream.end(file.buffer);
    bufferStream.pipe(uploadStream);
  });
};

const memoryStorage = multer.memoryStorage();

export const upload = multer({
  storage: memoryStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const uploadMultiple = multer({
  storage: memoryStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).array('images', 5);

export { uploadToCloudinary };
