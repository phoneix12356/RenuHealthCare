import departmentModels from "../models/department.models.js";


const addDept = async (req, res) => {
    try {
        const { departmentName, taskId, projectoverviewId } = req.body;
        if (!departmentName) {
            res.status(400).json({ Error: "Department Name not found" });
        }
        const dept = await departmentModels.findOne({ name: departmentName });
        if (dept) {
            return res.status(409).json({ Error: "Department Already Exists" });
        }
        const department = new departmentModels({
            name: departmentName, // Pass the name from the request body
        });
        const savedDepartment = await department.save();
        return res.status(201).json(savedDepartment);
    } catch (error) {
        return res.status(400).json({ Error: error.message });
        console.log(error);
    }
}

const getDepartment = async (req, res) => {
    try {
        const { departmentName } = req.body;
        if (!departmentName) {
            res.status(400).json({ Error: "Department Name not found" });
        }
        const findDepartment = await departmentModels.findOne({ name: departmentName });
        if (!findDepartment) {
            res.status(404).json({ Error: "Department Not Found" });
        }
        else {
            res.status(200).json(findDepartment);
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
        console.log(error);
    }
}

const updateDepartment = async (req, res) => {
    try {
        const { departmentName, taskId, projectoverviewId } = req.body;
        if (!departmentName) {
            res.status(400).json({ Error: "Department Name not found" });
        }
        const findDept = { name: departmentName };
        const findDepartment = await departmentModels.findOne(findDept);
        if (findDepartment) {
            let updateDept = { taskId: taskId, projectoverviewId: projectoverviewId };
            await departmentModels.findOneAndUpdate(findDept, updateDept);
            res.status(201).json(findDepartment);
        }
        else {
            res.status(404).json({ Error: "Department Not Found" });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
        console.log(error);
    }
}

const deleteDepartment = async (req, res) => {
    try {
        const { departmentName } = req.body;
        if (!departmentName) {
            res.status(400).json({ Error: "Department Name not found" });
        }
        const deptName = { name: departmentName };
        const findDept = await departmentModels.findOne(deptName);
        if (findDept) {
            const isDeleted = await departmentModels.findOneAndDelete(deptName);
            if (isDeleted) {
                res.status(200).json("Department Deleted Successfully");
            }
        }
        else {
            res.status(404).json({ Error: "Department Not Found" });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
        console.log(error);
    }
}

export {
    addDept,
    getDepartment,
    updateDepartment,
    deleteDepartment
};