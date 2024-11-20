import iccModel from "../models/icc.models.js";
import offerletterModel from "../models/offerLetter.models.js";
import InternshipOfferLetterGenerator from "../utils/offerLetterGenerator.js";
import InternshipCompletionCertificateGenerator from "../utils/iccGenerator.js";
// import sendMail from "../Util/mailer.js";

// Generate Offer Letter
const GenerateOfferLetter = async (paramater) => {
  try {
    const { name, email, startDate, endDate, departmentName } = paramater;
    console.log("GenerateOfferLetter", paramater);
    // Generate PDF buffer
    const internshipOfferGenerator = new InternshipOfferLetterGenerator();

    // Generate offer letter with candidate details
    const pdfBuffer =
      await internshipOfferGenerator.generateInternshipOfferLetter(paramater);
    console.log("pdfBuffer", pdfBuffer);

    const existingUser = await offerletterModel.findOne({ email });
    if (existingUser && existingUser.pdfBuffer) {
      console.log(
        `Offer letter already generated for user: ${name} (${email})`
      );
      return { message: "Offer letter already exists", status: "success" };
    }

    if (existingUser) {
      existingUser.pdfBuffer = pdfBuffer;
      await existingUser.save();
      console.log(
        `Offer letter updated successfully for user: ${name} (${email})`
      );
      return {
        message: "Offer letter updated successfully",
        status: "success",
      };
    }

    // // Create a new offer letter record
    const newOfferLetter = new offerletterModel({
      name,
      email,
      startDate,
      endDate,
      departmentName,
      tenure: 3,
      pdfBuffer: pdfBuffer,
    });
    await newOfferLetter.save();
    console.log(
      `Offer letter generated successfully for user: ${name} (${email})`
    );
    return {
      message: "Offer letter generated successfully",
      status: "success",
    };
  } catch (err) {
    console.error("Error in GenerateOfferLetter:", err.message);
    return {
      message: "Error generating offer letter",
      error: err.message,
      status: "error",
    };
  }
};

const GenerateICC = async (req, res) => {
  try {
    const { name, email } = req.body;

    console.log("icc controller", req.body);
    const iccGenerator = new InternshipCompletionCertificateGenerator();
    const pdfBuffer = await iccGenerator.generateCompletionCertificate(
      req.body
    );

    const user = await iccModel.findOne({ email });
    if (user && user.pdfBuffer) {
      return res.status(200).json({
        message: `ICC is already generated for this user: ${name} (${email})`,
      });
    }

    if (user) {
      user.pdfBuffer = pdfBuffer;
      await user.save();
    } else {
      const icc = new iccModel({
        ...req.body,
        departmentName: req.body.department,
        tenure: 3,
        pdfBuffer,
      });
      await icc.save();
    }
    return res
      .status(200)
      .json({ message: "ICC letter generation successful" });
  } catch (err) {
    console.error("Error in GenerateICC:", err.message);
    return res.status(500).json({ error: err.message });
  }
};

// // Generate LOR

// // Download Offer Letter
export const downloadOfferLetter = async (req, res) => {
  try {
    const { email } = req.query;
    const employee = await offerletterModel.findOne({ email });
    if (!employee || !employee.pdfBuffer) {
      return res.status(404).json({ error: "Offer letter not found" });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${employee.name}_Offer_Letter.pdf`
    );
    console.log(employee.name);
    const subject = "Welcome to RenuHealthCare - Your Offer Letter Inside";

    // sendMail("offerletter", employee.name, subject, email);
    return res.status(200).send(employee.pdfBuffer);
  } catch (err) {
    console.error("Error in downloadOfferLetter:", err.message);
    return res.status(500).json({ error: err.message });
  }
};

// // Download ICC Letter
const downloadICC = async (req, res) => {
  try {
    const { email } = req.query;
    console.log(email);
    const employee = await iccModel.findOne({ email });
    console.log(employee);
    if (!employee || !employee.pdfBuffer) {
      return res.status(404).json({ error: "ICC not found" });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${employee.name}_Internship_Completion_Certificate.pdf`
    );
    const subject =
      "Congratulations on Completing Your Internship at RenuHealthCare";

    // sendMail("iccCertificate", employee.name, subject, email);

    return res.status(200).send(employee.pdfBuffer);
  } catch (err) {
    console.error("Error in downloadICC:", err.message);
    return res.status(500).json({ error: err.message });
  }
};

export { GenerateOfferLetter, GenerateICC, downloadICC };
