# StockSense — Database Design

## 1. Overview

MongoDB with Mongoose ODM. All models include `timestamps: true` (createdAt, updatedAt).

## 2. Entity Relationship Diagram

```
User ──────┐
           │
Category ──┤
           │
Product ───┼── Stock (per warehouse/location)
           │     │
Supplier ──┤     ├── StockMovement (ledger)
           │     │
Customer ──┤     ├── Receipt ─── ReceiptItem
           │     │
Warehouse ─┤     ├── Delivery ── DeliveryItem
    │      │     │
Location ──┘     ├── Transfer ── TransferItem
                 │
                 ├── StockAdjustment
                 │
                 ├── ReorderRule
                 │
                 └── Notification
```

## 3. Models

---

### 3.1 User

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| name | String | Yes | min 2 chars | |
| email | String | Yes | Valid email, unique | Indexed |
| password | String | Yes | min 8 chars | Hashed with bcrypt |
| role | String | Yes | enum: `inventory_manager`, `warehouse_staff` | Default: `warehouse_staff` |
| phone | String | No | | |
| avatar | String | No | | URL |
| isActive | Boolean | Yes | | Default: true |
| resetOTP | String | No | | Hashed OTP for password reset |
| resetOTPExpiry | Date | No | | OTP expiration |

**Indexes**: `{ email: 1 }` (unique)

---

### 3.2 Category

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| name | String | Yes | unique, min 2 chars | |
| description | String | No | | |
| isActive | Boolean | Yes | | Default: true |

**Indexes**: `{ name: 1 }` (unique)

---

### 3.3 Product

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| name | String | Yes | min 2 chars | |
| sku | String | Yes | unique | Auto-generated or manual |
| category | ObjectId | Yes | ref: Category | |
| unitOfMeasure | String | Yes | enum: `unit`, `kg`, `liter`, `meter`, `box`, `pack`, `piece` | |
| description | String | No | | |
| totalStock | Number | Yes | min 0 | Computed from Stock records. Default: 0 |
| minStockThreshold | Number | No | min 0 | For low-stock alerts |
| reorderLevel | Number | No | min 0 | When to trigger reorder |
| isActive | Boolean | Yes | | Default: true |

**Indexes**: `{ sku: 1 }` (unique), `{ category: 1 }`, `{ name: 'text', sku: 'text' }`

---

### 3.4 Warehouse

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| name | String | Yes | unique, min 2 chars | |
| code | String | Yes | unique | Short identifier |
| address | String | No | | |
| isActive | Boolean | Yes | | Default: true |

**Indexes**: `{ code: 1 }` (unique)

---

### 3.5 Location

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| name | String | Yes | min 2 chars | e.g., "Rack A", "Production Floor" |
| warehouse | ObjectId | Yes | ref: Warehouse | |
| type | String | Yes | enum: `rack`, `shelf`, `bin`, `production`, `staging`, `other` | |
| description | String | No | | |
| isActive | Boolean | Yes | | Default: true |

**Indexes**: `{ warehouse: 1 }`, `{ warehouse: 1, name: 1 }` (unique compound)

---

### 3.6 Supplier

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| name | String | Yes | min 2 chars | |
| email | String | No | Valid email | |
| phone | String | No | | |
| address | String | No | | |
| isActive | Boolean | Yes | | Default: true |

---

### 3.7 Customer

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| name | String | Yes | min 2 chars | |
| email | String | No | Valid email | |
| phone | String | No | | |
| address | String | No | | |
| isActive | Boolean | Yes | | Default: true |

---

### 3.8 Stock

Tracks current stock at the Product × Warehouse × Location level.

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| product | ObjectId | Yes | ref: Product | |
| warehouse | ObjectId | Yes | ref: Warehouse | |
| location | ObjectId | Yes | ref: Location | |
| quantity | Number | Yes | min 0 | Current stock at this location |

**Indexes**: `{ product: 1, warehouse: 1, location: 1 }` (unique compound), `{ product: 1 }`, `{ warehouse: 1 }`

---

### 3.9 StockMovement (Ledger)

Immutable audit trail. One entry per inventory-changing operation.

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| product | ObjectId | Yes | ref: Product | |
| warehouse | ObjectId | Yes | ref: Warehouse | |
| location | ObjectId | Yes | ref: Location | |
| movementType | String | Yes | enum: `RECEIPT`, `DELIVERY`, `TRANSFER_IN`, `TRANSFER_OUT`, `ADJUSTMENT` | |
| quantity | Number | Yes | | Positive for increases, negative for decreases |
| beforeQuantity | Number | Yes | | Stock before this operation |
| afterQuantity | Number | Yes | | Stock after this operation |
| referenceType | String | Yes | enum: `receipt`, `delivery`, `transfer`, `adjustment` | |
| referenceId | ObjectId | Yes | | ID of the source document |
| referenceNumber | String | No | | Human-readable reference (e.g., REC-0001) |
| reason | String | No | | For adjustments |
| performedBy | ObjectId | Yes | ref: User | |

**Indexes**: `{ product: 1, createdAt: -1 }`, `{ referenceType: 1, referenceId: 1 }`, `{ performedBy: 1 }`, `{ movementType: 1 }`, `{ createdAt: -1 }`

---

### 3.10 Receipt

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| receiptNumber | String | Yes | unique | Auto-generated: REC-XXXXX |
| supplier | ObjectId | No | ref: Supplier | |
| warehouse | ObjectId | Yes | ref: Warehouse | Destination warehouse |
| location | ObjectId | Yes | ref: Location | Destination location |
| status | String | Yes | enum: `draft`, `waiting`, `ready`, `done`, `canceled` | Default: `draft` |
| items | Array | Yes | min 1 item | Embedded subdocuments |
| items[].product | ObjectId | Yes | ref: Product | |
| items[].expectedQuantity | Number | Yes | min 1 | |
| items[].receivedQuantity | Number | No | min 0 | Filled on validation |
| notes | String | No | | |
| validatedBy | ObjectId | No | ref: User | |
| validatedAt | Date | No | | |
| createdBy | ObjectId | Yes | ref: User | |

**Indexes**: `{ receiptNumber: 1 }` (unique), `{ status: 1 }`, `{ supplier: 1 }`, `{ createdAt: -1 }`

---

### 3.11 Delivery

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| deliveryNumber | String | Yes | unique | Auto-generated: DEL-XXXXX |
| customer | ObjectId | No | ref: Customer | |
| warehouse | ObjectId | Yes | ref: Warehouse | Source warehouse |
| location | ObjectId | Yes | ref: Location | Source location |
| status | String | Yes | enum: `draft`, `waiting`, `ready`, `done`, `canceled` | Default: `draft` |
| items | Array | Yes | min 1 item | |
| items[].product | ObjectId | Yes | ref: Product | |
| items[].requestedQuantity | Number | Yes | min 1 | |
| items[].pickedQuantity | Number | No | min 0 | |
| items[].packedQuantity | Number | No | min 0 | |
| notes | String | No | | |
| validatedBy | ObjectId | No | ref: User | |
| validatedAt | Date | No | | |
| createdBy | ObjectId | Yes | ref: User | |

**Indexes**: `{ deliveryNumber: 1 }` (unique), `{ status: 1 }`, `{ customer: 1 }`, `{ createdAt: -1 }`

---

### 3.12 Transfer

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| transferNumber | String | Yes | unique | Auto-generated: TRN-XXXXX |
| sourceWarehouse | ObjectId | Yes | ref: Warehouse | |
| sourceLocation | ObjectId | Yes | ref: Location | |
| destinationWarehouse | ObjectId | Yes | ref: Warehouse | |
| destinationLocation | ObjectId | Yes | ref: Location | |
| status | String | Yes | enum: `draft`, `waiting`, `ready`, `done`, `canceled` | Default: `draft` |
| items | Array | Yes | min 1 item | |
| items[].product | ObjectId | Yes | ref: Product | |
| items[].quantity | Number | Yes | min 1 | |
| notes | String | No | | |
| validatedBy | ObjectId | No | ref: User | |
| validatedAt | Date | No | | |
| createdBy | ObjectId | Yes | ref: User | |

**Indexes**: `{ transferNumber: 1 }` (unique), `{ status: 1 }`, `{ createdAt: -1 }`

---

### 3.13 StockAdjustment

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| adjustmentNumber | String | Yes | unique | Auto-generated: ADJ-XXXXX |
| product | ObjectId | Yes | ref: Product | |
| warehouse | ObjectId | Yes | ref: Warehouse | |
| location | ObjectId | Yes | ref: Location | |
| recordedQuantity | Number | Yes | | System's recorded stock |
| countedQuantity | Number | Yes | min 0 | Physical count |
| difference | Number | Yes | | countedQuantity - recordedQuantity |
| reason | String | Yes | min 5 chars | Mandatory reason |
| status | String | Yes | enum: `draft`, `done`, `canceled` | Default: `draft` |
| validatedBy | ObjectId | No | ref: User | |
| validatedAt | Date | No | | |
| createdBy | ObjectId | Yes | ref: User | |

**Indexes**: `{ adjustmentNumber: 1 }` (unique), `{ product: 1 }`, `{ createdAt: -1 }`

---

### 3.14 ReorderRule

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| product | ObjectId | Yes | ref: Product, unique | |
| minStock | Number | Yes | min 0 | Below this → low stock alert |
| reorderLevel | Number | Yes | min 0 | Trigger reorder at this level |
| reorderQuantity | Number | Yes | min 1 | Suggested quantity to reorder |
| isActive | Boolean | Yes | | Default: true |

**Indexes**: `{ product: 1 }` (unique)

---

### 3.15 Notification

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| type | String | Yes | enum: `low_stock`, `out_of_stock`, `reorder` | |
| title | String | Yes | | |
| message | String | Yes | | |
| product | ObjectId | No | ref: Product | |
| warehouse | ObjectId | No | ref: Warehouse | |
| isRead | Boolean | Yes | | Default: false |
| userId | ObjectId | No | ref: User | null = all users |

**Indexes**: `{ isRead: 1, createdAt: -1 }`, `{ type: 1 }`

## 4. Stock Calculation Strategy

### Current Stock at Location
```
Stock.findOne({ product, warehouse, location }).quantity
```

### Product Total Stock
```
Stock.aggregate([
  { $match: { product: productId } },
  { $group: { _id: null, total: { $sum: "$quantity" } } }
])
```

### Warehouse Stock for Product
```
Stock.aggregate([
  { $match: { product: productId, warehouse: warehouseId } },
  { $group: { _id: null, total: { $sum: "$quantity" } } }
])
```

Product.totalStock is denormalized and updated on every stock operation for query performance.
