import { Request, Response, NextFunction } from 'express';
import { Product } from '../models/Product';
import { Receipt } from '../models/Receipt';
import { Delivery } from '../models/Delivery';
import { Transfer } from '../models/Transfer';
import { StockMovement } from '../models/StockMovement';
import { Notification } from '../models/Notification';

export const getDashboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { warehouse, category } = req.query;

    // KPI: Total Products in Stock
    const productFilter: any = { isActive: true };
    if (category) productFilter.category = category;
    const totalProducts = await Product.countDocuments(productFilter);

    // KPI: Low Stock Items
    const lowStockItems = await Product.countDocuments({
      ...productFilter,
      $expr: {
        $and: [
          { $gt: ['$totalStock', 0] },
          { $lt: ['$totalStock', '$minStockThreshold'] }
        ]
      }
    });

    // KPI: Out of Stock Items
    const outOfStockItems = await Product.countDocuments({ ...productFilter, totalStock: 0 });

    // KPI: Pending Receipts (draft/waiting/ready)
    const receiptFilter: any = { status: { $in: ['draft', 'waiting', 'ready'] } };
    if (warehouse) receiptFilter.warehouse = warehouse;
    const pendingReceipts = await Receipt.countDocuments(receiptFilter);

    // KPI: Pending Deliveries
    const deliveryFilter: any = { status: { $in: ['draft', 'waiting', 'ready'] } };
    if (warehouse) deliveryFilter.warehouse = warehouse;
    const pendingDeliveries = await Delivery.countDocuments(deliveryFilter);

    // KPI: Scheduled Transfers
    const transferFilter: any = { status: { $in: ['draft', 'waiting', 'ready'] } };
    if (warehouse) {
      transferFilter.$or = [{ sourceWarehouse: warehouse }, { destinationWarehouse: warehouse }];
    }
    const scheduledTransfers = await Transfer.countDocuments(transferFilter);

    // Recent Activity (last 10 stock movements)
    const recentActivity = await StockMovement.find()
      .populate('product', 'name sku')
      .populate('warehouse', 'name')
      .populate('location', 'name')
      .populate('performedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    // Stock Alerts (low + out of stock products)
    const stockAlerts = await Product.find({
      isActive: true,
      $or: [
        { totalStock: 0 },
        { $expr: { $and: [{ $gt: ['$totalStock', 0] }, { $lt: ['$totalStock', '$minStockThreshold'] }] } }
      ]
    })
      .populate('category', 'name')
      .select('name sku totalStock minStockThreshold unitOfMeasure')
      .limit(10);

    // Unread notifications
    const notifications = await Notification.find({ isRead: false })
      .populate('product', 'name sku')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        kpis: {
          totalProducts,
          lowStockItems,
          outOfStockItems,
          pendingReceipts,
          pendingDeliveries,
          scheduledTransfers,
        },
        recentActivity,
        stockAlerts,
        notifications,
      }
    });
  } catch (error) { next(error); }
};

export const getDashboardOverview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, status, warehouse, category, page = 1, limit = 20 } = req.query;
    let data: any[] = [];
    let total = 0;
    const skip = (+page - 1) * +limit;

    if (!type || type === 'receipts') {
      const filter: any = {};
      if (status) filter.status = status;
      if (warehouse) filter.warehouse = warehouse;
      total = await Receipt.countDocuments(filter);
      data = await Receipt.find(filter)
        .populate('supplier', 'name')
        .populate('warehouse', 'name')
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(+limit);
    } else if (type === 'deliveries') {
      const filter: any = {};
      if (status) filter.status = status;
      if (warehouse) filter.warehouse = warehouse;
      total = await Delivery.countDocuments(filter);
      data = await Delivery.find(filter)
        .populate('customer', 'name')
        .populate('warehouse', 'name')
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(+limit);
    } else if (type === 'transfers') {
      const filter: any = {};
      if (status) filter.status = status;
      total = await Transfer.countDocuments(filter);
      data = await Transfer.find(filter)
        .populate('sourceWarehouse destinationWarehouse', 'name')
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(+limit);
    }

    res.status(200).json({
      success: true,
      data,
      pagination: { page: +page, limit: +limit, total, pages: Math.ceil(total / +limit) }
    });
  } catch (error) { next(error); }
};
