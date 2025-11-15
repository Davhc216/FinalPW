import express from 'express';
import { 
  getPrestamos, 
  getPrestamoById, 
  createPrestamo, 
  updatePrestamo, 
  aprobarPrestamo,
  rechazarPrestamo 
} from '../controllers/prestamos.controller.js';

const router = express.Router();

router.get('/', getPrestamos);
router.get('/:id', getPrestamoById);
router.post('/', createPrestamo);
router.put('/:id', updatePrestamo);
router.put('/:id/aprobar', aprobarPrestamo);
router.put('/:id/rechazar', rechazarPrestamo);

export default router;

