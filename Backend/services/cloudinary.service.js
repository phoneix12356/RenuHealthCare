import { v2 as cloudinary } from 'cloudinary';

class CloudinaryService {
  constructor() {
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  /**
   * Upload a file (image or PDF) to Cloudinary
   * @param {Buffer|string} file - File buffer or base64 string
   * @param {Object} options - Upload options
   * @returns {Promise<Object>} Cloudinary upload response
   */
  async uploadFile(file, options = {}) {
    try {
      const defaultOptions = {
        resource_type: 'auto', // Automatically detect resource type
        folder: 'uploads',     // Default folder
        use_filename: true,    // Use original filename
        unique_filename: true, // Add unique identifier
      };

      const uploadOptions = { ...defaultOptions, ...options };
      
      // Handle both Buffer and base64 string inputs
      const fileToUpload = file instanceof Buffer 
        ? file 
        : this.convertBase64ToBuffer(file);

      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        uploadStream.end(fileToUpload);
      });

      return {
        success: true,
        data: {
          url: result.secure_url,
          publicId: result.public_id,
          format: result.format,
          resourceType: result.resource_type,
          size: result.bytes,
          createdAt: result.created_at,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Upload failed',
      };
    }
  }

  /**
   * Upload an image with image-specific optimizations
   * @param {Buffer|string} image - Image buffer or base64 string
   * @param {Object} options - Additional upload options
   * @returns {Promise<Object>} Upload response
   */
  async uploadImage(image, options = {}) {
    const imageOptions = {
      folder: 'images',
      transformation: [
        { quality: 'auto:best' }, // Automatic quality optimization
        { fetch_format: 'auto' }, // Automatic format optimization
      ],
      ...options,
    };

    return this.uploadFile(image, imageOptions);
  }

  /**
   * Upload a PDF document
   * @param {Buffer|string} pdf - PDF buffer or base64 string
   * @param {Object} options - Additional upload options
   * @returns {Promise<Object>} Upload response
   */
  async uploadPDF(pdf, options = {}) {
    const pdfOptions = {
      folder: 'pdfs',
      resource_type: 'auto', // Changed from 'raw' to 'auto'
      format: 'pdf',
      flags: 'attachment', // Ensures browser displays PDF instead of downloading
      transformation: [
        { flags: "attachment" }
      ],
      ...options,
    };

    try {
      const fileToUpload = pdf instanceof Buffer 
        ? pdf 
        : this.convertBase64ToBuffer(pdf);

      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          pdfOptions,
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        uploadStream.end(fileToUpload);
      });

      // Transform the URL to ensure PDF viewing
      const viewerUrl = result.secure_url.replace('/upload/', '/upload/fl_attachment/');

      return {
        success: true,
        data: {
          url: viewerUrl,
          publicId: result.public_id,
          format: 'pdf',
          resourceType: result.resource_type,
          size: result.bytes,
          createdAt: result.created_at,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'PDF upload failed',
      };
    }
  }
  /**
   * Delete a file from Cloudinary
   * @param {string} publicId - Public ID of the file to delete
   * @param {Object} options - Delete options
   * @returns {Promise<Object>} Deletion response
   */
  async deleteFile(publicId, options = {}) {
    try {
      const result = await cloudinary.uploader.destroy(publicId, options);
      return {
        success: result.result === 'ok',
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Deletion failed',
      };
    }
  }

  /**
   * Convert base64 string to Buffer
   * @param {string} base64String - Base64 encoded string
   * @returns {Buffer} Converted buffer
   */
  convertBase64ToBuffer(base64String) {
    // Remove data URI prefix if present
    const base64Data = base64String.replace(/^data:.*?;base64,/, '');
    return Buffer.from(base64Data, 'base64');
  }
}

export default new CloudinaryService();


