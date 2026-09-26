# StockSense — Test Plan

## 1. Testing Strategy

| Layer | Framework | Scope |
|-------|-----------|-------|
| Backend Unit/Integration | Jest + Supertest | API endpoints, services, middleware |
| Database | MongoDB Memory Server | In-memory DB for fast tests |

## 2. Test Suites

### 2.1 Authentication Tests
```
✓ POST /auth/register — successful registration
✓ POST /auth/register — duplicate email returns 409
✓ POST /auth/register — invalid email returns 400
✓ POST /auth/register — short password returns 400
✓ POST /auth/login — valid credentials return token
✓ POST /auth/login — invalid password returns 401
✓ POST /auth/login — non-existent user returns 401
✓ POST /auth/login — disabled account returns 403
✓ GET /auth/me — returns user with valid token
✓ GET /auth/me — returns 401 without token
✓ POST /auth/forgot-password — sends OTP for valid email
✓ POST /auth/reset-password — resets with valid OTP
✓ POST /auth/reset-password — rejects expired OTP
✓ POST /auth/reset-password — rejects invalid OTP
```

### 2.2 Product Tests
```
✓ POST /products — manager can create product
✓ POST /products — warehouse staff cannot create product (403)
✓ POST /products — duplicate SKU returns 409
✓ POST /products — missing required fields returns 400
✓ GET /products — returns paginated products
✓ GET /products — search by name/SKU works
✓ GET /products — filter by category works
✓ GET /products/:id — returns product with stock breakdown
✓ PUT /products/:id — manager can update product
✓ DELETE /products/:id — cannot delete product with stock
```

### 2.3 Receipt Tests
```
✓ POST /receipts — create receipt in draft status
✓ PUT /receipts/:id — edit draft receipt
✓ PUT /receipts/:id — cannot edit done receipt (400)
✓ POST /receipts/:id/validate — stock increases correctly
✓ POST /receipts/:id/validate — ledger entry created
✓ POST /receipts/:id/validate — product totalStock updated
✓ POST /receipts/:id/validate — status changes to done
✓ POST /receipts/:id/validate — warehouse staff cannot validate (403)
✓ POST /receipts/:id/cancel — only manager can cancel
✓ POST /receipts/:id/cancel — cannot cancel done receipt
```

### 2.4 Delivery Tests
```
✓ POST /deliveries — create delivery in draft status
✓ POST /deliveries/:id/validate — stock decreases correctly
✓ POST /deliveries/:id/validate — ledger entry created
✓ POST /deliveries/:id/validate — rejects if insufficient stock
✓ POST /deliveries/:id/validate — rejects zero stock items
✓ POST /deliveries/:id/validate — product totalStock updated
✓ POST /deliveries/:id/validate — status changes to done
✓ POST /deliveries/:id/cancel — works from draft/waiting
```

### 2.5 Transfer Tests
```
✓ POST /transfers — create transfer in draft status
✓ POST /transfers/:id/validate — source stock decreases
✓ POST /transfers/:id/validate — destination stock increases
✓ POST /transfers/:id/validate — total stock unchanged
✓ POST /transfers/:id/validate — two ledger entries created (OUT + IN)
✓ POST /transfers/:id/validate — rejects if insufficient source stock
✓ POST /transfers/:id/validate — rejects same source/dest location
✓ POST /transfers/:id/validate — creates destination stock if none existed
```

### 2.6 Adjustment Tests
```
✓ POST /adjustments — manager can create adjustment
✓ POST /adjustments — warehouse staff cannot create (403)
✓ POST /adjustments — system auto-fills recordedQuantity
✓ POST /adjustments/:id/validate — positive adjustment increases stock
✓ POST /adjustments/:id/validate — negative adjustment decreases stock
✓ POST /adjustments/:id/validate — ledger entry created with reason
✓ POST /adjustments/:id/validate — product totalStock updated
```

### 2.7 Authorization Tests
```
✓ Warehouse staff cannot create products
✓ Warehouse staff cannot delete products
✓ Warehouse staff cannot validate receipts
✓ Warehouse staff cannot validate deliveries
✓ Warehouse staff cannot validate transfers
✓ Warehouse staff cannot create adjustments
✓ Warehouse staff cannot manage warehouses
✓ Warehouse staff can create draft receipts
✓ Warehouse staff can create draft deliveries
✓ Warehouse staff can view products
✓ Warehouse staff can view dashboard
```

### 2.8 Dashboard Tests
```
✓ GET /dashboard — returns correct KPI counts
✓ GET /dashboard — KPIs update after stock operations
✓ GET /dashboard — filters by warehouse
✓ GET /dashboard — filters by category
```

### 2.9 Stock Ledger Tests
```
✓ GET /stock-movements — returns paginated entries
✓ GET /stock-movements — filters by product
✓ GET /stock-movements — filters by movement type
✓ GET /stock-movements — filters by date range
✓ Ledger entries cannot be modified via API
✓ Ledger entries have correct before/after quantities
```

## 3. Test Data Setup

Each test suite:
1. Connects to MongoDB Memory Server
2. Seeds required base data (users, warehouses, locations, categories)
3. Runs tests
4. Cleans up after each test/suite

## 4. Running Tests

```bash
cd backend
npm test                 # Run all tests
npm test -- --watch      # Watch mode
npm test -- --coverage   # Coverage report
```

## 5. Coverage Targets

| Area | Target |
|------|--------|
| Controllers | 80%+ |
| Services | 90%+ |
| Middleware | 80%+ |
| Models | 70%+ |
