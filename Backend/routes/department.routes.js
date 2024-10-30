import express from 'express';

const router = express.Router();

router.get('/',(req,res)=>{console.log('hello Department')});

export default router;