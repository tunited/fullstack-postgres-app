import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure storage destination and custom unique filenames
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure file filtering to allow only image files
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png|gif|webp|pdf|doc|docx|xls|xlsx|csv|txt|zip|rar/;
  const allowedMimeTypes = /image\/(jpeg|jpg|png|gif|webp)|application\/(pdf|msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document|vnd\.ms-excel|vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet|zip|x-rar-compressed)|text\/(csv|plain)/;
  
  const ext = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
  const mime = allowedMimeTypes.test(file.mimetype);

  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error('ประเภทไฟล์ไม่รองรับ (รองรับรูปภาพ, PDF, Word, Excel, ZIP, Text)'));
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // Strict 20MB file size limit
  fileFilter
});
