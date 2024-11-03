import departmentModels from "../models/department.models.js";


const addDept = async (req, res) => {
    try {
        const department = new departmentModels({
            name: req.body.name,  // Pass the name from the request body
        });

        const savedDepartment = await department.save();
        res.status(201).json(savedDepartment);
    } catch (error) {
        res.status(400).json({ error: error.message });
        console.log(error);
    }
}

export { addDept };