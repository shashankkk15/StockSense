# StockSense — User Roles & Permissions

## 1. Role Definitions

### Inventory Manager
**Full system access.** Responsible for:
- Managing all master data (products, categories, warehouses, locations, suppliers, customers)
- Validating all inventory operations (receipts, deliveries, transfers, adjustments)
- Performing stock adjustments
- Canceling operations
- Viewing reports and dashboard
- Managing warehouse settings

### Warehouse Staff
**Operational access.** Responsible for:
- Creating draft operations (receipts, deliveries, transfers)
- Viewing products and stock levels
- Viewing the dashboard
- Viewing move history / stock ledger
- Performing picking, packing, and shelving tasks

## 2. Permission Matrix

| Resource | Action | Inventory Manager | Warehouse Staff |
|----------|--------|:-----------------:|:--------------:|
| **Dashboard** | View | ✅ | ✅ |
| **Products** | List/View | ✅ | ✅ |
| | Create | ✅ | ❌ |
| | Edit | ✅ | ❌ |
| | Delete | ✅ | ❌ |
| **Categories** | List/View | ✅ | ✅ |
| | Create/Edit/Delete | ✅ | ❌ |
| **Warehouses** | List/View | ✅ | ✅ |
| | Create/Edit/Delete | ✅ | ❌ |
| **Locations** | List/View | ✅ | ✅ |
| | Create/Edit/Delete | ✅ | ❌ |
| **Suppliers** | List/View | ✅ | ✅ |
| | Create/Edit/Delete | ✅ | ❌ |
| **Customers** | List/View | ✅ | ✅ |
| | Create/Edit/Delete | ✅ | ❌ |
| **Receipts** | List/View | ✅ | ✅ |
| | Create (Draft) | ✅ | ✅ |
| | Edit (Draft/Waiting) | ✅ | ✅ |
| | Validate (→ Done) | ✅ | ❌ |
| | Cancel | ✅ | ❌ |
| **Deliveries** | List/View | ✅ | ✅ |
| | Create (Draft) | ✅ | ✅ |
| | Edit (Draft/Waiting) | ✅ | ✅ |
| | Validate (→ Done) | ✅ | ❌ |
| | Cancel | ✅ | ❌ |
| **Transfers** | List/View | ✅ | ✅ |
| | Create (Draft) | ✅ | ✅ |
| | Edit (Draft/Waiting) | ✅ | ✅ |
| | Validate (→ Done) | ✅ | ❌ |
| | Cancel | ✅ | ❌ |
| **Adjustments** | List/View | ✅ | ✅ |
| | Create | ✅ | ❌ |
| | Validate | ✅ | ❌ |
| **Stock Ledger** | View | ✅ | ✅ |
| **Notifications** | View | ✅ | ✅ |
| **Profile** | View/Edit Own | ✅ | ✅ |

## 3. Implementation

### Backend Middleware
```typescript
// role.middleware.ts
export const requireRole = (...roles: string[]) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        code: 'FORBIDDEN'
      });
    }
    next();
  };
};

// Usage in routes
router.post('/products', auth, requireRole('inventory_manager'), createProduct);
router.get('/products', auth, getAllProducts); // Both roles
```

### Frontend Guards
- Sidebar items shown/hidden based on role
- Action buttons (Validate, Cancel, Delete) hidden for insufficient roles
- Route-level protection via middleware

## 4. Default Demo Users

| Name | Email | Password | Role |
|------|-------|----------|------|
| Admin Manager | admin@stocksense.com | Admin@123 | inventory_manager |
| John Warehouse | john@stocksense.com | Staff@123 | warehouse_staff |

## 5. Design Decisions

1. **Only two roles** as specified in the PDF (Inventory Manager and Warehouse Staff).
2. **Warehouse Staff can create drafts** — this reflects real-world workflows where staff initiate operations that managers approve.
3. **Only Inventory Managers validate** — this provides a review/approval gate before stock is actually modified.
4. **Adjustments restricted to Managers** — stock adjustments are audit-sensitive and should be controlled.
