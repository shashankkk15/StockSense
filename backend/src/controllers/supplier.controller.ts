import { Request, Response, NextFunction } from 'express';
import { Supplier } from '../models/Supplier';
import { Customer } from '../models/Customer';
import { AppError } from '../utils/AppError';

// Suppliers
export const getSuppliers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const suppliers = await Supplier.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json({ success: true, data: suppliers });
  } catch (error) { next(error); }
};

export const createSupplier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const supplier = await Supplier.create(req.body);
    res.status(201).json({ success: true, data: supplier, message: 'Supplier created' });
  } catch (error) { next(error); }
};

export const updateSupplier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!supplier) return next(new AppError('Supplier not found', 404, 'NOT_FOUND'));
    res.status(200).json({ success: true, data: supplier });
  } catch (error) { next(error); }
};

export const deleteSupplier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await Supplier.findByIdAndUpdate(req.params.id, { isActive: false });
    res.status(200).json({ success: true, message: 'Supplier deleted' });
  } catch (error) { next(error); }
};

// Customers
export const getCustomers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customers = await Customer.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json({ success: true, data: customers });
  } catch (error) { next(error); }
};

export const createCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customer = await Customer.create(req.body);
    res.status(201).json({ success: true, data: customer, message: 'Customer created' });
  } catch (error) { next(error); }
};

export const updateCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!customer) return next(new AppError('Customer not found', 404, 'NOT_FOUND'));
    res.status(200).json({ success: true, data: customer });
  } catch (error) { next(error); }
};

export const deleteCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await Customer.findByIdAndUpdate(req.params.id, { isActive: false });
    res.status(200).json({ success: true, message: 'Customer deleted' });
  } catch (error) { next(error); }
};
