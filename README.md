# StockSense — Enterprise Inventory Management System (Complete Master Documentation)

> **All-In-One Project Reference & Developer Manual**  
> Repository: [github.com/shashankkk15/StockSense](https://github.com/shashankkk15/StockSense)  
> Design Philosophy: Swiss-Modernist / Form Studio Aesthetic

---

## Table of Contents

1. [Executive Summary & Product Overview](#1-executive-summary--product-overview)
2. [System Architecture](#2-system-architecture)
3. [User Roles & Access Control Matrix (RBAC)](#3-user-roles--access-control-matrix-rbac)
4. [Core Features & Functional Workflows](#4-core-features--functional-workflows)
5. [Stock Ledger & Business Rules](#5-stock-ledger--business-rules)
6. [Database Schema & Data Models](#6-database-schema--data-models)
7. [REST API Specification](#7-rest-api-specification)
8. [UI/UX Design System Specification](#8-uiux-design-system-specification)
9. [Conversational AI Assistant](#9-conversational-ai-assistant)
10. [Local Development, Installation & Deployment](#10-local-development-installation--deployment)
11. [Testing & Operational Verification](#11-testing--operational-verification)

---

## 1. Executive Summary & Product Overview

**StockSense** is an enterprise-grade, multi-warehouse Inventory Management System (IMS) and SaaS platform engineered to replace error-prone manual spreadsheets, paper ledgers, and fragmented tracking tools with an immutable, real-time single source of truth.

### Key Value Propositions
- **Real-Time Visibility**: Live tracking across multiple facilities, internal racks, shelves, and transit states.
- **Double-Entry Stock Ledger**: Every inventory adjustment, receipt, delivery, and internal transfer records an immutable audit ledger entry.
- **Strict Role-Based Access Control**: Clean operational segregation between managerial authorization and warehouse floor execution.
- **Form Studio Swiss Aesthetic**: Modern, ultra-clean, high-density interface with zero visual fluff, engineered for fast keyboard-driven data entry and industrial clarity.
- **Embedded AI Operational Assistant**: In-app intelligent assistant guiding warehouse associates through daily tasks, procedures, and troubleshooting.

---

## 2. System Architecture

StockSense follows a decoupled, three-tier micro-service-ready architecture composed of a Next.js 14 presentation layer, a resilient Node.js/Express REST API layer, and an ACID-compliant MongoDB database.

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                           PRESENTATION LAYER                            │
│  Next.js 14 App Router (React 18) • TypeScript • Tailwind CSS • shadcn  │
│  Client State: React Context (Auth) • Motion: Framer Motion             │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                             RESTful HTTPS / JSON
                             JWT Bearer Auth
                                     │
┌────────────────────────────────────▼────────────────────────────────────┐
│                            APPLICATION LAYER                            │
│  Node.js / Express REST API • TypeScript • Zod / Joi Validation         │
│  Middleware: JWT Verify, RBAC Guard, Rate Limiting, Error Handling      │
│  Services: LedgerEngine, InventoryService, MovementService, Analytics   │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                               Mongoose ODM
                                     │
┌────────────────────────────────────▼────────────────────────────────────┐
│                                DATA LAYER                               │
│  MongoDB Database (Mongoose Schemas with Compound Indexes & Ledger)     │
│  Collections: Users, Products, Warehouses, Locations, Movements, etc.  │
└─────────────────────────────────────────────────────────────────────────┘
```

### Directory Structure

```text
StockSense/
├── backend/                       # Express.js REST API
│   ├── src/
│   │   ├── config/                # Database and environment configurations
│   │   ├── controllers/           # HTTP Request Handlers
│   │   │   ├── auth.controller.ts
│   │   │   ├── product.controller.ts
│   │   │   ├── warehouse.controller.ts
│   │   │   ├── operation.controller.ts
│   │   │   └── dashboard.controller.ts
│   │   ├── middleware/            # Security, Auth & RBAC
│   │   │   ├── auth.middleware.ts
│   │   │   ├── role.middleware.ts
│   │   │   └── error.middleware.ts
│   │   ├── models/                # Mongoose Schema Definitions
│   │   │   ├── User.ts
│   │   │   ├── Product.ts
│   │   │   ├── Warehouse.ts
│   │   │   ├── Location.ts
│   │   │   ├── Stock.ts
│   │   │   ├── StockMovement.ts
│   │   │   ├── Receipt.ts
│   │   │   ├── Delivery.ts
│   │   │   └── Transfer.ts
│   │   ├── routes/                # Route Registrations
│   │   ├── services/              # Core Domain Business Logic
│   │   │   ├── ledger.service.ts  # Ledger append and calculation
│   │   │   └── inventory.service.ts
│   │   └── server.ts              # Entry point
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                      # Next.js 14 Client Application
│   ├── app/                       # Next.js App Router (Pages & Layouts)
│   │   ├── (auth)/                # Login, Signup, Reset Password
│   │   ├── (dashboard)/           # Protected Application Views
│   │   │   ├── dashboard/         # Real-time Metrics & Feed
│   │   │   ├── products/          # Catalog & Stock Levels
│   │   │   ├── warehouses/        # Locations & Zones
│   │   │   ├── operations/        # Receipts, Deliveries, Transfers, Adjustments
│   │   │   ├── ledger/            # Full Audit Move History
│   │   │   └── profile/           # User Profile & Preferences
│   │   ├── layout.tsx             # Root layout with fonts & providers
│   │   └── page.tsx               # High-impact Swiss Landing Page
│   ├── components/
│   │   ├── layout/                # Sidebar, Header, Role Guards
│   │   └── ui/                    # Atomic Components (Button, Dialog, Chatbot)
│   ├── contexts/                  # AuthContext, ThemeContext
│   ├── lib/                       # API client, formatting, utilities
│   ├── public/                    # Static brand assets
│   ├── package.json
│   └── tailwind.config.ts
│
└── docs/                          # Detailed Technical Architecture Specifications
```

---

## 3. User Roles & Access Control Matrix (RBAC)

StockSense implements strict separation of concerns via role-based access control.

| Resource / Action | Inventory Manager | Warehouse Staff | Unauthenticated |
| :--- | :---: | :---: | :---: |
| **Login / Signup / Password Reset** | ✅ | ✅ | ✅ |
| **View Dashboard & KPI Analytics** | ✅ | ✅ (Limited) | ❌ |
| **Create & Edit Products** | ✅ | ❌ | ❌ |
| **Create & Manage Warehouses / Racks** | ✅ | ❌ | ❌ |
| **Create Draft Receipts / Deliveries** | ✅ | ✅ | ❌ |
| **Validate Operations (Execute Stock Change)** | ✅ | ❌ | ❌ |
| **Initiate Stock Adjustments (Physical Count)** | ✅ | ✅ (Draft only) | ❌ |
| **Validate / Approve Stock Adjustments** | ✅ | ❌ | ❌ |
| **View Complete Stock Ledger Audit Trail** | ✅ | ✅ (Read-only) | ❌ |
| **Manage Users & Permissions** | ✅ | ❌ | ❌ |

---

## 4. Core Features & Functional Workflows

### 4.1. Product & Catalog Management
- **Unique SKU Identifier**: Strict system-wide uniqueness constraint on SKU codes.
- **Hierarchical Classification**: Category, Unit of Measure (UOM), barcode/QR tracking.
- **Stock Thresholds**: Reordering levels and minimum safe stock alerts.

### 4.2. Receipts (Incoming Stock)
- Flow: `Draft` ➔ `Waiting` ➔ `Ready` ➔ `Done` (or `Canceled`).
- Supplier invoice correlation, expected arrival tracking, and batch/lot allocation.
- Validation automatically increments stock at destination location and writes positive ledger entries.

### 4.3. Delivery Orders (Outgoing Stock)
- Flow: `Draft` ➔ `Waiting` ➔ `Ready` ➔ `Done` (or `Canceled`).
- Three-stage processing: **Pick** items from location, **Pack** into shipping containers, and **Validate** shipment.
- Stock availability verification: Prevents validation if available on-hand quantity is less than ordered quantity.
- Validation automatically decrements stock at source location and writes negative ledger entries.

### 4.4. Internal Transfers
- Transfer inventory between distinct warehouses (Inter-warehouse) or between racks/zones within the same facility (Intra-warehouse).
- Total system stock remains neutral: Source location decreases while destination location increases by identical units.

### 4.5. Stock Adjustments (Physical Count Reconciliation)
- Associate inputs physical floor counts.
- System automatically calculates the differential variance (`Difference = Counted - SystemRecorded`).
- Upon Manager approval, system corrects current stock and writes a reconciliation audit record.

---

## 5. Stock Ledger & Business Rules

### Core Ledger Invariant
Current stock at any point in time is not merely a mutable integer; it is the deterministic sum of all ledger events:

$$\text{Current Stock} = \sum_{\text{movements}} \Delta \text{Quantity}$$

### Immutable Audit Log
1. **No Mutations or Deletions**: Stock ledger records (`StockMovement`) cannot be modified or deleted once created.
2. **Reversals via Offsetting Transactions**: Any cancellation or operational error must be corrected via a compensating transaction with a reverse sign.
3. **Zero Negative Stock Invariant**: A delivery or transfer operation cannot be validated if it would cause on-hand available stock to drop below zero.

### Movement Types
- `RECEIPT`: Inward movement from external vendor (Stock increase).
- `DELIVERY`: Outward movement to client/customer (Stock decrease).
- `TRANSFER_OUT`: Outward movement from source location.
- `TRANSFER_IN`: Inward movement to destination location.
- `ADJUSTMENT`: Inventory reconciliation variance (Positive or Negative).

---

## 6. Database Schema & Data Models

### 6.1. User Schema (`User`)
```typescript
{
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true }, // bcrypt hashed
  role: { type: String, enum: ['inventory_manager', 'warehouse_staff'], default: 'warehouse_staff' },
  avatar: { type: String },
  isActive: { type: Boolean, default: true },
  resetOTP: { type: String },
  resetOTPExpiry: { type: Date }
}
```

### 6.2. Product Schema (`Product`)
```typescript
{
  name: { type: String, required: true },
  sku: { type: String, required: true, unique: true, uppercase: true, index: true },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  uom: { type: String, required: true, default: 'Units' }, // Units, Kg, Box, Liters
  description: { type: String },
  costPrice: { type: Number, default: 0 },
  sellingPrice: { type: Number, default: 0 },
  reorderLevel: { type: Number, default: 10 },
  isActive: { type: Boolean, default: true }
}
```

### 6.3. Warehouse & Location Schema (`Warehouse`, `Location`)
```typescript
// Warehouse
{
  name: { type: String, required: true, unique: true },
  code: { type: String, required: true, unique: true, uppercase: true },
  address: { street: String, city: String, state: String, zip: String, country: String },
  isActive: { type: Boolean, default: true }
}

// Location (Rack / Bin / Zone)
{
  warehouse: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  name: { type: String, required: true }, // e.g. "Rack-A-01"
  code: { type: String, required: true, uppercase: true },
  type: { type: String, enum: ['storage', 'receiving', 'shipping', 'production'], default: 'storage' }
}
```

### 6.4. Stock Balance Schema (`Stock`)
```typescript
{
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  warehouse: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  location: { type: Schema.Types.ObjectId, ref: 'Location', required: true },
  quantity: { type: Number, required: true, default: 0, min: 0 }
}
// Compound unique index: { product: 1, warehouse: 1, location: 1 }
```

### 6.5. Stock Movement Ledger Schema (`StockMovement`)
```typescript
{
  referenceNumber: { type: String, required: true, index: true },
  movementType: { type: String, enum: ['RECEIPT', 'DELIVERY', 'TRANSFER_IN', 'TRANSFER_OUT', 'ADJUSTMENT'], required: true },
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  warehouse: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  location: { type: Schema.Types.ObjectId, ref: 'Location', required: true },
  quantity: { type: Number, required: true }, // positive or negative
  previousQuantity: { type: Number, required: true },
  newQuantity: { type: Number, required: true },
  performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  documentReference: { type: String }, // e.g., REC-2026-001
  notes: { type: String },
  timestamp: { type: Date, default: Date.now, index: true }
}
```

---

## 7. REST API Specification

**Base URL**: `http://localhost:5000/api`  
**Authentication**: Headers require `Authorization: Bearer <jwt_token>` for protected routes.

### Standard Response Envelope
```json
{
  "success": true,
  "data": {},
  "message": "Operation executed successfully",
  "pagination": { "page": 1, "limit": 20, "total": 100, "pages": 5 }
}
```

### 7.1. Authentication Endpoints (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Create new user account |
| `POST` | `/api/auth/login` | Public | Authenticate and return JWT token |
| `POST` | `/api/auth/logout` | Authenticated | Revoke session |
| `POST` | `/api/auth/forgot-password` | Public | Request 6-digit reset OTP |
| `POST` | `/api/auth/reset-password` | Public | Verify OTP and update password |
| `GET` | `/api/auth/me` | Authenticated | Fetch current user session |

### 7.2. Products Endpoints (`/api/products`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | All Staff | List products (supports `?search=`, `?category=`, pagination) |
| `GET` | `/api/products/:id` | All Staff | Retrieve product details with stock per location |
| `POST` | `/api/products` | Manager | Create new product SKU |
| `PUT` | `/api/products/:id` | Manager | Update product attributes |
| `DELETE` | `/api/products/:id` | Manager | Soft-delete / deactivate product |

### 7.3. Warehouses & Locations (`/api/warehouses`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/warehouses` | All Staff | List all operational warehouses |
| `POST` | `/api/warehouses` | Manager | Create new warehouse facility |
| `GET` | `/api/warehouses/:id/locations`| All Staff | List storage locations/racks within warehouse |
| `POST` | `/api/warehouses/:id/locations`| Manager | Create storage location within warehouse |

### 7.4. Operations & Ledger (`/api/operations`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/operations/receipts` | All Staff | List receipts by status |
| `POST` | `/api/operations/receipts` | All Staff | Create draft receipt |
| `POST` | `/api/operations/receipts/:id/validate` | Manager | Validate receipt & execute stock receipt |
| `GET` | `/api/operations/deliveries` | All Staff | List delivery orders |
| `POST` | `/api/operations/deliveries` | All Staff | Create delivery order |
| `POST` | `/api/operations/deliveries/:id/validate` | Manager | Validate delivery & decrement stock |
| `POST` | `/api/operations/transfers` | All Staff | Initiate internal stock transfer |
| `POST` | `/api/operations/adjustments` | All Staff | Submit physical count adjustment |
| `GET` | `/api/operations/ledger` | All Staff | Query immutable stock move ledger |

### 7.5. Dashboard & Analytics (`/api/dashboard`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard/stats` | All Staff | Total products, low stock alerts, pending operations |
| `GET` | `/api/dashboard/activity` | All Staff | Real-time recent stock activity stream |

---

## 8. UI/UX Design System Specification

StockSense adheres to an editorial, architectural Swiss Modernist design system dubbed **Form Studio**.

### 8.1. Color Tokens
| Name | Hex Code | Role |
| :--- | :--- | :--- |
| **Warm Ivory** | `#FCF8F1` | Primary background canvas |
| **Deep Charcoal** | `#222222` | Core structural boundaries, text, and 1px borders |
| **Pure White** | `#FFFFFF` | Card surfaces, inputs, and modal backgrounds |
| **Brand Crimson** | `#E52B1A` | High-urgency indicators, primary CTAs, active highlights |
| **Muted Cream** | `#F4EFE6` | Table alternating rows, hover fills, secondary tags |

### 8.2. Typography
- **Headings & Accents**: `Space Grotesk` (Geometric, monospace-inspired character, high authority)
- **Body & Data**: `Plus Jakarta Sans` / `Inter` (Optimized for readability at high information density)

### 8.3. Design Principles
- **No Soft Skeuomorphism**: Flat surfaces with crisp 1px `#222222` borders.
- **High Data Density**: Minimal padding, structured tables, and compact metrics.
- **Keyboard-First Ergonomics**: Tab-friendly forms with immediate validation feedback.

---

## 9. Conversational AI Assistant

StockSense features an embedded intelligent assistant (**StockSense AI Assistant**) located in the bottom-right corner of the application.

### Capabilities
- **Context-Aware Guidance**: Understands whether the active user is a Manager or Warehouse Staff and tailors instructions accordingly.
- **Workflow Walkthroughs**: Guides staff step-by-step through complex operations (e.g., executing a three-way receipt match, performing cycle counts, or resolving negative stock errors).
- **Instant Search & Navigation**: Directs users immediately to relevant screens and filters.

---

## 10. Local Development, Installation & Deployment

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: Local MongoDB community instance (`mongodb://localhost:27017`) or MongoDB Atlas cluster URI

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/shashankkk15/StockSense.git
cd StockSense
```

---

### Step 2: Configure and Start the Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` configuration file:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/stocksense
   JWT_SECRET=your_super_secret_jwt_key_here
   NODE_ENV=development
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The backend will be live at `http://localhost:5000`.*

---

### Step 3: Configure and Start the Frontend

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` configuration file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```
4. Start the frontend Next.js server:
   ```bash
   npm run dev
   ```
   *The client web application will be accessible at `http://localhost:3000`.*

---

### Step 4: Seed Initial Demo Accounts

Default preconfigured testing credentials:
- **Inventory Manager**: `admin@stocksense.com` / `Admin@123`
- **Warehouse Staff**: `john@stocksense.com` / `Staff@123`

---

## 11. Testing & Operational Verification

### Automated Test Suites
- **Unit & Integration Tests**:
  ```bash
  # Inside /backend
  npm run test
  ```
- **Linting & Type Checking**:
  ```bash
  # Frontend typecheck
  cd frontend && npm run build
  # Backend typecheck
  cd backend && npx tsc --noEmit
  ```

### Manual Sanity Walkthrough
1. **Log in as Manager**: Verify access to products, warehouses, and full validation buttons.
2. **Create a Warehouse & Rack**: Create `Warehouse Central` and `Rack-01`.
3. **Add Product SKU**: Register `PROD-001` with reorder threshold `10`.
4. **Execute Receipt**: Create receipt for 50 units of `PROD-001` to `Rack-01` and validate.
5. **Inspect Stock Ledger**: Navigate to `/operations/ledger` and verify the `+50` ledger event exists with timestamp and user ID.
6. **Log in as Warehouse Staff**: Confirm that managerial deletion and direct warehouse modifications are disabled.

---

## 📄 License & Attribution

Copyright © 2026 Form Studio Systems. All Rights Reserved.  
Distributed under the MIT License.
