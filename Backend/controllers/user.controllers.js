import userModel from "../models/user.models.js";
import departmentModels from "../models/department.models.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


async function addUser(req, res) {
    const { name, email, password, phoneNumber, city, state, college, departmentName, startDate, endDate } = req.body;

    try {
        const existingUser = await userModel.findOne({ email: email });
        if (existingUser) {
            return res
                .status(400)
                .json({ status: "failed", message: "Email already exists" });
        }

        // Validate that all fields contain data
        if (!name || !email || !phoneNumber || !password || !city || !state || !college || !departmentName || !startDate || !endDate) {
            return res
                .status(400)
                .json({ status: "failed", message: "All fields are required" });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);
        // finding the departmentId based on the department name
        const department = await departmentModels.findOne({ name: departmentName });
        // Check if the department exsist or not
        if (!department) {
            return res
                .status(400)
                .json({ status: "failed", message: "Invalid department name" });
        }
        const departmentId = department._id;

        // Creating a new user Document
        const newUser = new userModel({
            name: name,
            email: email,
            password: hashPassword,
            phoneNumber: phoneNumber,
            college: college,
            city: city,
            state: state,
            departmentName: departmentName,
            departmentId: departmentId,
            startDate: startDate,
            endDate: endDate
        })
        // Save the new user to the database
        const savedUser = await newUser.save();

        // Optionally, generate JWT token
        const token = await jwt.sign(
            { userID: savedUser._id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "5d" }
        );
        const userId = savedUser._id;

        // Setting the authToken cookie 
        return res.cookie('authToken', token, {
            httpOnly: true,
            // secure: process.env.NODE_ENV==='production',
            maxAge: 5 * 24 * 60 * 1000,
            sameSite: 'strict'
        });
        // Send response with user data and token
        // const testCookie = req.cookies.authToken;
        // return res.status(201).json({ status: "success", user: savedUser, token, testCookie });
    } catch (error) {
        console.error("Error registering user:", error);
        return res.status(500).json({ status: "failed", message: "Unable to register" });
    }
};
async function login(req, res) {
    try {
        const { email, password } = req.body;
        if (email && password) {
            const user = await userModel.findOne({ email: email });
            if (user) {
                const isMatch = await bcrypt.compare(password, user.password);
                if (isMatch) {
                    // Now generate JWT
                    const token = jwt.sign(
                        { userID: user._id },
                        process.env.JWT_SECRET_KEY,
                        { expiresIn: "5d" }
                    );
                    return res.cookie('authToken', token, {
                        httpOnly: true,
                        // secure: process.env.NODE_ENV==='production',
                        maxAge: 5 * 24 * 60 * 1000,
                        sameSite: 'strict'
                    });
                } else {
                    return res.send({ status: "failed", message: "Invalid email or password" });
                }
            } else {
                return res.send({ status: "failed", message: "You are not registered" });
            }
        } else {
            return res.send({ status: "failed", message: "All fields are required" });
        }
    } catch (error) {
        return res.send({ status: "failed", message: "Unable to login" });
    }
};

async function changeUserPassword(req, res) {
    const { password, cpassword } = req.body;
    if (password && cpassword) {
        if (password === cpassword) {
            const salt = await bcrypt.genSalt(10);
            const newHashPassword = await bcrypt.hash(password, salt);
            await userModel.findByIdAndUpdate(req.user._id, {
                $set: { password: newHashPassword },
            });
            res.send({ status: "200", message: "Change password successfully" });
        } else {
            res.send({
                status: "failed",
                message: "Password and confirm password not matched",
            });
        }
    } else {
        res.send({ status: "failed", message: "All fields are required" });
    }
}

async function sendEmailResetPassword(req, res) {
    const { email } = req.body;
    if (email) {
        const user = await userModel.findOne({ email: email });
        if (user) {
            const secret = user._id + process.env.JWT_SECRET_KEY;
            const token = jwt.sign({ userID: user._id }, secret, { expiresIn: "1d" });
            const link = `http://127.0.0.1:3000/api/user/reset/${user._id}/${token}`;
            console.log(link, "starting token");
            res.send({ status: "success", message: "Email sent successfully" });
        } else {
            res.send({ status: "failed", message: "Email does not exist" });
        }
    } else {
        res.send({ status: "failed", message: "Email is required" });
    }
};

async function userPasswordReset(req, res) {
    const { password, cpassword } = req.body;
    const { id, token } = req.params;
    const user = await userModel.findById(id);
    const new_secret = user._id + process.env.JWT_SECRET_KEY;
    try {
        console.log(token, "xxxxx", new_secret);
        jwt.verify(token, new_secret);
        if (password && cpassword) {
            if (password === cpassword) {
                const salt = await bcrypt.genSalt(10);
                const newHashPassword = await bcrypt.hash(password, salt);
                await userModal.findByIdAndUpdate(id, {
                    $set: { password: newHashPassword },
                });
                res.send({ status: "200", message: "Password reset successfully" });
            } else {
                res.send({ status: "failed", message: "Passwords do not match" });
            }
        }
    } catch (error) {
        res.send({ status: "failed", message: "Token does not match" });
    }
};

export {
    addUser,
    login,
    changeUserPassword,
    sendEmailResetPassword,
    userPasswordReset
};