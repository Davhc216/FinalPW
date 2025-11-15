import express from 'express';
import { 
  getTransacciones, 
  getTransaccionById, 
  createDeposito, 
  createRetiro, 
  createTransferencia 
} from '../controllers/transacciones.controller.js';

const router = express.Router();

router.get('/', getTransacciones);
router.get('/:id', getTransaccionById);
router.post('/deposito', createDeposito);
router.post('/retiro', createRetiro);
router.post('/transferencia', createTransferencia);

export default router;

