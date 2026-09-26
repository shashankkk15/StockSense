import { Request, Response, NextFunction } from 'express';
import { Product } from '../models/Product';
import { Stock } from '../models/Stock';
import { AppError } from '../utils/AppError';

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 20, search, category, status } = req.query;
    const filter: any = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) filter.category = category;
    if (status === 'active') filter.isActive = true;
    if (status === 'inactive') filter.isActive = false;

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .populate('category', 'name')
      .sort({ name: 1 })
      .skip((+page - 1) * +limit)
      .limit(+limit);

    res.status(200).json({
      success: true,
      data: products,
      pagination: { page: +page, limit: +limit, total, pages: Math.ceil(total / +limit) },
    });
  } catch (error) { next(error); }
};

export const getProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name');
    if (!product) return next(new AppError('Product not found', 404, 'NOT_FOUND'));

    // Get stock breakdown by location
    const stockBreakdown = await Stock.find({ product: product._id })
      .populate('warehouse', 'name code')
      .populate('location', 'name type');

    res.status(200).json({ success: true, data: { product, stockBreakdown } });
  } catch (error) { next(error); }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, sku, category, unitOfMeasure, description, minStockThreshold, reorderLevel } = req.body;
    const existing = await Product.findOne({ sku: sku.toUpperCase() });
    if (existing) return next(new AppError('SKU already exists', 409, 'DUPLICATE_SKU'));

    const product = await Product.create({ name, sku, category, unitOfMeasure, description, minStockThreshold, reorderLevel });
    await product.populate('category', 'name');
    res.status(201).json({ success: true, data: product, message: 'Product created' });
  } catch (error) { next(error); }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, category, unitOfMeasure, description, minStockThreshold, reorderLevel, isActive } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, category, unitOfMeasure, description, minStockThreshold, reorderLevel, isActive },
      { new: true, runValidators: true }
    ).populate('category', 'name');

    if (!product) return next(new AppError('Product not found', 404, 'NOT_FOUND'));
    res.status(200).json({ success: true, data: product, message: 'Product updated' });
  } catch (error) { next(error); }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return next(new AppError('Product not found', 404, 'NOT_FOUND'));
    if (product.totalStock > 0) {
      return next(new AppError('Cannot delete product with existing stock', 400, 'PRODUCT_HAS_STOCK'));
    }
    product.isActive = false;
    await product.save();
    res.status(200).json({ success: true, message: 'Product deactivated' });
  } catch (error) { next(error); }
};
