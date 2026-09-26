# StockSense — Product Requirements Document (PRD)

## 1. Product Overview

**StockSense** is a modular Inventory Management System (IMS) that digitizes and streamlines all stock-related operations within a business. It replaces manual registers, Excel sheets, and scattered tracking methods with a centralized, real-time, easy-to-use application.

## 2. Target Users

| Role | Responsibilities |
|------|-----------------|
| **Inventory Manager** | Manage incoming & outgoing stock, validate operations, configure warehouses, manage products, view reports |
| **Warehouse Staff** | Perform transfers, picking, shelving, counting, create draft operations |

## 3. Functional Requirements

### 3.1 Authentication
- FR-AUTH-01: User signup with email, name, password
- FR-AUTH-02: User login with email/password
- FR-AUTH-03: User logout
- FR-AUTH-04: OTP-based password reset
- FR-AUTH-05: Protected routes (redirect unauthenticated users to login)
- FR-AUTH-06: Role-based access control (Inventory Manager, Warehouse Staff)
- FR-AUTH-07: User profile management
- FR-AUTH-08: After successful login → redirect to Inventory Dashboard

### 3.2 Dashboard
- FR-DASH-01: Display Total Products in Stock (KPI)
- FR-DASH-02: Display Low Stock / Out of Stock Items (KPI)
- FR-DASH-03: Display Pending Receipts (KPI)
- FR-DASH-04: Display Pending Deliveries (KPI)
- FR-DASH-05: Display Internal Transfers Scheduled (KPI)
- FR-DASH-06: Filter by document type (Receipts / Delivery / Internal / Adjustments)
- FR-DASH-07: Filter by status (Draft, Waiting, Ready, Done, Canceled)
- FR-DASH-08: Filter by warehouse or location
- FR-DASH-09: Filter by product category
- FR-DASH-10: All data sourced from real database (no hard-coded values)
- FR-DASH-11: Recent inventory activity feed
- FR-DASH-12: Stock alert notifications (low stock items)

### 3.3 Product Management
- FR-PROD-01: Create product with Name, SKU/Code, Category, Unit of Measure, Initial Stock (optional)
- FR-PROD-02: Update product details
- FR-PROD-03: View product details with stock information
- FR-PROD-04: Product search (by name, SKU)
- FR-PROD-05: Category filtering
- FR-PROD-06: Stock availability per location
- FR-PROD-07: Reordering rules (minimum stock threshold, reorder level)
- FR-PROD-08: SKU uniqueness constraint
- FR-PROD-09: Product categories (CRUD)

### 3.4 Receipts (Incoming Goods)
- FR-REC-01: Create a new receipt
- FR-REC-02: Add supplier to receipt
- FR-REC-03: Add products with quantities
- FR-REC-04: Validate receipt → stock increases automatically
- FR-REC-05: Receipt status workflow: Draft → Waiting → Ready → Done
- FR-REC-06: Stock ledger entry created on validation
- FR-REC-07: Cancel receipt capability

### 3.5 Delivery Orders (Outgoing Goods)
- FR-DEL-01: Create delivery order
- FR-DEL-02: Pick items (select products and quantities)
- FR-DEL-03: Pack items
- FR-DEL-04: Validate → stock decreases automatically
- FR-DEL-05: Delivery status workflow: Draft → Waiting → Ready → Done
- FR-DEL-06: Stock ledger entry created on validation
- FR-DEL-07: Insufficient stock validation
- FR-DEL-08: Cancel delivery capability
- FR-DEL-09: Associate customer with delivery

### 3.6 Internal Transfers
- FR-TRN-01: Move stock between warehouses (Warehouse 1 → Warehouse 2)
- FR-TRN-02: Move stock between locations (Rack A → Rack B)
- FR-TRN-03: Move stock to production (Main Warehouse → Production Floor)
- FR-TRN-04: Source location stock decreases, destination increases
- FR-TRN-05: Total company stock remains unchanged
- FR-TRN-06: Each movement logged in the stock ledger
- FR-TRN-07: Transfer status workflow: Draft → Waiting → Ready → Done

### 3.7 Stock Adjustments
- FR-ADJ-01: Select product and location
- FR-ADJ-02: Enter physical count (counted quantity)
- FR-ADJ-03: System compares with recorded stock
- FR-ADJ-04: Calculate difference automatically
- FR-ADJ-05: Update stock on validation
- FR-ADJ-06: Create ledger entry with full audit trail
- FR-ADJ-07: Record: user, product, location, previous qty, counted qty, difference, reason, timestamp

### 3.8 Stock Ledger
- FR-LED-01: Every inventory-changing operation creates a ledger entry
- FR-LED-02: Track: product, warehouse, location, movement type, quantity, before qty, after qty, reference document, user, timestamp
- FR-LED-03: Movement types: RECEIPT, DELIVERY, TRANSFER_IN, TRANSFER_OUT, ADJUSTMENT
- FR-LED-04: Ledger is immutable audit history (no arbitrary edits)
- FR-LED-05: Move history view accessible from Operations menu

### 3.9 Multi-Warehouse Support
- FR-WH-01: Multiple warehouses
- FR-WH-02: Each warehouse contains multiple locations (racks, production areas)
- FR-WH-03: Stock trackable at Product → Warehouse → Location level
- FR-WH-04: Calculate total product stock, warehouse stock, location stock
- FR-WH-05: Warehouse CRUD in Settings

### 3.10 Low Stock & Reordering
- FR-REORD-01: Minimum stock threshold per product
- FR-REORD-02: Reorder level per product
- FR-REORD-03: Low-stock status detection
- FR-REORD-04: Out-of-stock status detection
- FR-REORD-05: Dashboard alerts for low stock items

### 3.11 Suppliers & Customers
- FR-SUP-01: Supplier management (used in receipts)
- FR-SUP-02: Customer management (used in deliveries)
- FR-SUP-03: Basic CRUD within inventory scope

## 4. Navigation Structure (from PDF/Mockup)

```
Sidebar:
├── Dashboard
├── Products
├── Operations
│   ├── Receipts
│   ├── Delivery Orders
│   ├── Inventory Adjustments
│   └── Move History
├── Settings
│   └── Warehouse
└── Profile
    ├── My Profile
    └── Logout
```

## 5. Non-Functional Requirements

- NFR-01: Real-time data (no hard-coded values)
- NFR-02: Responsive design (Desktop, Tablet, Mobile)
- NFR-03: Professional SaaS-quality UI
- NFR-04: Secure authentication (bcrypt hashing, JWT)
- NFR-05: Input validation (client + server)
- NFR-06: Consistent error handling
- NFR-07: Audit trail for all inventory operations
- NFR-08: Data consistency (transactions for stock operations)
- NFR-09: Accessibility (semantic HTML, keyboard navigation)
- NFR-10: Performance (pagination, indexed queries)

## 6. Simplified Inventory Flow Example (from PDF)

```
Step 1: Receive 100 kg Steel → Stock: +100
Step 2: Internal Transfer: Main Store → Production Rack → Stock unchanged total, location updated
Step 3: Deliver 20 steel → Stock: -20
Step 4: Adjust 3 kg damaged → Stock: -3
Everything logged in the Stock Ledger.
```
