import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure public directory exists
const publicDir = './public';
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
}

// Define allowed file types
const MIME_TYPES = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp'
};

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, publicDir);
    },
    filename: function (req, file, cb) {
        // Create unique filename with original extension
        const name = file.originalname
            .toLowerCase()
            .split(' ')
            .join('-')
            .split('.')
            .slice(0, -1)
            .join('.');
        const extension = MIME_TYPES[file.mimetype];
        cb(null, name + '-' + Date.now() + '.' + extension);
    }
});

// File filter function
const fileFilter = (req, file, cb) => {
    if (MIME_TYPES[file.mimetype]) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP files are allowed.'), false);
    }
};

// Create multer instance with configuration
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 1 // Max number of files
    },
    fileFilter: fileFilter
});

// Error handling middleware
export const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                message: 'File too large. Maximum size is 5MB'
            });
        }
        return res.status(400).json({
            message: 'File upload error: ' + err.message
        });
    } else if (err) {
        return res.status(400).json({
            message: err.message
        });
    }
    next();
};

// Single file upload middleware
export const uploadSingle = (fieldName) => {
    return (req, res, next) => {
        upload.single(fieldName)(req, res, (err) => {
            if (err) {
                return handleMulterError(err, req, res, next);
            }
            next();
        });
    };
};

// Multiple files upload middleware
export const uploadMultiple = (fieldName, maxCount = 5) => {
    return (req, res, next) => {
        upload.array(fieldName, maxCount)(req, res, (err) => {
            if (err) {
                return handleMulterError(err, req, res, next);
            }
            next();
        });
    };
};

// Clean up function to remove files
export const cleanupFiles = async (files) => {
    if (!files) return;

    const filesToDelete = Array.isArray(files) ? files : [files];
    
    for (const file of filesToDelete) {
        if (file.path) {
            try {
                await fs.promises.unlink(file.path);
            } catch (error) {
                console.error(`Error deleting file ${file.path}:`, error);
            }
        }
    }
};

export default {
    uploadSingle,
    uploadMultiple,
    handleMulterError,
    cleanupFiles
};