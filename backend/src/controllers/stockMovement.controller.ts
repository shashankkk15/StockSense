import { Request, Response, NextFunction } from 'express';
import { StockMovement } from '../models/StockMovement';
import { Stock } from '../models/Stock';

export const getStockMovements = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 50, product, warehouse, movementType, startDate, endDate } = req.query;
    const filter: any = {};
    if (product) filter.product = product;
    if (warehouse) filter.warehouse = warehouse;
    if (movementType) filter.movementType = movementType;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate as string);
      if (endDate) filter.createdAt.$lte = new Date(endDate as string);
    }

    const total = await StockMovement.countDocuments(filter);
    const movements = await StockMovement.find(filter)
      .populate('product', 'name sku unitOfMeasure')
      .populate('warehouse', 'name code')
      .populate('location', 'name')
      .populate('performedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((+page - 1) * +limit)
      .limit(+limit);

    res.status(200).json({
      success: true, data: movements,
      pagination: { page: +page, limit: +limit, total, pages: Math.ceil(total / +limit) }
    });
  } catch (error) { next(error); }
};

export const getStockLevels = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { product, warehouse, location } = req.query;
    const filter: any = {};
    if (product) filter.product = product;
    if (warehouse) filter.warehouse = warehouse;
    if (location) filter.location = location;

    const stocks = await Stock.find(filter)
      .populate('product', 'name sku unitOfMeasure minStockThreshold')
      .populate('warehouse', 'name code')
      .populate('location', 'name type');

    res.status(200).json({ success: true, data: stocks });
  } catch (error) { next(error); }
};

export const getProductStock = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stocks = await Stock.find({ product: req.params.productId })
      .populate('warehouse', 'name code')
      .populate('location', 'name type');
    res.status(200).json({ success: true, data: stocks });
  } catch (error) { next(error); }
};
