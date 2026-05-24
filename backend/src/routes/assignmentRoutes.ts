import { Router } from 'express';
import multer from 'multer';
import {
  createAssignment,
  getAssignments,
  getAssignment,
  deleteAssignment,
  regenerateAssignment
} from '../controllers/assignmentController';

const router = Router();
const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('material'), createAssignment);
router.get('/', getAssignments);
router.get('/:id', getAssignment);
router.delete('/:id', deleteAssignment);
router.post('/:id/regenerate', regenerateAssignment);

export default router;
