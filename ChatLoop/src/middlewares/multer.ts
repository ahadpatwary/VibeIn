import multer from 'multer';

const storage = multer.memoryStorage(); // buffer আকারে file store করবে
export const upload = multer({ storage });