# StockSense — Inventory Ledger Specification

## 1. Overview

The Stock Ledger (StockMovement collection) is the **core audit trail** of StockSense. Every single inventory-changing operation creates one or more immutable ledger entries. The ledger serves as the system of record for understanding what happened to any product at any location at any time.

## 2. Ledger Entry Structure

```typescript
interface StockMovement {
  _id: ObjectId;
  product: ObjectId;           // Which product
  warehouse: ObjectId;         // Which warehouse
  location: ObjectId;          // Which specific location
  movementType: MovementType;  // What type of operation
  quantity: number;            // How much changed (signed: +/-)
  beforeQuantity: number;      // Stock before this operation
  afterQuantity: number;       // Stock after this operation
  referenceType: string;       // Source document type
  referenceId: ObjectId;       // Source document ID
  referenceNumber: string;     // Human-readable ref (REC-00001)
  reason?: string;             // For adjustments
  performedBy: ObjectId;       // Who performed the operation
  createdAt: Date;             // When (auto-set, never editable)
}
```

## 3. Movement Types

| Type | Trigger | Quantity Sign | Description |
|------|---------|:------------:|-------------|
| `RECEIPT` | Receipt validated | + (positive) | Goods received from supplier |
| `DELIVERY` | Delivery validated | - (negative) | Goods shipped to customer |
| `TRANSFER_OUT` | Transfer validated | - (negative) | Goods moved out of source location |
| `TRANSFER_IN` | Transfer validated | + (positive) | Goods arrived at destination location |
| `ADJUSTMENT` | Adjustment validated | +/- (either) | Physical count correction |

## 4. Stock Calculation Logic

### 4.1 On Receipt Validation
```
For each item in receipt:
  currentStock = Stock.findOne({ product, warehouse, location })
  
  if (currentStock exists):
    beforeQty = currentStock.quantity
    currentStock.quantity += receivedQuantity
  else:
    beforeQty = 0
    create new Stock({ product, warehouse, location, quantity: receivedQuantity })
  
  afterQty = beforeQty + receivedQuantity
  
  create StockMovement({
    product, warehouse, location,
    movementType: 'RECEIPT',
    quantity: +receivedQuantity,
    beforeQuantity: beforeQty,
    afterQuantity: afterQty,
    referenceType: 'receipt',
    referenceId: receipt._id,
    referenceNumber: receipt.receiptNumber,
    performedBy: currentUser._id
  })
  
  Product.totalStock += receivedQuantity
```

### 4.2 On Delivery Validation
```
For each item in delivery:
  currentStock = Stock.findOne({ product, warehouse, location })
  
  if (!currentStock || currentStock.quantity < deliveredQuantity):
    THROW INSUFFICIENT_STOCK
  
  beforeQty = currentStock.quantity
  currentStock.quantity -= deliveredQuantity
  afterQty = currentStock.quantity
  
  create StockMovement({
    product, warehouse, location,
    movementType: 'DELIVERY',
    quantity: -deliveredQuantity,
    beforeQuantity: beforeQty,
    afterQuantity: afterQty,
    referenceType: 'delivery',
    referenceId: delivery._id,
    referenceNumber: delivery.deliveryNumber,
    performedBy: currentUser._id
  })
  
  Product.totalStock -= deliveredQuantity
```

### 4.3 On Transfer Validation
```
For each item in transfer:
  sourceStock = Stock.findOne({ product, sourceWarehouse, sourceLocation })
  
  if (!sourceStock || sourceStock.quantity < transferQuantity):
    THROW INSUFFICIENT_STOCK
  
  // Source: decrease
  sourceBefore = sourceStock.quantity
  sourceStock.quantity -= transferQuantity
  sourceAfter = sourceStock.quantity
  
  create StockMovement({
    product, warehouse: sourceWarehouse, location: sourceLocation,
    movementType: 'TRANSFER_OUT',
    quantity: -transferQuantity,
    beforeQuantity: sourceBefore,
    afterQuantity: sourceAfter,
    referenceType: 'transfer',
    referenceId: transfer._id,
    referenceNumber: transfer.transferNumber,
    performedBy: currentUser._id
  })
  
  // Destination: increase
  destStock = Stock.findOne({ product, destWarehouse, destLocation })
  destBefore = destStock ? destStock.quantity : 0
  
  if (destStock):
    destStock.quantity += transferQuantity
  else:
    create Stock({ product, destWarehouse, destLocation, quantity: transferQuantity })
  
  destAfter = destBefore + transferQuantity
  
  create StockMovement({
    product, warehouse: destWarehouse, location: destLocation,
    movementType: 'TRANSFER_IN',
    quantity: +transferQuantity,
    beforeQuantity: destBefore,
    afterQuantity: destAfter,
    referenceType: 'transfer',
    referenceId: transfer._id,
    referenceNumber: transfer.transferNumber,
    performedBy: currentUser._id
  })
  
  // Product.totalStock unchanged (net zero)
```

### 4.4 On Adjustment Validation
```
currentStock = Stock.findOne({ product, warehouse, location })
beforeQty = currentStock ? currentStock.quantity : 0
difference = countedQuantity - beforeQty

if (currentStock):
  currentStock.quantity = countedQuantity
else:
  create Stock({ product, warehouse, location, quantity: countedQuantity })

create StockMovement({
  product, warehouse, location,
  movementType: 'ADJUSTMENT',
  quantity: difference,  // Can be positive or negative
  beforeQuantity: beforeQty,
  afterQuantity: countedQuantity,
  referenceType: 'adjustment',
  referenceId: adjustment._id,
  referenceNumber: adjustment.adjustmentNumber,
  reason: adjustment.reason,
  performedBy: currentUser._id
})

Product.totalStock += difference
```

## 5. Transaction Safety

All stock operations use MongoDB sessions with transactions:

```typescript
const session = await mongoose.startSession();
session.startTransaction();

try {
  // 1. Update Stock documents
  // 2. Create StockMovement entries
  // 3. Update Product.totalStock
  // 4. Update document status to 'done'
  // 5. Check reorder rules, create notifications

  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

## 6. Immutability Rules

1. StockMovement documents are **append-only** — new entries are created, never updated.
2. No API endpoint exists to edit or delete ledger entries.
3. The `createdAt` timestamp is set by MongoDB and cannot be overridden.
4. Corrections to stock must go through the Adjustment workflow, which creates a NEW ledger entry.

## 7. Querying the Ledger

### Product History
```
GET /api/stock-movements?product=<id>&sort=-createdAt
```

### Location Activity
```
GET /api/stock-movements?warehouse=<id>&location=<id>&sort=-createdAt
```

### By Movement Type
```
GET /api/stock-movements?movementType=RECEIPT&sort=-createdAt
```

### Date Range
```
GET /api/stock-movements?startDate=2024-01-01&endDate=2024-12-31
```

## 8. Stock Verification

At any point, the current stock at a location should equal:
```
initialStock + SUM(all movements for that product at that location)
```

This can be used for periodic integrity checks.
