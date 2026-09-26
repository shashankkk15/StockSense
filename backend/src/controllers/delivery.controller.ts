import { Request, Response, NextFunction } from 'express';
import { Delivery } from '../models/Delivery';
import { AppError } from '../utils/AppError';
import { getNextDocumentNumber, validateDelivery } from '../services/stock.service';

export const getDeliveries = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 20, status, customer, warehouse } = req.query;
    const filter: any = {};
    if (status) filter.status = status;
    if (customer) filter.customer = customer;
    if (warehouse) filter.warehouse = warehouse;

    const total = await Delivery.countDocuments(filter);
    const deliveries = await Delivery.find(filter)
      .populate('customer', 'name')
      .populate('warehouse', 'name code')
      .populate('location', 'name')
      .populate('createdBy', 'name')
      .populate('items.product', 'name sku unitOfMeasure')
      .sort({ createdAt: -1 })
      .skip((+page - 1) * +limit)
      .limit(+limit);

    res.status(200).json({
      success: true, data: deliveries,
      pagination: { page: +page, limit: +limit, total, pages: Math.ceil(total / +limit) }
    });
  } catch (error) { next(error); }
};

export const getDelivery = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const delivery = await Delivery.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('warehouse', 'name code')
      .populate('location', 'name type')
      .populate('createdBy', 'name email')
      .populate('validatedBy', 'name email')
      .populate('items.product', 'name sku unitOfMeasure');
    if (!delivery) return next(new AppError('Delivery not found', 404, 'NOT_FOUND'));
    res.status(200).json({ success: true, data: delivery });
  } catch (error) { next(error); }
};

export const createDelivery = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deliveryNumber = await getNextDocumentNumber('delivery');
    const delivery = await Delivery.create({ ...req.body, deliveryNumber, createdBy: (req.user as any)._id });
    res.status(201).json({ success: true, data: delivery, message: 'Delivery created' });
  } catch (error) { next(error); }
};

export const updateDelivery = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) return next(new AppError('Delivery not found', 404, 'NOT_FOUND'));
    if (['done', 'canceled'].includes(delivery.status)) {
      return next(new AppError('Cannot edit a completed or canceled delivery', 400, 'DOCUMENT_NOT_EDITABLE'));
    }
    const updated = await Delivery.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, data: updated });
  } catch (error) { next(error); }
};

export const validateDeliveryController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const delivery = await validateDelivery(req.params.id as string, req.body.items, (req.user as any)._id.toString());
    res.status(200).json({ success: true, data: delivery, message: 'Delivery validated — stock updated' });
  } catch (error) { next(error); }
};

export const cancelDelivery = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) return next(new AppError('Delivery not found', 404, 'NOT_FOUND'));
    if (delivery.status === 'done') return next(new AppError('Cannot cancel a completed delivery', 400, 'INVALID_STATUS'));
    if (delivery.status === 'canceled') return next(new AppError('Delivery is already canceled', 400, 'INVALID_STATUS'));
    delivery.status = 'canceled';
    await delivery.save();
    res.status(200).json({ success: true, message: 'Delivery canceled' });
  } catch (error) { next(error); }
};

