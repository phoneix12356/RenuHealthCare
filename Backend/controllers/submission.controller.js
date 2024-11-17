import Submission from "../models/submission.models.js";
import cloudinaryService from "../services/cloudinary.service.js";
import { ErrorResponse } from "../utils/errorResponse.js";

// Allowed file types
const allowedMimeTypes = ["image/png", "image/jpeg", "application/pdf"];

/**
 * Create a new submission or update an existing one.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
export const createSubmission = async (req, res, next) => {
  try {
    const { userId, departementId, weekNumber, notes, links, username } =
      req.query;

    if (!userId || !weekNumber) {
      throw new ErrorResponse("User ID and Week Number are required.", 400);
    }

    const files = [...(req.files?.files || []), ...(req.files?.images || [])];
    const filteredFiles = files.filter((file) =>
      allowedMimeTypes.includes(file.mimetype)
    );

    if (filteredFiles.length === 0) {
      throw new ErrorResponse(
        "No valid file types provided. Only PNG, JPEG, and PDF are allowed.",
        400
      );
    }

    // Upload files to Cloudinary with viewing configuration
    const uploadedFiles = await Promise.all(
      filteredFiles.map(async (file) => {
        let result;

        if (file.mimetype.startsWith("image/")) {
          result = await cloudinaryService.uploadImage(file.buffer, {
            folder: `submissions/${userId}/images`,
          });
        } else if (file.mimetype === "application/pdf") {
          result = await cloudinaryService.uploadPDF(file.buffer, {
            folder: `submissions/${userId}/pdfs`,
            public_id: `${Date.now()}_${file.originalname.replace(
              /\.[^/.]+$/,
              ""
            )}`,
          });
        }

        if (!result.success) {
          throw new ErrorResponse(
            `Failed to upload file: ${result.error}`,
            500
          );
        }

        return {
          url: result.data.url,
          format: file.mimetype.split("/")[1],
          publicId: result.data.publicId,
        };
      })
    );
    // Separate image and PDF links
    const pdfFiles = uploadedFiles.filter((file) => file.format === "pdf");
    const imageFiles = uploadedFiles.filter((file) => file.format !== "pdf");

    // Check if submission already exists for the user
    const existingSubmission = await Submission.findOne({ userId });
    if (existingSubmission) {
      // Check if submission already exists for the given week
      if (existingSubmission.completedWeek.includes(weekNumber)) {
        // Clean up uploaded files before throwing error
        await Promise.all(
          uploadedFiles.map((file) =>
            cloudinaryService.deleteFile(file.publicId)
          )
        );
        throw new ErrorResponse(
          "Submission for this week already exists.",
          400
        );
      }

      // Update existing submission
      existingSubmission.completedWeek.push(weekNumber);
      existingSubmission.images = [
        ...existingSubmission.images,
        ...imageFiles.map((file) => ({
          url: file.url,
          publicId: file.publicId,
        })),
      ];
      existingSubmission.pdf = [
        ...existingSubmission.pdf,
        ...pdfFiles.map((file) => ({
          url: file.url,
          publicId: file.publicId,
        })),
      ];
      existingSubmission.links = [...existingSubmission.links, ...links];
      existingSubmission.notes = [...existingSubmission.notes, ...notes];
      await existingSubmission.save();
    } else {
      // Create a new submission
      const newSubmission = new Submission({
        username,
        userId,
        departementId,
        completedWeek: [weekNumber],
        images: imageFiles.map((file) => ({
          url: file.url,
          publicId: file.publicId,
        })),
        pdf: pdfFiles.map((file) => ({
          url: file.url,
          publicId: file.publicId,
        })),
        links,
        notes,
      });
      await newSubmission.save();
    }

    res.status(201).json({ message: "Submission created successfully!" });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a specific submission.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
export const deleteSubmission = async (req, res, next) => {
  try {
    const { submissionId } = req.params;

    // Validation: Submission ID is required
    if (!submissionId) {
      throw new ErrorResponse("Submission ID is required.", 400);
    }

    const submission = await Submission.findById(submissionId);

    if (!submission) {
      throw new ErrorResponse("Submission not found.", 404);
    }

    // Delete files from Cloudinary
    const deletePromises = [
      ...submission.images.map((image) =>
        cloudinaryService.deleteFile(image.publicId)
      ),
      ...submission.pdf.map((pdf) =>
        cloudinaryService.deleteFile(pdf.publicId)
      ),
    ];

    await Promise.all(deletePromises);

    // Delete the submission from database
    await Submission.findByIdAndDelete(submissionId);

    res.status(200).json({ message: "Submission deleted successfully!" });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve all submissions for a specific user and week.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
export const getSubmissionsByWeek = async (req, res, next) => {
  try {
    const { userId, weekNumber } = req.query;

    // Validation: User ID and Week Number are required
    if (!userId || !weekNumber) {
      throw new ErrorResponse("User ID and Week Number are required.", 400);
    }

    const submissions = await Submission.find({
      userId,
      completedWeek: { $in: [parseInt(weekNumber, 10)] },
    });

    res.status(200).json(submissions);
  } catch (error) {
    next(error);
  }
};
