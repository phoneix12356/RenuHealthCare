import departmentModels from "../models/department.models.js";
import taskModels from "../models/task.models.js";
import projectoverviewModels from "../models/projectoverview.models.js";

const addDept = async (req, res) => {
   try {
     const { departmentName } = req.body;
     
     if (!departmentName) {
       return res.status(400).json({ error: "Department Name is required" });
     }

     const existingDept = await departmentModels.findOne({ name: departmentName });
     if (existingDept) {
       return res.status(409).json({ error: "Department Already Exists" });
     }

     const taskId = await taskModels.findOne({ departmentName });
     const projectId = await projectoverviewModels.findOne({ departmentName });

     const department = new departmentModels({
       name: departmentName,
       taskId: taskId ? taskId._id : null,
       projectId: projectId ? projectId._id : null
     });

     const savedDepartment = await department.save();
     return res.status(201).json(savedDepartment);
   } catch (error) {
     console.error(error);
     return res.status(500).json({ error: "Internal Server Error" });
   }
};

const getDepartment = async (req, res) => {
   try {
     const { departmentName } = req.body;
     
     if (!departmentName) {
       return res.status(400).json({ error: "Department Name is required" });
     }

     const findDepartment = await departmentModels.findOne({ name: departmentName })
       .populate("projectId")
       .populate("taskId");

     if (!findDepartment) {
       return res.status(404).json({ error: "Department Not Found" });
     }

     return res.status(200).json(findDepartment);
   } catch (error) {
     console.error(error);
     return res.status(500).json({ error: "Internal Server Error" });
   }
};

const updateDepartment = async (req, res) => {
   try {
     const { departmentName, taskId, projectoverviewId } = req.body;
     
     if (!departmentName) {
       return res.status(400).json({ error: "Department Name is required" });
     }

     const findDepartment = await departmentModels.findOne({ name: departmentName });
     
     if (!findDepartment) {
       return res.status(404).json({ error: "Department Not Found" });
     }

     const updateDept = { 
       taskId: taskId || findDepartment.taskId,
       projectoverviewId: projectoverviewId || findDepartment.projectId
     };

     const updatedDepartment = await departmentModels.findOneAndUpdate(
       { name: departmentName }, 
       updateDept, 
       { new: true }
     );

     return res.status(200).json(updatedDepartment);
   } catch (error) {
     console.error(error);
     return res.status(500).json({ error: "Internal Server Error" });
   }
};

const deleteDepartment = async (req, res) => {
   try {
     const { departmentName } = req.body;
     
     if (!departmentName) {
       return res.status(400).json({ error: "Department Name is required" });
     }

     const findDept = await departmentModels.findOne({ name: departmentName });
     
     if (!findDept) {
       return res.status(404).json({ error: "Department Not Found" });
     }

     await departmentModels.findOneAndDelete({ name: departmentName });
     return res.status(200).json({ message: "Department Deleted Successfully" });
   } catch (error) {
     console.error(error);
     return res.status(500).json({ error: "Internal Server Error" });
   }
};

export { addDept, getDepartment, updateDepartment, deleteDepartment };