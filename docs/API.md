# StockSense — API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require: `Authorization: Bearer <jwt_token>`

## Standard Response Format

### Success
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "pagination": { "page": 1, "limit": 20, "total": 100, "pages": 5 }
}
```

### Error
```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

---

## 1. Authentication (`/api/auth`)

### POST `/api/auth/register`
- **Auth**: None
- **Body**: `{ name, email, password, role? }`
- **Response**: `{ token, user }`
- **Validation**: email format, password min 8 chars, name min 2 chars
- **Errors**: `EMAIL_EXISTS`

### POST `/api/auth/login`
- **Auth**: None
- **Body**: `{ email, password }`
- **Response**: `{ token, user }`
- **Errors**: `INVALID_CREDENTIALS`, `ACCOUNT_DISABLED`

### POST `/api/auth/logout`
- **Auth**: Required
- **Response**: `{ message: "Logged out" }`

### POST `/api/auth/forgot-password`
- **Auth**: None
- **Body**: `{ email }`
- **Response**: `{ message: "OTP sent" }`
- **Notes**: Generates 6-digit OTP, sends via email (or logs in dev)

### POST `/api/auth/reset-password`
- **Auth**: None
- **Body**: `{ email, otp, newPassword }`
- **Response**: `{ message: "Password reset successful" }`
- **Errors**: `INVALID_OTP`, `OTP_EXPIRED`

### GET `/api/auth/me`
- **Auth**: Required
- **Response**: `{ user }`

### PUT `/api/auth/profile`
- **Auth**: Required
- **Body**: `{ name?, phone?, avatar? }`
- **Response**: `{ user }`

---

## 2. Products (`/api/products`)

### GET `/api/products`
- **Auth**: Required
- **Roles**: All
- **Query**: `?page=1&limit=20&search=&category=&status=`
- **Response**: Paginated product list with stock info

### POST `/api/products`
- **Auth**: Required
- **Roles**: Inventory Manager
- **Body**: `{ name, sku, category, unitOfMeasure, description?, minStockThreshold?, reorderLevel? }`
- **Validation**: SKU unique, category exists
- **Errors**: `DUPLICATE_SKU`

### GET `/api/products/:id`
- **Auth**: Required
- **Response**: Product with stock breakdown by location

### PUT `/api/products/:id`
- **Auth**: Required
- **Roles**: Inventory Manager
- **Body**: `{ name?, category?, unitOfMeasure?, description?, minStockThreshold?, reorderLevel? }`
- **Notes**: SKU cannot be changed after creation

### DELETE `/api/products/:id`
- **Auth**: Required
- **Roles**: Inventory Manager
- **Notes**: Soft delete (sets isActive=false). Cannot delete if stock > 0

---

## 3. Categories (`/api/categories`)

### GET `/api/categories`
- **Auth**: Required
- **Response**: All active categories

### POST `/api/categories`
- **Auth**: Required
- **Roles**: Inventory Manager
- **Body**: `{ name, description? }`

### PUT `/api/categories/:id`
- **Auth**: Required
- **Roles**: Inventory Manager

### DELETE `/api/categories/:id`
- **Auth**: Required
- **Roles**: Inventory Manager
- **Notes**: Cannot delete if products exist in category

---

## 4. Warehouses (`/api/warehouses`)

### GET `/api/warehouses`
- **Auth**: Required
- **Response**: All warehouses with location counts

### POST `/api/warehouses`
- **Auth**: Required
- **Roles**: Inventory Manager
- **Body**: `{ name, code, address? }`

### GET `/api/warehouses/:id`
- **Auth**: Required
- **Response**: Warehouse with locations

### PUT `/api/warehouses/:id`
- **Auth**: Required
- **Roles**: Inventory Manager

### DELETE `/api/warehouses/:id`
- **Auth**: Required
- **Roles**: Inventory Manager
- **Notes**: Cannot delete if stock exists

---

## 5. Locations (`/api/locations`)

### GET `/api/locations`
- **Auth**: Required
- **Query**: `?warehouse=`
- **Response**: Locations (filterable by warehouse)

### POST `/api/locations`
- **Auth**: Required
- **Roles**: Inventory Manager
- **Body**: `{ name, warehouse, type, description? }`

### PUT `/api/locations/:id`
- **Auth**: Required
- **Roles**: Inventory Manager

### DELETE `/api/locations/:id`
- **Auth**: Required
- **Roles**: Inventory Manager

---

## 6. Suppliers (`/api/suppliers`)

### GET `/api/suppliers`
- **Auth**: Required

### POST `/api/suppliers`
- **Auth**: Required
- **Roles**: Inventory Manager
- **Body**: `{ name, email?, phone?, address? }`

### PUT `/api/suppliers/:id`
- **Auth**: Required
- **Roles**: Inventory Manager

### DELETE `/api/suppliers/:id`
- **Auth**: Required
- **Roles**: Inventory Manager

---

## 7. Customers (`/api/customers`)

### GET `/api/customers`
- **Auth**: Required

### POST `/api/customers`
- **Auth**: Required
- **Roles**: Inventory Manager
- **Body**: `{ name, email?, phone?, address? }`

### PUT `/api/customers/:id`
- **Auth**: Required
- **Roles**: Inventory Manager

### DELETE `/api/customers/:id`
- **Auth**: Required
- **Roles**: Inventory Manager

---

## 8. Receipts (`/api/receipts`)

### GET `/api/receipts`
- **Auth**: Required
- **Query**: `?page=1&limit=20&status=&supplier=&warehouse=`

### POST `/api/receipts`
- **Auth**: Required
- **Body**: `{ supplier?, warehouse, location, items: [{ product, expectedQuantity }], notes? }`
- **Notes**: Creates in `draft` status

### GET `/api/receipts/:id`
- **Auth**: Required

### PUT `/api/receipts/:id`
- **Auth**: Required
- **Notes**: Only editable in `draft` or `waiting` status
- **Errors**: `DOCUMENT_NOT_EDITABLE`

### POST `/api/receipts/:id/validate`
- **Auth**: Required
- **Roles**: Inventory Manager
- **Body**: `{ items: [{ product, receivedQuantity }] }`
- **Notes**: Transitions to `done`, increases stock, creates ledger entries
- **Errors**: `INVALID_STATUS_TRANSITION`

### POST `/api/receipts/:id/cancel`
- **Auth**: Required
- **Roles**: Inventory Manager
- **Notes**: Only from `draft` or `waiting`. Cannot cancel `done`.

---

## 9. Deliveries (`/api/deliveries`)

### GET `/api/deliveries`
- **Auth**: Required
- **Query**: `?page=1&limit=20&status=&customer=&warehouse=`

### POST `/api/deliveries`
- **Auth**: Required
- **Body**: `{ customer?, warehouse, location, items: [{ product, requestedQuantity }], notes? }`

### GET `/api/deliveries/:id`
- **Auth**: Required

### PUT `/api/deliveries/:id`
- **Auth**: Required
- **Notes**: Only editable in `draft` or `waiting` status

### POST `/api/deliveries/:id/validate`
- **Auth**: Required
- **Roles**: Inventory Manager
- **Body**: `{ items: [{ product, pickedQuantity, packedQuantity }] }`
- **Notes**: Validates sufficient stock, transitions to `done`, decreases stock, creates ledger entries
- **Errors**: `INSUFFICIENT_STOCK`

### POST `/api/deliveries/:id/cancel`
- **Auth**: Required
- **Roles**: Inventory Manager

---

## 10. Transfers (`/api/transfers`)

### GET `/api/transfers`
- **Auth**: Required
- **Query**: `?page=1&limit=20&status=`

### POST `/api/transfers`
- **Auth**: Required
- **Body**: `{ sourceWarehouse, sourceLocation, destinationWarehouse, destinationLocation, items: [{ product, quantity }], notes? }`

### GET `/api/transfers/:id`
- **Auth**: Required

### PUT `/api/transfers/:id`
- **Auth**: Required

### POST `/api/transfers/:id/validate`
- **Auth**: Required
- **Roles**: Inventory Manager
- **Notes**: Decreases source stock, increases destination stock. Creates two ledger entries (TRANSFER_OUT + TRANSFER_IN). Total company stock unchanged.
- **Errors**: `INSUFFICIENT_STOCK`

### POST `/api/transfers/:id/cancel`
- **Auth**: Required
- **Roles**: Inventory Manager

---

## 11. Stock Adjustments (`/api/adjustments`)

### GET `/api/adjustments`
- **Auth**: Required
- **Query**: `?page=1&limit=20&product=&warehouse=`

### POST `/api/adjustments`
- **Auth**: Required
- **Roles**: Inventory Manager
- **Body**: `{ product, warehouse, location, countedQuantity, reason }`
- **Notes**: System auto-fills recordedQuantity and difference

### GET `/api/adjustments/:id`
- **Auth**: Required

### POST `/api/adjustments/:id/validate`
- **Auth**: Required
- **Roles**: Inventory Manager
- **Notes**: Updates stock, creates ledger entry with ADJUSTMENT type

---

## 12. Stock (`/api/stock`)

### GET `/api/stock`
- **Auth**: Required
- **Query**: `?product=&warehouse=&location=`
- **Response**: Stock levels with product/location details

### GET `/api/stock/:productId`
- **Auth**: Required
- **Response**: Stock breakdown by warehouse and location for a product

---

## 13. Stock Movements / Ledger (`/api/stock-movements`)

### GET `/api/stock-movements`
- **Auth**: Required
- **Query**: `?page=1&limit=50&product=&warehouse=&movementType=&startDate=&endDate=`
- **Response**: Paginated ledger entries (newest first)

---

## 14. Dashboard (`/api/dashboard`)

### GET `/api/dashboard`
- **Auth**: Required
- **Query**: `?warehouse=&category=`
- **Response**:
```json
{
  "kpis": {
    "totalProducts": 150,
    "lowStockItems": 12,
    "outOfStockItems": 3,
    "pendingReceipts": 5,
    "pendingDeliveries": 8,
    "scheduledTransfers": 2
  },
  "recentActivity": [...],
  "stockAlerts": [...]
}
```

### GET `/api/dashboard/overview`
- **Auth**: Required
- **Query**: `?type=&status=&warehouse=&category=`
- **Response**: Filtered operations list for dashboard tables

---

## 15. Notifications (`/api/notifications`)

### GET `/api/notifications`
- **Auth**: Required
- **Query**: `?isRead=false`

### PUT `/api/notifications/:id/read`
- **Auth**: Required

### PUT `/api/notifications/read-all`
- **Auth**: Required
