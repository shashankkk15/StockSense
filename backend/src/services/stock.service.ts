import mongoose from 'mongoose';
import { Stock } from '../models/Stock';
import { StockMovement, MovementType } from '../models/StockMovement';
import { Product } from '../models/Product';
import { Receipt } from '../models/Receipt';
import { Delivery } from '../models/Delivery';
import { Transfer } from '../models/Transfer';
import { StockAdjustment } from '../models/StockAdjustment';
import { Notification } from '../models/Notification';
import { ReorderRule } from '../models/ReorderRule';
import { AppError } from '../utils/AppError';
import logger from '../utils/logger';

// ─── helpers ────────────────────────────────────────────────────────────────

const getCounter = async (model: mongoose.Model<any>, prefix: string) => {
  const count = await model.countDocuments();
  return `${prefix}-${String(count + 1).padStart(5, '0')}`;
};

const checkReorderRules = async (
  productId: mongoose.Types.ObjectId,
  warehouseId: mongoose.Types.ObjectId,
  session: mongoose.ClientSession
) => {
  const product = await Product.findById(productId).session(session);
  if (!product) return;

  const rule = await ReorderRule.findOne({ product: productId, isActive: true }).session(session);
  if (!rule) return;

  if (product.totalStock === 0) {
    await Notification.create([{
      type: 'out_of_stock',
      title: 'Out of Stock Alert',
      message: `${product.name} (${product.sku}) is now out of stock.`,
      product: productId,
      warehouse: warehouseId,
    }], { session });
  } else if (product.totalStock <= rule.minStock) {
    await Notification.create([{
      type: 'low_stock',
      title: 'Low Stock Alert',
      message: `${product.name} (${product.sku}) is running low. Current stock: ${product.totalStock} ${product.unitOfMeasure}.`,
      product: productId,
      warehouse: warehouseId,
    }], { session });
  }
};

// ─── validate receipt ────────────────────────────────────────────────────────

export const validateReceipt = async (
  receiptId: string,
  items: { product: string; receivedQuantity: number }[],
  userId: string
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const receipt = await Receipt.findById(receiptId).session(session);
    if (!receipt) throw new AppError('Receipt not found', 404, 'NOT_FOUND');
    if (receipt.status === 'done') throw new AppError('Receipt is already validated', 400, 'INVALID_STATUS');
    if (receipt.status === 'canceled') throw new AppError('Cannot validate a canceled receipt', 400, 'INVALID_STATUS');

    for (const item of items) {
      const productId = new mongoose.Types.ObjectId(item.product);
      const quantity = item.receivedQuantity;
      if (quantity <= 0) continue;

      // Find or create stock record
      let stock = await Stock.findOne({
        product: productId,
        warehouse: receipt.warehouse,
        location: receipt.location,
      }).session(session);

      const beforeQty = stock ? stock.quantity : 0;
      const afterQty = beforeQty + quantity;

      if (stock) {
        stock.quantity = afterQty;
        await stock.save({ session });
      } else {
        await Stock.create([{
          product: productId,
          warehouse: receipt.warehouse,
          location: receipt.location,
          quantity: afterQty,
        }], { session });
      }

      // Update product totalStock
      await Product.findByIdAndUpdate(productId, { $inc: { totalStock: quantity } }, { session });

      // Create ledger entry
      await StockMovement.create([{
        product: productId,
        warehouse: receipt.warehouse,
        location: receipt.location,
        movementType: 'RECEIPT' as MovementType,
        quantity: quantity,
        beforeQuantity: beforeQty,
        afterQuantity: afterQty,
        referenceType: 'receipt',
        referenceId: receipt._id,
        referenceNumber: receipt.receiptNumber,
        performedBy: new mongoose.Types.ObjectId(userId),
      }], { session });

      // Update item in receipt
      const receiptItem = receipt.items.find(i => i.product.toString() === item.product);
      if (receiptItem) receiptItem.receivedQuantity = quantity;

      // Check reorder rules
      await checkReorderRules(productId, receipt.warehouse as mongoose.Types.ObjectId, session);
    }

    // Update receipt status
    receipt.status = 'done';
    receipt.validatedBy = new mongoose.Types.ObjectId(userId);
    receipt.validatedAt = new Date();
    await receipt.save({ session });

    await session.commitTransaction();
    return receipt;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// ─── validate delivery ───────────────────────────────────────────────────────

export const validateDelivery = async (
  deliveryId: string,
  items: { product: string; pickedQuantity: number; packedQuantity: number }[],
  userId: string
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const delivery = await Delivery.findById(deliveryId).session(session);
    if (!delivery) throw new AppError('Delivery not found', 404, 'NOT_FOUND');
    if (delivery.status === 'done') throw new AppError('Delivery is already validated', 400, 'INVALID_STATUS');
    if (delivery.status === 'canceled') throw new AppError('Cannot validate a canceled delivery', 400, 'INVALID_STATUS');

    // First pass: check all stock before making any changes
    for (const item of items) {
      const productId = new mongoose.Types.ObjectId(item.product);
      const quantity = item.packedQuantity || item.pickedQuantity;
      if (quantity <= 0) continue;

      const stock = await Stock.findOne({
        product: productId,
        warehouse: delivery.warehouse,
        location: delivery.location,
      }).session(session);

      if (!stock || stock.quantity < quantity) {
        const product = await Product.findById(productId);
        throw new AppError(
          `Insufficient stock for product "${product?.name || item.product}". Available: ${stock?.quantity || 0}, Requested: ${quantity}`,
          400,
          'INSUFFICIENT_STOCK'
        );
      }
    }

    // Second pass: deduct stock and create ledger entries
    for (const item of items) {
      const productId = new mongoose.Types.ObjectId(item.product);
      const quantity = item.packedQuantity || item.pickedQuantity;
      if (quantity <= 0) continue;

      const stock = await Stock.findOne({
        product: productId,
        warehouse: delivery.warehouse,
        location: delivery.location,
      }).session(session);

      const beforeQty = stock!.quantity;
      const afterQty = beforeQty - quantity;
      stock!.quantity = afterQty;
      await stock!.save({ session });

      await Product.findByIdAndUpdate(productId, { $inc: { totalStock: -quantity } }, { session });

      await StockMovement.create([{
        product: productId,
        warehouse: delivery.warehouse,
        location: delivery.location,
        movementType: 'DELIVERY' as MovementType,
        quantity: -quantity,
        beforeQuantity: beforeQty,
        afterQuantity: afterQty,
        referenceType: 'delivery',
        referenceId: delivery._id,
        referenceNumber: delivery.deliveryNumber,
        performedBy: new mongoose.Types.ObjectId(userId),
      }], { session });

      const deliveryItem = delivery.items.find(i => i.product.toString() === item.product);
      if (deliveryItem) {
        deliveryItem.pickedQuantity = item.pickedQuantity;
        deliveryItem.packedQuantity = item.packedQuantity;
      }

      await checkReorderRules(productId, delivery.warehouse as mongoose.Types.ObjectId, session);
    }

    delivery.status = 'done';
    delivery.validatedBy = new mongoose.Types.ObjectId(userId);
    delivery.validatedAt = new Date();
    await delivery.save({ session });

    await session.commitTransaction();
    return delivery;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// ─── validate transfer ───────────────────────────────────────────────────────

export const validateTransfer = async (transferId: string, userId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const transfer = await Transfer.findById(transferId).session(session);
    if (!transfer) throw new AppError('Transfer not found', 404, 'NOT_FOUND');
    if (transfer.status === 'done') throw new AppError('Transfer is already validated', 400, 'INVALID_STATUS');
    if (transfer.status === 'canceled') throw new AppError('Cannot validate a canceled transfer', 400, 'INVALID_STATUS');
    if (transfer.sourceLocation.toString() === transfer.destinationLocation.toString()) {
      throw new AppError('Source and destination locations cannot be the same', 400, 'INVALID_TRANSFER');
    }

    // First pass: check all stock
    for (const item of transfer.items) {
      const stock = await Stock.findOne({
        product: item.product,
        warehouse: transfer.sourceWarehouse,
        location: transfer.sourceLocation,
      }).session(session);

      if (!stock || stock.quantity < item.quantity) {
        const product = await Product.findById(item.product);
        throw new AppError(
          `Insufficient stock for product "${product?.name}". Available: ${stock?.quantity || 0}, Requested: ${item.quantity}`,
          400,
          'INSUFFICIENT_STOCK'
        );
      }
    }

    // Second pass: move stock
    for (const item of transfer.items) {
      const productId = item.product as mongoose.Types.ObjectId;

      // Source: decrease
      const srcStock = await Stock.findOne({
        product: productId,
        warehouse: transfer.sourceWarehouse,
        location: transfer.sourceLocation,
      }).session(session);

      const srcBefore = srcStock!.quantity;
      const srcAfter = srcBefore - item.quantity;
      srcStock!.quantity = srcAfter;
      await srcStock!.save({ session });

      await StockMovement.create([{
        product: productId,
        warehouse: transfer.sourceWarehouse,
        location: transfer.sourceLocation,
        movementType: 'TRANSFER_OUT' as MovementType,
        quantity: -item.quantity,
        beforeQuantity: srcBefore,
        afterQuantity: srcAfter,
        referenceType: 'transfer',
        referenceId: transfer._id,
        referenceNumber: transfer.transferNumber,
        performedBy: new mongoose.Types.ObjectId(userId),
      }], { session });

      // Destination: increase
      let dstStock = await Stock.findOne({
        product: productId,
        warehouse: transfer.destinationWarehouse,
        location: transfer.destinationLocation,
      }).session(session);

      const dstBefore = dstStock ? dstStock.quantity : 0;
      const dstAfter = dstBefore + item.quantity;

      if (dstStock) {
        dstStock.quantity = dstAfter;
        await dstStock.save({ session });
      } else {
        await Stock.create([{
          product: productId,
          warehouse: transfer.destinationWarehouse,
          location: transfer.destinationLocation,
          quantity: dstAfter,
        }], { session });
      }

      await StockMovement.create([{
        product: productId,
        warehouse: transfer.destinationWarehouse,
        location: transfer.destinationLocation,
        movementType: 'TRANSFER_IN' as MovementType,
        quantity: item.quantity,
        beforeQuantity: dstBefore,
        afterQuantity: dstAfter,
        referenceType: 'transfer',
        referenceId: transfer._id,
        referenceNumber: transfer.transferNumber,
        performedBy: new mongoose.Types.ObjectId(userId),
      }], { session });

      // totalStock unchanged (net zero)
    }

    transfer.status = 'done';
    transfer.validatedBy = new mongoose.Types.ObjectId(userId);
    transfer.validatedAt = new Date();
    await transfer.save({ session });

    await session.commitTransaction();
    return transfer;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// ─── validate adjustment ─────────────────────────────────────────────────────

export const validateAdjustment = async (adjustmentId: string, userId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const adjustment = await StockAdjustment.findById(adjustmentId).session(session);
    if (!adjustment) throw new AppError('Adjustment not found', 404, 'NOT_FOUND');
    if (adjustment.status === 'done') throw new AppError('Adjustment is already validated', 400, 'INVALID_STATUS');
    if (adjustment.status === 'canceled') throw new AppError('Cannot validate a canceled adjustment', 400, 'INVALID_STATUS');

    // Find or create stock record
    let stock = await Stock.findOne({
      product: adjustment.product,
      warehouse: adjustment.warehouse,
      location: adjustment.location,
    }).session(session);

    const beforeQty = stock ? stock.quantity : 0;
    const afterQty = adjustment.countedQuantity;
    const difference = afterQty - beforeQty;

    if (stock) {
      stock.quantity = afterQty;
      await stock.save({ session });
    } else {
      await Stock.create([{
        product: adjustment.product,
        warehouse: adjustment.warehouse,
        location: adjustment.location,
        quantity: afterQty,
      }], { session });
    }

    // Update product totalStock
    await Product.findByIdAndUpdate(
      adjustment.product,
      { $inc: { totalStock: difference } },
      { session }
    );

    // Create ledger entry
    await StockMovement.create([{
      product: adjustment.product,
      warehouse: adjustment.warehouse,
      location: adjustment.location,
      movementType: 'ADJUSTMENT' as MovementType,
      quantity: difference,
      beforeQuantity: beforeQty,
      afterQuantity: afterQty,
      referenceType: 'adjustment',
      referenceId: adjustment._id,
      referenceNumber: adjustment.adjustmentNumber,
      reason: adjustment.reason,
      performedBy: new mongoose.Types.ObjectId(userId),
    }], { session });

    // Update adjustment record
    adjustment.recordedQuantity = beforeQty;
    adjustment.difference = difference;
    adjustment.status = 'done';
    adjustment.validatedBy = new mongoose.Types.ObjectId(userId);
    adjustment.validatedAt = new Date();
    await adjustment.save({ session });

    await checkReorderRules(
      adjustment.product as mongoose.Types.ObjectId,
      adjustment.warehouse as mongoose.Types.ObjectId,
      session
    );

    await session.commitTransaction();
    return adjustment;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// ─── get next document number ────────────────────────────────────────────────

export const getNextDocumentNumber = async (type: 'receipt' | 'delivery' | 'transfer' | 'adjustment') => {
  const prefixMap = { receipt: 'REC', delivery: 'DEL', transfer: 'TRN', adjustment: 'ADJ' };
  const modelMap: Record<string, mongoose.Model<any>> = { receipt: Receipt, delivery: Delivery, transfer: Transfer, adjustment: StockAdjustment };
  return getCounter(modelMap[type], prefixMap[type as keyof typeof prefixMap]);
};
