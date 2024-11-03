import express from 'express';
import { addDept } from '../controllers/department.controller.js';
const router = express.Router();

router.get('/', (req, res) => { addDept(req, res); console.log('hello Department') });

export default router;