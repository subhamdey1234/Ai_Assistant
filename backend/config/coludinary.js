import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs/promises';
import path from 'path';

// Configure Cloudinary once during initialization
cloudinary.config({
    cloud_name: process.env.cloud_name,
    api_key: process.env.cloud_api_key,
    api_secret: process.env.cloud_api_secrect,
    secure: true // Use HTTPS
});

// Supported file types
const SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Validates file before upload
 * @param {string} filePath - Path to the file
 * @param {string} fileType - MIME type of the file
 * @param {number} fileSize - Size of the file in bytes
 */
const validateFile = (filePath, fileType, fileSize) => {
    if (!filePath) {
        throw new Error('No file provided');
    }
    if (!SUPPORTED_FORMATS.includes(fileType)) {
        throw new Error('Unsupported file format');
    }
    if (fileSize > MAX_FILE_SIZE) {
        throw new Error('File size exceeds limit');
    }
};

/**
 * Uploads a file to Cloudinary with optimization options
 * @param {Object} options - Upload options
 * @param {string} options.filePath - Path to the file
 * @param {string} options.fileType - MIME type of the file
 * @param {number} options.fileSize - Size of the file in bytes
 * @param {string} options.folder - Cloudinary folder to upload to
 * @param {boolean} options.optimize - Whether to optimize the image
 * @returns {Promise<Object>} Cloudinary upload result
 */
export const cloudinaryUpload = async ({
    filePath,
    fileType,
    fileSize,
    folder = 'uploads',
    optimize = true
}) => {
    try {
        // Validate the file
        validateFile(filePath, fileType, fileSize);

        // Base upload options
        const uploadOptions = {
            folder,
            resource_type: 'auto',
            use_filename: true,
            unique_filename: true,
        };

        // Add optimization options if enabled
        if (optimize) {
            uploadOptions.transformation = [
                { quality: 'auto:good' },
                { fetch_format: 'auto' },
                { width: 'auto', crop: 'scale' }
            ];
        }

        // Upload to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(filePath, uploadOptions);

        // Cleanup: Remove temporary file
        await fs.unlink(filePath).catch(console.error);

        return {
            success: true,
            data: {
                url: uploadResult.secure_url,
                publicId: uploadResult.public_id,
                format: uploadResult.format,
                size: uploadResult.bytes,
                width: uploadResult.width,
                height: uploadResult.height,
                resourceType: uploadResult.resource_type
            }
        };

    } catch (error) {
        // Cleanup on error
        try {
            await fs.unlink(filePath);
        } catch (unlinkError) {
            console.error('Error removing temporary file:', unlinkError);
        }

        console.error('Cloudinary upload error:', error);
        return {
            success: false,
            error: error.message || 'Upload failed'
        };
    }
};

/**
 * Deletes a file from Cloudinary
 * @param {string} publicId - Cloudinary public ID of the file
 * @returns {Promise<Object>} Deletion result
 */
export const cloudinaryDelete = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return {
            success: true,
            result
        };
    } catch (error) {
        console.error('Cloudinary deletion error:', error);
        return {
            success: false,
            error: error.message || 'Deletion failed'
        };
    }
};

/**
 * Generates optimized image URL with Cloudinary transformations
 * @param {string} url - Original Cloudinary URL
 * @param {Object} options - Transformation options
 * @returns {string} Transformed URL
 */
export const getOptimizedImageUrl = (url, options = {}) => {
    const {
        width,
        height,
        quality = 'auto',
        format = 'auto',
        crop = 'scale'
    } = options;

    return cloudinary.url(url, {
        transformation: [
            { width, height, crop },
            { fetch_format: format, quality }
        ]
    });
};