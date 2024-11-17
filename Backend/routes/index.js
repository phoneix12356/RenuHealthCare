import express from 'express';
import userRouter from '../routes/user.routes.js';
import departmentRouter from '../routes/department.routes.js';
import submissionRouter from '../routes/submission.routes.js';
import TaskRouter from '../routes/task.routes.js';
import ProjectRouter from '../routes/project.routes.js';

const router = express.Router();
router.use('/user', userRouter);
router.use('/department',departmentRouter);
router.use('/submission',submissionRouter);
router.use('/task', TaskRouter);
router.use('/project', ProjectRouter);

export default router;