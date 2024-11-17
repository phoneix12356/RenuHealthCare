import express from 'express';
import { addDept, deleteDepartment, getDepartment, updateDepartment } from '../controllers/department.controller.js';
const router = express.Router();

router.post('/', (req, res) => { addDept(req, res); console.log('Added Department') });

router.get('/', (req, res) => { getDepartment(req, res); console.log('Fetched Department') });

router.put('/', (req, res) => { updateDepartment(req, res); console.log('Updated Department') });

router.delete('/', (req, res) => { deleteDepartment(req, res); console.log('Deleted Department') });


export default router;