import { Request, Response, NextFunction } from 'express';
import { StockAdjustment } from '../models/StockAdjustment';
import { Stock } from '../models/Stock';
import { AppError } from '../utils/AppError';
import { getNextDocumentNumber, validateAdjustment } from '../services/stock.service';

export const getAdjustments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 20, product, warehouse } = req.query;
    const filter: any = {};
    if (product) filter.product = product;
    if (warehouse) filter.warehouse = warehouse;

    const total = await StockAdjustment.countDocuments(filter);
    const adjustments = await StockAdjustment.find(filter)
      .populate('product', 'name sku unitOfMeasure')
      .populate('warehouse', 'name code')
      .populate('location', 'name')
      .populate('createdBy', 'name')
      .populate('validatedBy', 'name')
      .sort({ createdAt: -1 })
      .skip((+page - 1) * +limit)
      .limit(+limit);

    res.status(200).json({
      success: true, data: adjustments,
      pagination: { page: +page, limit: +limit, total, pages: Math.ceil(total / +limit) }
    });
  } catch (error) { next(error); }
};

export const getAdjustment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adj = await StockAdjustment.findById(req.params.id)
      .populate('product', 'name sku unitOfMeasure')
      .populate('warehouse', 'name code')
      .populate('location', 'name type')
      .populate('createdBy validatedBy', 'name email');
    if (!adj) return next(new AppError('Adjustment not found', 404, 'NOT_FOUND'));
    res.status(200).json({ success: true, data: adj });
  } catch (error) { next(error); }
};

export const createAdjustment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { product, warehouse, location, countedQuantity, reason } = req.body;

    // Get current stock to set recordedQuantity
    const currentStock = await Stock.findOne({ product, warehouse, location });
    const recordedQuantity = currentStock ? currentStock.quantity : 0;
    const difference = countedQuantity - recordedQuantity;

    const adjustmentNumber = await getNextDocumentNumber('adjustment');
    const adjustment = await StockAdjustment.create({
      adjustmentNumber,
      product,
      warehouse,
      location,
      recordedQuantity,
      countedQuantity,
      difference,
      reason,
      createdBy: (req.user as any)._id,
    });

    await adjustment.populate('product warehouse location');
    res.status(201).json({ success: true, data: adjustment, message: 'Adjustment created' });
  } catch (error) { next(error); }
};

export const validateAdjustmentController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adjustment = await validateAdjustment(req.params.id as string, (req.user as any)._id.toString());
    res.status(200).json({ success: true, data: adjustment, message: 'Adjustment validated — stock updated' });
  } catch (error) { next(error); }
};

