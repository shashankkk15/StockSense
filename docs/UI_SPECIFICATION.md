# StockSense — UI Specification

## 1. Design System

### 1.1 Color Palette (60/30/10 Rule)

#### 60% — Background & Surfaces
```css
--bg-primary: #FCF8F1;       /* Main background — light grain/soft cream */
--bg-white: #FFFFFF;          /* Cards, modals, inputs */
--bg-sidebar: #FFFFFF;        /* Sidebar background */
--border-light: #E5E7EB;     /* Subtle borders */
--border-medium: #D1D5DB;    /* Input borders */
```

#### 30% — Text & Structure
```css
--text-primary: #222222;      /* Primary text — dark charcoal */
--text-secondary: #6B7280;    /* Secondary text, metadata */
--text-tertiary: #9CA3AF;     /* Helper text, placeholders */
--text-disabled: #D1D5DB;     /* Disabled state */
```

#### 10% — Accent
```css
--accent-primary: #0066CC;    /* Royal Blue — primary brand accent */
--accent-hover: #0052A3;      /* Accent hover state */
--accent-light: #E6F0FA;      /* Accent background (badges, highlights) */
```

#### Semantic Colors
```css
--success: #10B981;           /* Green — completed, positive */
--success-bg: #ECFDF5;
--error: #EF4444;             /* Red — errors, destructive */
--error-bg: #FEF2F2;
--warning: #F59E0B;           /* Amber — warnings, caution */
--warning-bg: #FFFBEB;
--info: #3B82F6;              /* Blue — information */
--info-bg: #EFF6FF;
```

### 1.2 Typography

**Font Family**: Plus Jakarta Sans (Google Fonts)
```css
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
```

**Scale**:
| Element | Size | Weight | Color |
|---------|------|--------|-------|
| Page Title | 24px (1.5rem) | 700 Bold | --text-primary |
| Section Heading | 18px (1.125rem) | 600 Semibold | --text-primary |
| Card Title | 16px (1rem) | 600 Semibold | --text-primary |
| Body Text | 14px (0.875rem) | 400 Regular | --text-primary |
| Small/Meta | 12px (0.75rem) | 400 Regular | --text-secondary |
| Button Text | 14px (0.875rem) | 500 Medium | varies |
| Table Header | 12px (0.75rem) | 600 Semibold | --text-secondary |
| Table Body | 14px (0.875rem) | 400 Regular | --text-primary |
| Input Label | 14px (0.875rem) | 500 Medium | --text-primary |
| Input Value | 14px (0.875rem) | 400 Regular | --text-primary |

### 1.3 Spacing Scale
```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
```

### 1.4 Border Radius
```css
--radius-sm: 6px;    /* Badges, small elements */
--radius-md: 8px;    /* Buttons, inputs */
--radius-lg: 12px;   /* Cards, modals */
--radius-xl: 16px;   /* Large containers */
```

### 1.5 Shadows
```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.07);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.08);
--shadow-modal: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
```

---

## 2. Layout Structure

### 2.1 Dashboard Layout (Protected Pages)
```
┌──────────────────────────────────────────────────────┐
│ ┌─────────┐ ┌──────────────────────────────────────┐ │
│ │         │ │  Header (Search + Profile)            │ │
│ │         │ ├──────────────────────────────────────┤ │
│ │ Sidebar │ │                                      │ │
│ │  240px  │ │  Main Content Area                   │ │
│ │         │ │  (padding: 24px)                     │ │
│ │         │ │                                      │ │
│ │         │ │                                      │ │
│ │         │ │                                      │ │
│ └─────────┘ └──────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

### 2.2 Sidebar Design
- Width: 240px (desktop), collapsible on tablet, drawer on mobile
- Background: White with right border
- Logo at top
- Navigation items with Lucide icons
- Active state: accent color background + text
- Hover: subtle gray background
- Profile section at bottom

### 2.3 Header
- Height: 64px
- Contains: Search bar, notifications bell, user avatar/dropdown
- Sticky at top

---

## 3. Component Specifications

### 3.1 Buttons
```
Primary:   bg-accent, white text, 500 weight, 8px radius, 14px text
Secondary: white bg, border, dark text, 8px radius
Destructive: red bg, white text
Ghost:     transparent bg, text only
Sizes:     sm (32px h), md (40px h), lg (48px h)
States:    default, hover, active, disabled, loading
```

### 3.2 Inputs
```
Height:     40px
Border:     1px solid --border-medium
Radius:     8px
Focus:      2px ring in accent color
Error:      red border + error message below
Label:      above input, 500 weight
Padding:    0 12px
```

### 3.3 Tables
```
Header:     uppercase 12px, 600 weight, gray text, bg-gray-50
Rows:       14px, alternating white/gray-50 (subtle)
Hover:      light accent background
Pagination: bottom right, page numbers + prev/next
Empty:      centered illustration + message
Loading:    skeleton rows
```

### 3.4 Cards
```
Background: white
Border:     1px solid --border-light
Radius:     12px
Shadow:     --shadow-sm
Padding:    20px-24px
```

### 3.5 Badges / Status Tags
```
Draft:     gray bg, gray text
Waiting:   amber bg, amber text
Ready:     blue bg, blue text
Done:      green bg, green text
Canceled:  red bg, red text
```

### 3.6 Modals
```
Overlay:   rgba(0, 0, 0, 0.4)
Width:     480px (sm), 640px (md), 800px (lg)
Radius:    16px
Shadow:    --shadow-modal
Animation: fade + slide up (200ms)
```

### 3.7 Toast Notifications
```
Position:  top-right
Width:     360px
Duration:  4 seconds
Types:     success (green), error (red), warning (amber), info (blue)
Animation: slide in from right
```

---

## 4. Page Specifications

### 4.1 Dashboard
- KPI Cards row (5 cards)
- Inventory Overview section (operations table with filters)
- Stock Alerts sidebar panel
- Recent Activity feed

### 4.2 Products List
- Search bar + Category filter + Status filter
- Table: Name, SKU, Category, Stock, Unit, Status, Actions
- "Add Product" button (primary)
- Click row → Product detail

### 4.3 Product Detail
- Product info card
- Stock by Location table
- Reorder rules section
- Stock movement history for this product

### 4.4 Receipts/Deliveries/Transfers List
- Status tabs (All, Draft, Waiting, Ready, Done, Canceled)
- Table with columns relevant to each type
- "New Receipt/Delivery/Transfer" button
- Status badges

### 4.5 Operation Form (Create/Edit)
- Step-by-step or single-page form
- Supplier/Customer selector
- Warehouse + Location selector
- Product line items (add/remove rows)
- Quantity inputs
- Notes textarea
- Save Draft / Submit buttons

### 4.6 Warehouse Settings
- Warehouse list with location counts
- Add Warehouse form (Name, Code, Address)
- Expand warehouse → show locations
- Add Location form

### 4.7 Move History
- Full stock ledger table
- Filters: Product, Warehouse, Movement Type, Date Range
- Read-only, chronological (newest first)

### 4.8 Profile
- User info form (name, email, phone)
- Change password section

---

## 5. Responsive Breakpoints

```css
sm:  640px   /* Mobile landscape */
md:  768px   /* Tablet */
lg:  1024px  /* Small desktop */
xl:  1280px  /* Desktop */
2xl: 1536px  /* Large desktop */
```

### Mobile Adaptations
- Sidebar → hamburger menu drawer
- Tables → card-based layout or horizontal scroll
- Forms → single column
- KPI cards → 2 per row, stacked
- Header → simplified (icon-only actions)
