import projectoverviewModels from "../models/projectoverview.models.js";

const addproject = async (req, res) => {
    try {
        const { overview, internshipType, startDate, endDate, projectDeadline, procedure } = req.body;
        if (!overview || !internshipType || !startDate || !endDate || !projectDeadline || !procedure) {
            return res.status(400).json({ Error: "Request is Incomplete" });
        }
        const newproject = new projectoverviewModels({
            overview: overview,
            internshipType: internshipType,
            startDate: startDate,
            endDate: endDate,
            projectDeadline: projectDeadline,
            procedure: procedure
        });
        await newproject.save(newproject);
        const projectname = {overview: newproject.overview};
        const foundProject = await projectoverviewModels.find(projectname);
        return res.status(201).json(foundProject);
    } catch (error) {
        return res.status(500).json({ Error: error.message });
        console.log(error);
    }
};
const getproject = async (req, res) => {
    try {
        const { overview, internshipType, startDate, endDate, projectDeadline, procedure } = req.body;
        if (!overview || !internshipType || !startDate || !endDate || !endDate || !projectDeadline || !procedure) {
            return res.status(400).json({ Error: "Request is Incomplete" });
        }
        const findproject = await projectoverviewModels.findOne({ overview: overview });
        if (!findproject) {
            return res.status(404).json({ Error: "Project not found" });
        }
        res.status(200).json(findproject);
    } catch (error) {
        return res.status(500).json({ Error: error.message });
        console.log(error);
    }
};
const updateproject = async (req, res) => {
    try {
        const { overview, internshipType, startDate, endDate, projectDeadline, procedure } = req.body;
        if (!overview || !internshipType || !startDate || !endDate || !projectDeadline || !procedure) {
            return res.status(400).json({ Error: "Request is Incomplete" });
        }
        const findproject = await projectoverviewModels.findOne({ overview: overview });
        if (!findproject) {
            return req.status(404).json({ Error: "Project Not Found" });
        }
        const updatedproject = {
            overview: overview,
            internshipType: internshipType,
            startDate: startDate,
            endDate: endDate,
            projectDeadline: projectDeadline,
            procedure: procedure
        };
        const projectUpdate = await projectoverviewModels.findOneAndUpdate({ overview: overview }, updatedproject);
        return res.status(300).json(await projectoverviewModels.findOne({ overview: overview }));
    } catch (error) {
        return res.status(500).json({ Error: error.message });
        console.log(error);
    }
};
const deleteproject = async (req, res) => {
    try {
        const { overview, internshipType, startDate, endDate, projectDeadline, procedure } = req.body;
        if (!overview || !internshipType || !startDate || !endDate || !projectDeadline || !procedure) {
            return res.status(400).json({ Error: "Request is Incomplete" });
        }
        const findproject = projectoverviewModels.findOne({ overview: overview });
        if (!findproject) {
            return res.status(404).json({ Error: "Project Not Found" });
        }
        await projectoverviewModels.findOneAndDelete({ overview: overview });
        return res.status(201).json({ Status: "Project Deleted Successfully" });
    } catch (error) {
        return res.status(500).json({ Error: error.message });
        console.log(error);
    }
};


export {
    addproject,
    getproject,
    updateproject,
    deleteproject
};