# StockSense — Business Rules

## 1. Stock Rules

### 1.1 Stock Cannot Become Negative
- Stock at any location can never go below 0.
- All stock-reducing operations (deliveries, transfers out, negative adjustments) must validate sufficient stock before proceeding.
- If a delivery order requests more than available stock → reject with `INSUFFICIENT_STOCK`.

### 1.2 Stock Changes Only Happen on Validation
- Creating a receipt/delivery/transfer does NOT change stock.
- Stock only changes when the document status transitions to `done` (via the `/validate` endpoint).
- This allows documents to be created, reviewed, and edited before committing.

### 1.3 Stock Calculation
- **Location Stock**: `Stock.findOne({ product, warehouse, location }).quantity`
- **Warehouse Stock**: Sum of all location stocks for a product within a warehouse
- **Total Product Stock**: Sum of all location stocks across all warehouses (`Product.totalStock` is denormalized)
- Product.totalStock is updated atomically during every stock operation

### 1.4 Zero-Stock Items
- Products with 0 stock cannot be delivered or transferred out.
- Products with 0 stock can receive incoming goods (receipts).

---

## 2. Document Status Transitions

### 2.1 Valid Transitions

```
draft → waiting → ready → done
draft → canceled
waiting → canceled
ready → canceled
```

- `done` is a terminal state. Cannot be edited, canceled, or reopened.
- `canceled` is a terminal state. Cannot be reopened.

### 2.2 Editing Rules
| Status | Editable? | Cancelable? |
|--------|-----------|------------|
| draft | ✅ Yes | ✅ Yes |
| waiting | ✅ Yes (limited) | ✅ Yes |
| ready | ❌ No | ✅ Yes |
| done | ❌ No | ❌ No |
| canceled | ❌ No | ❌ No |

### 2.3 Status Definitions
- **Draft**: Document created but not yet submitted for processing
- **Waiting**: Document submitted, awaiting goods/processing
- **Ready**: Goods received/picked/packed, ready for final validation
- **Done**: Validated and completed. Stock has been updated.
- **Canceled**: Document voided. No stock changes applied.

---

## 3. Receipt Rules

- Receipt creates stock entries at the specified warehouse + location.
- On validation, `receivedQuantity` must be provided for each item.
- `receivedQuantity` may differ from `expectedQuantity` (partial receipt allowed).
- `receivedQuantity` must be ≥ 0.
- If `receivedQuantity` is 0 for an item, no stock change for that item.
- Stock increases happen atomically (all items in one transaction).
- One ledger entry per item per receipt.

---

## 4. Delivery Rules

- Delivery reduces stock from the specified warehouse + location.
- On validation, system checks each item's stock at the source location.
- If ANY item has insufficient stock → entire delivery is rejected (atomic).
- `pickedQuantity` and `packedQuantity` are tracked for the pick/pack workflow.
- Final stock deduction uses `packedQuantity` (or `requestedQuantity` if not specified).
- One ledger entry per item per delivery.

---

## 5. Transfer Rules

- Source and destination can be in the same or different warehouses.
- Source and destination cannot be the same location.
- On validation: source location stock decreases, destination location stock increases.
- Total company stock remains unchanged.
- Two ledger entries per item: one `TRANSFER_OUT` (source) and one `TRANSFER_IN` (destination).
- Insufficient stock at source → entire transfer rejected.
- Stock moves atomically (all items in one transaction).

---

## 6. Adjustment Rules

- Only Inventory Managers can create and validate adjustments.
- A reason is **mandatory** for every adjustment (min 5 characters).
- System auto-fills `recordedQuantity` from current stock at the selected location.
- `difference` = `countedQuantity` - `recordedQuantity`
- Positive difference → stock increases
- Negative difference → stock decreases (stock cannot go negative after adjustment; countedQuantity ≥ 0)
- One ledger entry per adjustment.
- Historical adjustments are **never editable** once validated.

---

## 7. Ledger Rules

- The stock ledger (StockMovement) is an **append-only** audit trail.
- Ledger entries are **immutable** — they cannot be edited or deleted.
- Every stock-changing operation must create a ledger entry **within the same transaction** as the stock update.
- Ledger entries record before/after quantities for full traceability.
- Only users with appropriate roles can view the full ledger.

---

## 8. Permission Rules

| Action | Inventory Manager | Warehouse Staff |
|--------|:-----------------:|:--------------:|
| View Dashboard | ✅ | ✅ |
| Create Product | ✅ | ❌ |
| Edit Product | ✅ | ❌ |
| Delete Product | ✅ | ❌ |
| View Products | ✅ | ✅ |
| Create Receipt | ✅ | ✅ |
| Validate Receipt | ✅ | ❌ |
| Cancel Receipt | ✅ | ❌ |
| Create Delivery | ✅ | ✅ |
| Validate Delivery | ✅ | ❌ |
| Cancel Delivery | ✅ | ❌ |
| Create Transfer | ✅ | ✅ |
| Validate Transfer | ✅ | ❌ |
| Cancel Transfer | ✅ | ❌ |
| Create Adjustment | ✅ | ❌ |
| Validate Adjustment | ✅ | ❌ |
| View Stock Ledger | ✅ | ✅ |
| Manage Warehouses | ✅ | ❌ |
| Manage Suppliers | ✅ | ❌ |
| Manage Customers | ✅ | ❌ |
| Manage Categories | ✅ | ❌ |

### Rationale
- Warehouse Staff can **create** drafts for receipts, deliveries, and transfers (their daily workflow).
- Only Inventory Managers can **validate** (commit stock changes) and **cancel** operations.
- Only Inventory Managers can manage master data (products, warehouses, categories, suppliers, customers).
- Stock adjustments are restricted to Inventory Managers due to their audit sensitivity.

---

## 9. Deletion Rules

- **Products**: Soft delete only. Cannot delete if total stock > 0.
- **Categories**: Cannot delete if products exist in the category.
- **Warehouses**: Cannot delete if any stock exists in the warehouse.
- **Locations**: Cannot delete if any stock exists at the location.
- **Suppliers/Customers**: Soft delete. Can still be referenced in historical documents.
- **Documents (Receipts, Deliveries, Transfers, Adjustments)**: Never physically deleted. Can only be canceled.

---

## 10. Numbering Rules

All documents use auto-incrementing reference numbers:
- Receipts: `REC-00001`, `REC-00002`, ...
- Deliveries: `DEL-00001`, `DEL-00002`, ...
- Transfers: `TRN-00001`, `TRN-00002`, ...
- Adjustments: `ADJ-00001`, `ADJ-00002`, ...

Numbers are generated server-side and are unique and sequential.
