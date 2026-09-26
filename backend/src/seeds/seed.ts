import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { User } from '../models/User';
import { Category } from '../models/Category';
import { Product } from '../models/Product';
import { Warehouse } from '../models/Warehouse';
import { Location } from '../models/Location';
import { Supplier } from '../models/Supplier';
import { Customer } from '../models/Customer';
import { Stock } from '../models/Stock';
import { Receipt } from '../models/Receipt';
import { Delivery } from '../models/Delivery';
import { Transfer } from '../models/Transfer';
import { StockAdjustment } from '../models/StockAdjustment';
import { StockMovement } from '../models/StockMovement';
import { ReorderRule } from '../models/ReorderRule';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stocksense';

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}), Category.deleteMany({}), Product.deleteMany({}),
      Warehouse.deleteMany({}), Location.deleteMany({}), Supplier.deleteMany({}),
      Customer.deleteMany({}), Stock.deleteMany({}), Receipt.deleteMany({}),
      Delivery.deleteMany({}), Transfer.deleteMany({}), StockAdjustment.deleteMany({}),
      StockMovement.deleteMany({}), ReorderRule.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');

    // ─── Users ───────────────────────────────────────────────────────────────
    const manager = await User.create({
      name: 'Admin Manager',
      email: 'admin@stocksense.com',
      password: 'Admin@123',
      role: 'inventory_manager',
    });
    const staff = await User.create({
      name: 'John Warehouse',
      email: 'john@stocksense.com',
      password: 'Staff@123',
      role: 'warehouse_staff',
    });
    console.log('👤 Users created');

    // ─── Categories ──────────────────────────────────────────────────────────
    const [catMetal, catWood, catElectronics, catFurniture, catPackaging] = await Category.insertMany([
      { name: 'Metals & Alloys', description: 'Steel, iron, copper and other metals' },
      { name: 'Wood & Timber', description: 'Plywood, MDF, hardwood and softwood' },
      { name: 'Electronics', description: 'Circuit boards, cables, sensors' },
      { name: 'Furniture', description: 'Chairs, tables, shelves' },
      { name: 'Packaging', description: 'Boxes, wraps, bags' },
    ]);
    console.log('📂 Categories created');

    // ─── Warehouses ──────────────────────────────────────────────────────────
    const [wh1, wh2] = await Warehouse.insertMany([
      { name: 'Main Warehouse', code: 'WH-MAIN', address: '100 Industrial Blvd, City A' },
      { name: 'Secondary Warehouse', code: 'WH-SEC', address: '250 Storage Lane, City B' },
    ]);
    console.log('🏭 Warehouses created');

    // ─── Locations ───────────────────────────────────────────────────────────
    const [locA, locB, locProd, locStage, locA2, locB2] = await Location.insertMany([
      { name: 'Rack A', warehouse: wh1._id, type: 'rack', description: 'Main rack row A' },
      { name: 'Rack B', warehouse: wh1._id, type: 'rack', description: 'Main rack row B' },
      { name: 'Production Floor', warehouse: wh1._id, type: 'production', description: 'Active production area' },
      { name: 'Staging Area', warehouse: wh1._id, type: 'staging', description: 'Inbound staging' },
      { name: 'Rack A', warehouse: wh2._id, type: 'rack', description: 'Secondary rack row A' },
      { name: 'Rack B', warehouse: wh2._id, type: 'rack', description: 'Secondary rack row B' },
    ]);
    console.log('📍 Locations created');

    // ─── Suppliers ───────────────────────────────────────────────────────────
    const [sup1, sup2, sup3] = await Supplier.insertMany([
      { name: 'SteelWorks Ltd', email: 'orders@steelworks.com', phone: '+1-555-0101', address: '1 Metal Way' },
      { name: 'TimberCo International', email: 'sales@timberco.com', phone: '+1-555-0202', address: '5 Forest Rd' },
      { name: 'ElectroParts Inc', email: 'supply@electroparts.com', phone: '+1-555-0303', address: '22 Circuit Ave' },
    ]);
    console.log('🏪 Suppliers created');

    // ─── Customers ───────────────────────────────────────────────────────────
    const [cust1, cust2, cust3] = await Customer.insertMany([
      { name: 'BuildRight Construction', email: 'procurement@buildright.com', phone: '+1-555-1001' },
      { name: 'FurniturePlus Retail', email: 'orders@furnitureplus.com', phone: '+1-555-1002' },
      { name: 'TechAssembly Corp', email: 'supply@techassembly.com', phone: '+1-555-1003' },
    ]);
    console.log('👥 Customers created');

    // ─── Products ────────────────────────────────────────────────────────────
    const products = await Product.insertMany([
      { name: 'Steel Rods (10mm)', sku: 'STL-ROD-10', category: catMetal._id, unitOfMeasure: 'kg', description: '10mm mild steel rods', totalStock: 0, minStockThreshold: 50, reorderLevel: 100 },
      { name: 'Stainless Sheet (2mm)', sku: 'STL-SHT-02', category: catMetal._id, unitOfMeasure: 'kg', description: '2mm stainless steel sheet', totalStock: 0, minStockThreshold: 30, reorderLevel: 60 },
      { name: 'Copper Wire (1.5mm)', sku: 'CPR-WRE-15', category: catMetal._id, unitOfMeasure: 'meter', description: 'Electrical grade copper wire', totalStock: 0, minStockThreshold: 100, reorderLevel: 200 },
      { name: 'Plywood 18mm', sku: 'WD-PLY-18', category: catWood._id, unitOfMeasure: 'unit', description: '4x8 ft plywood sheets', totalStock: 0, minStockThreshold: 20, reorderLevel: 40 },
      { name: 'MDF Board 12mm', sku: 'WD-MDF-12', category: catWood._id, unitOfMeasure: 'unit', description: 'Medium density fiberboard', totalStock: 0, minStockThreshold: 15, reorderLevel: 30 },
      { name: 'Arduino Nano', sku: 'ELEC-ARD-N', category: catElectronics._id, unitOfMeasure: 'unit', description: 'Microcontroller board', totalStock: 0, minStockThreshold: 10, reorderLevel: 25 },
      { name: 'USB-C Cable 2m', sku: 'ELEC-USB-C', category: catElectronics._id, unitOfMeasure: 'unit', description: '2 meter USB-C data cable', totalStock: 0, minStockThreshold: 20, reorderLevel: 50 },
      { name: 'Office Chair (Ergonomic)', sku: 'FURN-CHR-E', category: catFurniture._id, unitOfMeasure: 'unit', description: 'Adjustable ergonomic office chair', totalStock: 0, minStockThreshold: 5, reorderLevel: 10 },
      { name: 'Standing Desk 160cm', sku: 'FURN-DSK-L', category: catFurniture._id, unitOfMeasure: 'unit', description: '160cm height-adjustable desk', totalStock: 0, minStockThreshold: 3, reorderLevel: 8 },
      { name: 'Cardboard Box (Large)', sku: 'PKG-BOX-L', category: catPackaging._id, unitOfMeasure: 'unit', description: '60x40x40cm shipping box', totalStock: 0, minStockThreshold: 100, reorderLevel: 200 },
      { name: 'Bubble Wrap Roll 50m', sku: 'PKG-BWR-50', category: catPackaging._id, unitOfMeasure: 'unit', description: '50m bubble wrap roll', totalStock: 0, minStockThreshold: 10, reorderLevel: 20 },
      { name: 'Aluminum Angle (40x40)', sku: 'ALU-ANG-40', category: catMetal._id, unitOfMeasure: 'meter', description: '40x40mm aluminum angle bar', totalStock: 0, minStockThreshold: 50, reorderLevel: 100 },
      { name: 'Pine Wood 2x4', sku: 'WD-PIN-2X4', category: catWood._id, unitOfMeasure: 'meter', description: '2x4 inch pine lumber', totalStock: 0, minStockThreshold: 30, reorderLevel: 60 },
      { name: 'LED Strip 5m (RGB)', sku: 'ELEC-LED-R', category: catElectronics._id, unitOfMeasure: 'unit', description: '5m RGB LED strip with controller', totalStock: 0, minStockThreshold: 15, reorderLevel: 30 },
      { name: 'Bookshelf 5-tier', sku: 'FURN-BSH-5', category: catFurniture._id, unitOfMeasure: 'unit', description: '5-tier wooden bookshelf', totalStock: 0, minStockThreshold: 4, reorderLevel: 10 },
    ]);
    console.log('📦 Products created');

    // ─── ReorderRules ─────────────────────────────────────────────────────────
    for (const p of products) {
      if (p.minStockThreshold && p.reorderLevel) {
        await ReorderRule.create({
          product: p._id,
          minStock: p.minStockThreshold,
          reorderLevel: p.reorderLevel,
          reorderQuantity: p.reorderLevel * 2,
        });
      }
    }
    console.log('📋 Reorder rules created');

    // ─── Seed Stock via Receipt Validation ───────────────────────────────────
    // Receipt 1 — Steel goods to Main WH, Rack A
    const rec1 = await Receipt.create({
      receiptNumber: 'REC-00001',
      supplier: sup1._id,
      warehouse: wh1._id,
      location: locA._id,
      status: 'done',
      createdBy: manager._id,
      validatedBy: manager._id,
      validatedAt: new Date(),
      items: [
        { product: products[0]._id, expectedQuantity: 200, receivedQuantity: 200 },
        { product: products[1]._id, expectedQuantity: 100, receivedQuantity: 100 },
        { product: products[11]._id, expectedQuantity: 300, receivedQuantity: 300 },
      ],
      notes: 'Initial steel stock delivery',
    });

    // Receipt 2 — Wood goods to Main WH, Rack B
    const rec2 = await Receipt.create({
      receiptNumber: 'REC-00002',
      supplier: sup2._id,
      warehouse: wh1._id,
      location: locB._id,
      status: 'done',
      createdBy: manager._id,
      validatedBy: manager._id,
      validatedAt: new Date(),
      items: [
        { product: products[3]._id, expectedQuantity: 80, receivedQuantity: 80 },
        { product: products[4]._id, expectedQuantity: 60, receivedQuantity: 60 },
        { product: products[12]._id, expectedQuantity: 150, receivedQuantity: 150 },
      ],
    });

    // Receipt 3 — Electronics to Secondary WH, Rack A
    const rec3 = await Receipt.create({
      receiptNumber: 'REC-00003',
      supplier: sup3._id,
      warehouse: wh2._id,
      location: locA2._id,
      status: 'done',
      createdBy: staff._id,
      validatedBy: manager._id,
      validatedAt: new Date(),
      items: [
        { product: products[5]._id, expectedQuantity: 50, receivedQuantity: 50 },
        { product: products[6]._id, expectedQuantity: 100, receivedQuantity: 100 },
        { product: products[13]._id, expectedQuantity: 40, receivedQuantity: 40 },
      ],
    });

    // Receipt 4 — Furniture & Packaging to Main WH, Staging
    const rec4 = await Receipt.create({
      receiptNumber: 'REC-00004',
      warehouse: wh1._id,
      location: locStage._id,
      status: 'done',
      createdBy: staff._id,
      validatedBy: manager._id,
      validatedAt: new Date(),
      items: [
        { product: products[7]._id, expectedQuantity: 30, receivedQuantity: 30 },
        { product: products[8]._id, expectedQuantity: 15, receivedQuantity: 15 },
        { product: products[9]._id, expectedQuantity: 500, receivedQuantity: 500 },
        { product: products[10]._id, expectedQuantity: 25, receivedQuantity: 25 },
        { product: products[14]._id, expectedQuantity: 20, receivedQuantity: 20 },
        { product: products[2]._id, expectedQuantity: 500, receivedQuantity: 500 },
      ],
    });

    // Pending receipt (draft)
    await Receipt.create({
      receiptNumber: 'REC-00005',
      supplier: sup1._id,
      warehouse: wh1._id,
      location: locA._id,
      status: 'draft',
      createdBy: staff._id,
      items: [
        { product: products[0]._id, expectedQuantity: 100 },
        { product: products[1]._id, expectedQuantity: 50 },
      ],
      notes: 'Second batch order',
    });

    // Pending receipt (waiting)
    await Receipt.create({
      receiptNumber: 'REC-00006',
      supplier: sup2._id,
      warehouse: wh2._id,
      location: locA2._id,
      status: 'waiting',
      createdBy: staff._id,
      items: [
        { product: products[3]._id, expectedQuantity: 40 },
      ],
    });

    console.log('📥 Receipts created');

    // ─── Create Stock Records manually ───────────────────────────────────────
    const stockData = [
      { product: products[0]._id, warehouse: wh1._id, location: locA._id, quantity: 200 },
      { product: products[1]._id, warehouse: wh1._id, location: locA._id, quantity: 100 },
      { product: products[11]._id, warehouse: wh1._id, location: locA._id, quantity: 300 },
      { product: products[3]._id, warehouse: wh1._id, location: locB._id, quantity: 80 },
      { product: products[4]._id, warehouse: wh1._id, location: locB._id, quantity: 60 },
      { product: products[12]._id, warehouse: wh1._id, location: locB._id, quantity: 150 },
      { product: products[5]._id, warehouse: wh2._id, location: locA2._id, quantity: 50 },
      { product: products[6]._id, warehouse: wh2._id, location: locA2._id, quantity: 100 },
      { product: products[13]._id, warehouse: wh2._id, location: locA2._id, quantity: 40 },
      { product: products[7]._id, warehouse: wh1._id, location: locStage._id, quantity: 30 },
      { product: products[8]._id, warehouse: wh1._id, location: locStage._id, quantity: 15 },
      { product: products[9]._id, warehouse: wh1._id, location: locStage._id, quantity: 500 },
      { product: products[10]._id, warehouse: wh1._id, location: locStage._id, quantity: 25 },
      { product: products[14]._id, warehouse: wh1._id, location: locStage._id, quantity: 20 },
      { product: products[2]._id, warehouse: wh1._id, location: locStage._id, quantity: 500 },
    ];

    await Stock.insertMany(stockData);

    // Update product totalStock
    const totalStockMap: Record<string, number> = {};
    for (const s of stockData) {
      const key = s.product.toString();
      totalStockMap[key] = (totalStockMap[key] || 0) + s.quantity;
    }
    for (const [productId, total] of Object.entries(totalStockMap)) {
      await Product.findByIdAndUpdate(productId, { totalStock: total });
    }
    console.log('📊 Stock records created');

    // ─── Deliveries ──────────────────────────────────────────────────────────
    await Delivery.insertMany([
      {
        deliveryNumber: 'DEL-00001',
        customer: cust1._id,
        warehouse: wh1._id,
        location: locA._id,
        status: 'done',
        createdBy: staff._id,
        validatedBy: manager._id,
        validatedAt: new Date(),
        items: [
          { product: products[0]._id, requestedQuantity: 50, pickedQuantity: 50, packedQuantity: 50 },
          { product: products[11]._id, requestedQuantity: 80, pickedQuantity: 80, packedQuantity: 80 },
        ],
        notes: 'BuildRight construction order',
      },
      {
        deliveryNumber: 'DEL-00002',
        customer: cust2._id,
        warehouse: wh1._id,
        location: locStage._id,
        status: 'draft',
        createdBy: staff._id,
        items: [
          { product: products[7]._id, requestedQuantity: 10 },
          { product: products[8]._id, requestedQuantity: 5 },
        ],
      },
      {
        deliveryNumber: 'DEL-00003',
        customer: cust3._id,
        warehouse: wh2._id,
        location: locA2._id,
        status: 'waiting',
        createdBy: staff._id,
        items: [
          { product: products[5]._id, requestedQuantity: 20 },
          { product: products[6]._id, requestedQuantity: 30 },
        ],
      },
    ]);

    // Update stock after DEL-00001
    await Stock.findOneAndUpdate(
      { product: products[0]._id, warehouse: wh1._id, location: locA._id },
      { $inc: { quantity: -50 } }
    );
    await Product.findByIdAndUpdate(products[0]._id, { $inc: { totalStock: -50 } });
    await Stock.findOneAndUpdate(
      { product: products[11]._id, warehouse: wh1._id, location: locA._id },
      { $inc: { quantity: -80 } }
    );
    await Product.findByIdAndUpdate(products[11]._id, { $inc: { totalStock: -80 } });
    console.log('📤 Deliveries created');

    // ─── Transfers ───────────────────────────────────────────────────────────
    await Transfer.insertMany([
      {
        transferNumber: 'TRN-00001',
        sourceWarehouse: wh1._id,
        sourceLocation: locB._id,
        destinationWarehouse: wh1._id,
        destinationLocation: locProd._id,
        status: 'done',
        createdBy: staff._id,
        validatedBy: manager._id,
        validatedAt: new Date(),
        items: [
          { product: products[3]._id, quantity: 20 },
          { product: products[4]._id, quantity: 15 },
        ],
        notes: 'Wood to production floor for furniture assembly',
      },
      {
        transferNumber: 'TRN-00002',
        sourceWarehouse: wh1._id,
        sourceLocation: locA._id,
        destinationWarehouse: wh2._id,
        destinationLocation: locB2._id,
        status: 'draft',
        createdBy: staff._id,
        items: [
          { product: products[1]._id, quantity: 25 },
        ],
      },
      {
        transferNumber: 'TRN-00003',
        sourceWarehouse: wh1._id,
        sourceLocation: locStage._id,
        destinationWarehouse: wh1._id,
        destinationLocation: locB._id,
        status: 'waiting',
        createdBy: staff._id,
        items: [
          { product: products[9]._id, quantity: 100 },
        ],
        notes: 'Packaging material to rack B',
      },
    ]);

    // Update stock for TRN-00001
    await Stock.findOneAndUpdate({ product: products[3]._id, warehouse: wh1._id, location: locB._id }, { $inc: { quantity: -20 } });
    await Stock.findOneAndUpdate({ product: products[4]._id, warehouse: wh1._id, location: locB._id }, { $inc: { quantity: -15 } });
    const prodFloorWood1 = await Stock.findOne({ product: products[3]._id, warehouse: wh1._id, location: locProd._id });
    if (prodFloorWood1) { prodFloorWood1.quantity += 20; await prodFloorWood1.save(); }
    else { await Stock.create({ product: products[3]._id, warehouse: wh1._id, location: locProd._id, quantity: 20 }); }
    const prodFloorWood2 = await Stock.findOne({ product: products[4]._id, warehouse: wh1._id, location: locProd._id });
    if (prodFloorWood2) { prodFloorWood2.quantity += 15; await prodFloorWood2.save(); }
    else { await Stock.create({ product: products[4]._id, warehouse: wh1._id, location: locProd._id, quantity: 15 }); }
    console.log('🔄 Transfers created');

    // ─── Adjustments ─────────────────────────────────────────────────────────
    await StockAdjustment.insertMany([
      {
        adjustmentNumber: 'ADJ-00001',
        product: products[0]._id,
        warehouse: wh1._id,
        location: locA._id,
        recordedQuantity: 150,
        countedQuantity: 147,
        difference: -3,
        reason: '3 kg steel rods found damaged during physical count',
        status: 'done',
        createdBy: manager._id,
        validatedBy: manager._id,
        validatedAt: new Date(),
      },
    ]);

    // Apply adjustment to stock
    await Stock.findOneAndUpdate(
      { product: products[0]._id, warehouse: wh1._id, location: locA._id },
      { $inc: { quantity: -3 } }
    );
    await Product.findByIdAndUpdate(products[0]._id, { $inc: { totalStock: -3 } });
    console.log('⚖️  Adjustments created');

    // ─── Stock Movements (Ledger) ─────────────────────────────────────────────
    const now = new Date();
    await StockMovement.insertMany([
      // From REC-00001
      { product: products[0]._id, warehouse: wh1._id, location: locA._id, movementType: 'RECEIPT', quantity: 200, beforeQuantity: 0, afterQuantity: 200, referenceType: 'receipt', referenceId: rec1._id, referenceNumber: 'REC-00001', performedBy: manager._id, createdAt: new Date(now.getTime() - 7 * 86400000) },
      { product: products[1]._id, warehouse: wh1._id, location: locA._id, movementType: 'RECEIPT', quantity: 100, beforeQuantity: 0, afterQuantity: 100, referenceType: 'receipt', referenceId: rec1._id, referenceNumber: 'REC-00001', performedBy: manager._id, createdAt: new Date(now.getTime() - 7 * 86400000) },
      { product: products[11]._id, warehouse: wh1._id, location: locA._id, movementType: 'RECEIPT', quantity: 300, beforeQuantity: 0, afterQuantity: 300, referenceType: 'receipt', referenceId: rec1._id, referenceNumber: 'REC-00001', performedBy: manager._id, createdAt: new Date(now.getTime() - 7 * 86400000) },
      // From DEL-00001
      { product: products[0]._id, warehouse: wh1._id, location: locA._id, movementType: 'DELIVERY', quantity: -50, beforeQuantity: 200, afterQuantity: 150, referenceType: 'delivery', referenceId: rec1._id, referenceNumber: 'DEL-00001', performedBy: manager._id, createdAt: new Date(now.getTime() - 5 * 86400000) },
      { product: products[11]._id, warehouse: wh1._id, location: locA._id, movementType: 'DELIVERY', quantity: -80, beforeQuantity: 300, afterQuantity: 220, referenceType: 'delivery', referenceId: rec1._id, referenceNumber: 'DEL-00001', performedBy: manager._id, createdAt: new Date(now.getTime() - 5 * 86400000) },
      // From ADJ-00001
      { product: products[0]._id, warehouse: wh1._id, location: locA._id, movementType: 'ADJUSTMENT', quantity: -3, beforeQuantity: 150, afterQuantity: 147, referenceType: 'adjustment', referenceId: rec1._id, referenceNumber: 'ADJ-00001', reason: '3 kg steel rods found damaged', performedBy: manager._id, createdAt: new Date(now.getTime() - 2 * 86400000) },
    ]);
    console.log('📖 Stock ledger entries created');

    console.log('\n🎉 Seed completed successfully!\n');
    console.log('═══════════════════════════════════════');
    console.log('  Demo Credentials:');
    console.log('  ─────────────────────────────────────');
    console.log('  Inventory Manager:');
    console.log('    Email:    admin@stocksense.com');
    console.log('    Password: Admin@123');
    console.log('  ─────────────────────────────────────');
    console.log('  Warehouse Staff:');
    console.log('    Email:    john@stocksense.com');
    console.log('    Password: Staff@123');
    console.log('═══════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Seed failed:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
