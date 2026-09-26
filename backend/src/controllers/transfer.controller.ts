import { Request, Response, NextFunction } from 'express';
import { Transfer } from '../models/Transfer';
import { AppError } from '../utils/AppError';
import { getNextDocumentNumber, validateTransfer } from '../services/stock.service';

export const getTransfers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter: any = {};
    if (status) filter.status = status;

    const total = await Transfer.countDocuments(filter);
    const transfers = await Transfer.find(filter)
      .populate('sourceWarehouse', 'name code')
      .populate('sourceLocation', 'name')
      .populate('destinationWarehouse', 'name code')
      .populate('destinationLocation', 'name')
      .populate('createdBy', 'name')
      .populate('items.product', 'name sku unitOfMeasure')
      .sort({ createdAt: -1 })
      .skip((+page - 1) * +limit)
      .limit(+limit);

    res.status(200).json({
      success: true, data: transfers,
      pagination: { page: +page, limit: +limit, total, pages: Math.ceil(total / +limit) }
    });
  } catch (error) { next(error); }
};

export const getTransfer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transfer = await Transfer.findById(req.params.id)
      .populate('sourceWarehouse destinationWarehouse', 'name code')
      .populate('sourceLocation destinationLocation', 'name type')
      .populate('createdBy validatedBy', 'name email')
      .populate('items.product', 'name sku unitOfMeasure');
    if (!transfer) return next(new AppError('Transfer not found', 404, 'NOT_FOUND'));
    res.status(200).json({ success: true, data: transfer });
  } catch (error) { next(error); }
};

export const createTransfer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transferNumber = await getNextDocumentNumber('transfer');
    const transfer = await Transfer.create({ ...req.body, transferNumber, createdBy: (req.user as any)._id });
    res.status(201).json({ success: true, data: transfer, message: 'Transfer created' });
  } catch (error) { next(error); }
};

export const updateTransfer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transfer = await Transfer.findById(req.params.id);
    if (!transfer) return next(new AppError('Transfer not found', 404, 'NOT_FOUND'));
    if (['done', 'canceled'].includes(transfer.status)) {
      return next(new AppError('Cannot edit a completed or canceled transfer', 400, 'DOCUMENT_NOT_EDITABLE'));
    }
    const updated = await Transfer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, data: updated });
  } catch (error) { next(error); }
};

export const validateTransferController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transfer = await validateTransfer(req.params.id as string, (req.user as any)._id.toString());
    res.status(200).json({ success: true, data: transfer, message: 'Transfer validated — stock moved' });
  } catch (error) { next(error); }
};

export const cancelTransfer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transfer = await Transfer.findById(req.params.id);
    if (!transfer) return next(new AppError('Transfer not found', 404, 'NOT_FOUND'));
    if (transfer.status === 'done') return next(new AppError('Cannot cancel a completed transfer', 400, 'INVALID_STATUS'));
    if (transfer.status === 'canceled') return next(new AppError('Transfer is already canceled', 400, 'INVALID_STATUS'));
    transfer.status = 'canceled';
    await transfer.save();
    res.status(200).json({ success: true, message: 'Transfer canceled' });
  } catch (error) { next(error); }
};

