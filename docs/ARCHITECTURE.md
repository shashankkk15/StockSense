# StockSense — Architecture Document

## 1. System Architecture Overview

StockSense follows a **three-tier architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────┐
│                    CLIENT                        │
│         Next.js + TypeScript + Tailwind          │
│              (Port 3000)                         │
└─────────────────────┬───────────────────────────┘
                      │ HTTP/REST
┌─────────────────────▼───────────────────────────┐
│                    SERVER                        │
│       Express.js + TypeScript + Mongoose         │
│              (Port 5000)                         │
└─────────────────────┬───────────────────────────┘
                      │ MongoDB Driver
┌─────────────────────▼───────────────────────────┐
│                  DATABASE                        │
│               MongoDB (Port 27017)               │
└─────────────────────────────────────────────────┘
```

## 2. Frontend Architecture

### 2.1 Technology Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context + useReducer for auth; SWR for server state
- **HTTP Client**: Axios with interceptors
- **Form Handling**: React Hook Form + Zod validation
- **Notifications**: react-hot-toast
- **Icons**: Lucide React

### 2.2 Frontend Directory Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Auth layout group
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   └── forgot-password/
│   │   ├── (dashboard)/        # Dashboard layout group (protected)
│   │   │   ├── layout.tsx      # Sidebar + Header layout
│   │   │   ├── page.tsx        # Dashboard home
│   │   │   ├── products/
│   │   │   ├── operations/
│   │   │   │   ├── receipts/
│   │   │   │   ├── deliveries/
│   │   │   │   ├── adjustments/
│   │   │   │   └── move-history/
│   │   │   ├── settings/
│   │   │   │   └── warehouses/
│   │   │   └── profile/
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                 # Reusable base components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── Dropdown.tsx
│   │   │   ├── Pagination.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── ConfirmDialog.tsx
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── MobileNav.tsx
│   │   ├── dashboard/
│   │   ├── products/
│   │   ├── operations/
│   │   └── settings/
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── useFetch.ts
│   ├── lib/
│   │   ├── api.ts              # Axios instance
│   │   ├── constants.ts
│   │   └── utils.ts
│   └── types/
│       └── index.ts            # Shared TypeScript interfaces
├── public/
├── tailwind.config.ts
├── next.config.js
├── tsconfig.json
└── package.json
```

## 3. Backend Architecture

### 3.1 Technology Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database ORM**: Mongoose
- **Authentication**: JWT (jsonwebtoken) + bcryptjs
- **Validation**: Zod
- **Email (OTP)**: Nodemailer (configurable)
- **Logging**: Winston

### 3.2 Backend Directory Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts         # MongoDB connection
│   │   ├── env.ts              # Environment validation
│   │   └── cors.ts
│   ├── models/
│   │   ├── User.ts
│   │   ├── Product.ts
│   │   ├── Category.ts
│   │   ├── Warehouse.ts
│   │   ├── Location.ts
│   │   ├── Supplier.ts
│   │   ├── Customer.ts
│   │   ├── Receipt.ts
│   │   ├── Delivery.ts
│   │   ├── Transfer.ts
│   │   ├── StockAdjustment.ts
│   │   ├── Stock.ts
│   │   ├── StockMovement.ts
│   │   ├── ReorderRule.ts
│   │   └── Notification.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── product.routes.ts
│   │   ├── category.routes.ts
│   │   ├── warehouse.routes.ts
│   │   ├── location.routes.ts
│   │   ├── supplier.routes.ts
│   │   ├── customer.routes.ts
│   │   ├── receipt.routes.ts
│   │   ├── delivery.routes.ts
│   │   ├── transfer.routes.ts
│   │   ├── adjustment.routes.ts
│   │   ├── stock.routes.ts
│   │   ├── stockMovement.routes.ts
│   │   ├── dashboard.routes.ts
│   │   └── notification.routes.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── product.controller.ts
│   │   ├── category.controller.ts
│   │   ├── warehouse.controller.ts
│   │   ├── location.controller.ts
│   │   ├── supplier.controller.ts
│   │   ├── customer.controller.ts
│   │   ├── receipt.controller.ts
│   │   ├── delivery.controller.ts
│   │   ├── transfer.controller.ts
│   │   ├── adjustment.controller.ts
│   │   ├── stock.controller.ts
│   │   ├── stockMovement.controller.ts
│   │   └── dashboard.controller.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── stock.service.ts    # Core stock calculation logic
│   │   ├── ledger.service.ts   # Stock movement ledger
│   │   └── notification.service.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── role.middleware.ts
│   │   ├── validate.middleware.ts
│   │   ├── errorHandler.middleware.ts
│   │   └── rateLimiter.middleware.ts
│   ├── validators/
│   │   ├── auth.validator.ts
│   │   ├── product.validator.ts
│   │   ├── receipt.validator.ts
│   │   ├── delivery.validator.ts
│   │   ├── transfer.validator.ts
│   │   └── adjustment.validator.ts
│   ├── utils/
│   │   ├── AppError.ts
│   │   ├── logger.ts
│   │   ├── otp.ts
│   │   └── helpers.ts
│   └── app.ts                  # Express app setup
│   └── server.ts               # Entry point
├── tests/
│   ├── auth.test.ts
│   ├── product.test.ts
│   ├── receipt.test.ts
│   ├── delivery.test.ts
│   ├── transfer.test.ts
│   └── adjustment.test.ts
├── seeds/
│   └── seed.ts
├── tsconfig.json
└── package.json
```

## 4. API Design Pattern

All API endpoints follow a consistent pattern:

### Request Flow
```
Client Request
    → CORS Middleware
    → Rate Limiter
    → Auth Middleware (JWT verification)
    → Role Middleware (permission check)
    → Validation Middleware (Zod schema)
    → Controller (request handling)
    → Service (business logic)
    → Model (database operations)
    → Response
```

### Response Format
```json
// Success
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "pagination": { "page": 1, "limit": 20, "total": 100, "pages": 5 }
}

// Error
{
  "success": false,
  "message": "Insufficient stock for product XYZ",
  "code": "INSUFFICIENT_STOCK"
}
```

## 5. Authentication Flow

```
┌─────────┐     POST /auth/register     ┌─────────┐
│  Client  │ ─────────────────────────→ │  Server  │
│          │ ←───────────────────────── │          │
│          │     { token, user }         │          │
│          │                             │          │
│          │     POST /auth/login        │          │
│          │ ─────────────────────────→ │          │
│          │ ←───────────────────────── │          │
│          │     { token, user }         │          │
│          │                             │          │
│          │     GET /api/* (Protected)  │          │
│          │     Authorization: Bearer   │          │
│          │ ─────────────────────────→ │          │
│          │     JWT verified → proceed  │          │
└─────────┘                             └─────────┘
```

## 6. Stock Operation Flow (Critical Path)

```
Operation Request (e.g., Validate Receipt)
    │
    ├── 1. Validate request data
    ├── 2. Check permissions (role-based)
    ├── 3. Begin MongoDB session/transaction
    ├── 4. Validate business rules
    │       ├── Check stock availability (for deliveries)
    │       ├── Check source location stock (for transfers)
    │       └── Validate quantities
    ├── 5. Update Stock records
    │       ├── Increment/Decrement stock at location level
    │       └── Update product total stock
    ├── 6. Create StockMovement (ledger entry)
    │       ├── Product, warehouse, location
    │       ├── Movement type, quantity
    │       ├── Before/After quantities
    │       ├── Reference document
    │       └── User, timestamp
    ├── 7. Update document status (→ Done)
    ├── 8. Check reorder rules → create notifications if needed
    ├── 9. Commit transaction
    └── 10. Return success response
```

## 7. Design Decisions

### 7.1 Why Next.js App Router?
- Built-in routing with layouts
- Server-side rendering capability
- Route groups for auth vs dashboard layouts
- Built-in API route support (not used — separate backend)

### 7.2 Why Separate Express Backend?
- Clear separation of concerns
- Independent scaling
- Standard REST API consumable by any client
- Easier testing of business logic

### 7.3 Why SWR over Redux?
- Lighter weight for server-state management
- Built-in caching, revalidation, and deduplication
- No boilerplate; fits data-fetching patterns
- Auth context handles the only true client state

### 7.4 Why Zod for Validation?
- Works on both frontend (React Hook Form) and backend
- TypeScript-first with automatic type inference
- Composable schemas

### 7.5 Why MongoDB Transactions?
- Stock operations must be atomic
- Prevents partial updates (stock updated but ledger entry missing)
- Ensures data consistency across Stock + StockMovement + Document updates

## 8. Security Architecture

```
┌─────────────────────────────────────────────┐
│               Security Layers                │
├─────────────────────────────────────────────┤
│ 1. CORS — Restrict origins                  │
│ 2. Rate Limiting — Prevent brute force      │
│ 3. JWT Auth — Verify identity               │
│ 4. RBAC — Verify permissions                │
│ 5. Input Validation — Prevent injection     │
│ 6. Password Hashing — bcrypt (12 rounds)    │
│ 7. Environment Variables — No secrets in    │
│    source code                              │
│ 8. Error Sanitization — No stack traces     │
│    in production                            │
│ 9. Audit Logging — Track all stock changes  │
└─────────────────────────────────────────────┘
```
