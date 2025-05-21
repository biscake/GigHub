import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

export const uploadSingleImage = upload.single('file');