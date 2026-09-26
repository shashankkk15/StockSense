import { Request, Response, NextFunction } from 'express';
import { Warehouse } from '../models/Warehouse';
import { Location } from '../models/Location';
import { Stock } from '../models/Stock';
import { AppError } from '../utils/AppError';

export const getWarehouses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const warehouses = await Warehouse.find({ isActive: true }).sort({ name: 1 });
    const result = await Promise.all(warehouses.map(async (wh) => {
      const locationCount = await Location.countDocuments({ warehouse: wh._id, isActive: true });
      return { ...wh.toObject(), locationCount };
    }));
    res.status(200).json({ success: true, data: result });
  } catch (error) { next(error); }
};

export const getWarehouse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id);
    if (!warehouse) return next(new AppError('Warehouse not found', 404, 'NOT_FOUND'));
    const locations = await Location.find({ warehouse: warehouse._id, isActive: true }).sort({ name: 1 });
    res.status(200).json({ success: true, data: { warehouse, locations } });
  } catch (error) { next(error); }
};

export const createWarehouse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const warehouse = await Warehouse.create(req.body);
    res.status(201).json({ success: true, data: warehouse, message: 'Warehouse created' });
  } catch (error) { next(error); }
};

export const updateWarehouse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const warehouse = await Warehouse.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!warehouse) return next(new AppError('Warehouse not found', 404, 'NOT_FOUND'));
    res.status(200).json({ success: true, data: warehouse });
  } catch (error) { next(error); }
};

export const deleteWarehouse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stockExists = await Stock.exists({ warehouse: req.params.id });
    if (stockExists) return next(new AppError('Cannot delete warehouse with existing stock', 400, 'WAREHOUSE_HAS_STOCK'));
    await Warehouse.findByIdAndUpdate(req.params.id, { isActive: false });
    res.status(200).json({ success: true, message: 'Warehouse deleted' });
  } catch (error) { next(error); }
};

// Locations
export const getLocations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter: any = { isActive: true };
    if (req.query.warehouse) filter.warehouse = req.query.warehouse;
    const locations = await Location.find(filter).populate('warehouse', 'name code').sort({ name: 1 });
    res.status(200).json({ success: true, data: locations });
  } catch (error) { next(error); }
};

export const createLocation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const location = await Location.create(req.body);
    await location.populate('warehouse', 'name code');
    res.status(201).json({ success: true, data: location, message: 'Location created' });
  } catch (error) { next(error); }
};

export const updateLocation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const location = await Location.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('warehouse', 'name code');
    if (!location) return next(new AppError('Location not found', 404, 'NOT_FOUND'));
    res.status(200).json({ success: true, data: location });
  } catch (error) { next(error); }
};

export const deleteLocation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stockExists = await Stock.exists({ location: req.params.id });
    if (stockExists) return next(new AppError('Cannot delete location with existing stock', 400, 'LOCATION_HAS_STOCK'));
    await Location.findByIdAndUpdate(req.params.id, { isActive: false });
    res.status(200).json({ success: true, message: 'Location deleted' });
  } catch (error) { next(error); }
};
