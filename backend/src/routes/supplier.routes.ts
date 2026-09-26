import { Router } from 'express';
import * as supController from '../controllers/supplier.controller';
import { protect } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();
router.use(protect);

// Suppliers
const supplierRouter = Router();
supplierRouter.get('/', supController.getSuppliers);
supplierRouter.post('/', requireRole('inventory_manager'), supController.createSupplier);
supplierRouter.put('/:id', requireRole('inventory_manager'), supController.updateSupplier);
supplierRouter.delete('/:id', requireRole('inventory_manager'), supController.deleteSupplier);

// Customers
const customerRouter = Router();
customerRouter.get('/', supController.getCustomers);
customerRouter.post('/', requireRole('inventory_manager'), supController.createCustomer);
customerRouter.put('/:id', requireRole('inventory_manager'), supController.updateCustomer);
customerRouter.delete('/:id', requireRole('inventory_manager'), supController.deleteCustomer);

export { supplierRouter, customerRouter };
