import express from 'express';
import { body, validationResult } from 'express-validator';
import * as user from "../controllers/user.controllers.js";
const router = express.Router();

router.post('/', [
    body("name").notEmpty(),
    body("email").isEmail(),
    body("password").isLength({ min: 5 }),
    body("phoneNumber").notEmpty(),
    body("college").notEmpty(),
    body("city").notEmpty(),
    body("state").notEmpty(),
    body("departmentName").notEmpty(),
    body("startDate").isDate(),
    body("endDate").isDate()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
    }
    try {
        await user.addUser(req, res);
    } catch (error) {
        console.log(error);
    }
});

router.post("/login", [
    body("email").isEmail(),
    body("password").isLength({ min: 5 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
    }
    try {
        await user.login(req, res);
    } catch (error) {
        console.log(error);
    }
});

router.post("/changepassword", [
    body("email").isEmail(),
    body("password").isLength({ min: 5 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
    }
    try {
        await user.login(req, res);
    } catch (error) {
        console.log(error);
    }
});

router.post("/send-reset-password", user.sendEmailResetPassword);
router.post("/reset/password/:id/:token", user.userPasswordReset);
router.post("/changepassword", user.changeUserPassword);
export default router;