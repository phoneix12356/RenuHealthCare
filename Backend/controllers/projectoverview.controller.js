
import projectoverviewModels from "../models/projectoverview.models.js";

// Helper function to validate request body
const validateFields = (body, requiredFields) => {
  return requiredFields.every(field => !!body[field]);
};

// Add Project
const addProject = async (req, res) => {
  try {
    const { departmentName, overview, procedure, duration } = req.body;

    // Validate required fields
    if (!validateFields(req.body, ['departmentName', 'overview', 'procedure'])) {
      return res.status(400).json({ error: "Required fields missing" });
    }

    const newProject = new projectoverviewModels({
      departmentName,
      overview,
      procedure,
      duration: duration || 3 // Use default if not provided
    });

    const savedProject = await newProject.save();
    return res.status(201).json(savedProject);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
};

// Get Project
const getProject = async (req, res) => {
  try {
    const { overview } = req.body;

    if (!overview) {
      return res.status(400).json({ error: "Overview is required" });
    }

    const project = await projectoverviewModels.findOne({ overview });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    return res.status(200).json(project);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
};

// Update Project
const updateProject = async (req, res) => {
  try {
    const {
      overview,
      internshipType,
      startDate,
      endDate,
      projectDeadline,
      procedure,
      departmentName
    } = req.body;

    // Validate required fields
    if (!validateFields(req.body, [
      'overview',
      'internshipType',
      'startDate',
      'endDate',
      'projectDeadline',
      'procedure',
      'departmentName'
    ])) {
      return res.status(400).json({ error: "Required fields missing" });
    }

    const updatedProject = await projectoverviewModels.findOneAndUpdate(
      { overview },
      {
        $set: {
          internshipType,
          startDate,
          endDate,
          projectDeadline,
          procedure,
          departmentName
        }
      },
      { new: true } // Return updated document
    );

    if (!updatedProject) {
      return res.status(404).json({ error: "Project not found" });
    }

    return res.status(200).json(updatedProject);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
};

// Delete Project
const deleteProject = async (req, res) => {
  try {
    const { overview } = req.body;

    if (!overview) {
      return res.status(400).json({ error: "Overview is required" });
    }

    const deletedProject = await projectoverviewModels.findOneAndDelete({ overview });

    if (!deletedProject) {
      return res.status(404).json({ error: "Project not found" });
    }

    return res.status(200).json({ message: "Project deleted successfully" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
};

export { addProject, getProject, updateProject, deleteProject };
