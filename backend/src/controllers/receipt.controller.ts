import { Request, Response, NextFunction } from 'express';
import { Receipt } from '../models/Receipt';
import { AppError } from '../utils/AppError';
import { getNextDocumentNumber, validateReceipt } from '../services/stock.service';
import mongoose from 'mongoose';

export const getReceipts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 20, status, supplier, warehouse } = req.query;
    const filter: any = {};
    if (status) filter.status = status;
    if (supplier) filter.supplier = supplier;
    if (warehouse) filter.warehouse = warehouse;

    const total = await Receipt.countDocuments(filter);
    const receipts = await Receipt.find(filter)
      .populate('supplier', 'name')
      .populate('warehouse', 'name code')
      .populate('location', 'name')
      .populate('createdBy', 'name')
      .populate('items.product', 'name sku unitOfMeasure')
      .sort({ createdAt: -1 })
      .skip((+page - 1) * +limit)
      .limit(+limit);

    res.status(200).json({
      success: true, data: receipts,
      pagination: { page: +page, limit: +limit, total, pages: Math.ceil(total / +limit) }
    });
  } catch (error) { next(error); }
};

export const getReceipt = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const receipt = await Receipt.findById(req.params.id)
      .populate('supplier', 'name email phone')
      .populate('warehouse', 'name code')
      .populate('location', 'name type')
      .populate('createdBy', 'name email')
      .populate('validatedBy', 'name email')
      .populate('items.product', 'name sku unitOfMeasure');
    if (!receipt) return next(new AppError('Receipt not found', 404, 'NOT_FOUND'));
    res.status(200).json({ success: true, data: receipt });
  } catch (error) { next(error); }
};

export const createReceipt = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const receiptNumber = await getNextDocumentNumber('receipt');
    const receipt = await Receipt.create({
      ...req.body,
      receiptNumber,
      createdBy: (req.user as any)._id,
    });
    await receipt.populate('supplier warehouse location items.product');
    res.status(201).json({ success: true, data: receipt, message: 'Receipt created' });
  } catch (error) { next(error); }
};

export const updateReceipt = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const receipt = await Receipt.findById(req.params.id);
    if (!receipt) return next(new AppError('Receipt not found', 404, 'NOT_FOUND'));
    if (['done', 'canceled'].includes(receipt.status)) {
      return next(new AppError('Cannot edit a completed or canceled receipt', 400, 'DOCUMENT_NOT_EDITABLE'));
    }
    const updated = await Receipt.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('supplier warehouse location items.product');
    res.status(200).json({ success: true, data: updated });
  } catch (error) { next(error); }
};

export const validateReceiptController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const receipt = await validateReceipt(req.params.id as string, req.body.items, (req.user as any)._id.toString());
    res.status(200).json({ success: true, data: receipt, message: 'Receipt validated — stock updated' });
  } catch (error) { next(error); }
};

export const cancelReceipt = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const receipt = await Receipt.findById(req.params.id);
    if (!receipt) return next(new AppError('Receipt not found', 404, 'NOT_FOUND'));
    if (receipt.status === 'done') return next(new AppError('Cannot cancel a completed receipt', 400, 'INVALID_STATUS'));
    if (receipt.status === 'canceled') return next(new AppError('Receipt is already canceled', 400, 'INVALID_STATUS'));
    receipt.status = 'canceled';
    await receipt.save();
    res.status(200).json({ success: true, message: 'Receipt canceled' });
  } catch (error) { next(error); }
};

