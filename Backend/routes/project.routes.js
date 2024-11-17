import express from 'express';
import { addproject, getproject, updateproject, deleteproject } from '../controllers/projectoverview.controller.js';
const router = express.Router();

router.get('/', (req,res)=>{getproject(req,res); console.log("Fetched Project")});
router.post('/',(req,res)=>{addproject(req,res);console.log("Added Project")});
router.put('/',(req,res)=>{updateproject(req,res); console.log("Updated Project")});
router.delete('/', (req,res)=>{deleteproject(req,res); console.log("Deleted Project")})

export default router;