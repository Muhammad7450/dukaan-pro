# DukaanPro Mobile App - Interface Design

## Design Principles
- **Orientation:** Mobile portrait (9:16)
- **One-handed usage:** All interactive elements within thumb reach
- **Target Devices:** 5-inch minimum screens
- **Design Language:** Apple Human Interface Guidelines (HIG) - iOS-first
- **Theme:** Clean white background with green accent (#2E7D32)
- **Touch Targets:** Minimum 48px for all interactive elements

---

## Screen List

### 1. **Authentication & Setup Screens**
- **PIN Login Screen** - 4-digit PIN entry with numeric keypad
- **Shop Setup Screen** - First launch: shop name, owner name input
- **Welcome Screen** - After setup, before dashboard

### 2. **Dashboard (Home)**
- Today's total sales amount (large display)
- Today's transaction count
- Low stock alerts (scrollable list of products below min qty)
- Quick action buttons: New Sale, Add Product, View Reports
- Sync status indicator (top-right corner)

### 3. **Products (Inventory Management)**
- **Products List Screen**
  - Search bar (top)
  - Filter by category (horizontal scroll)
  - Product cards showing: name, category, current stock, sale price
  - Low stock badge (red) if below minimum
  - Edit/Delete actions (swipe or long-press)
  
- **Add/Edit Product Screen**
  - Form fields: name, category (dropdown), purchase price, sale price, current stock, minimum stock alert qty
  - Save button (bottom, full-width)
  - Cancel button

### 4. **New Sale / Billing**
- **Product Selection Screen**
  - Search/filter products
  - Select multiple products (checkbox)
  - Quantity input for each selected product
  
- **Bill Summary Screen**
  - List of selected items with quantity × price
  - Auto-calculated subtotal and total
  - Payment type selector: Cash / Udhaar (radio buttons)
  - If Udhaar: Customer selector/creator
  - Confirm Sale button (bottom)
  - WhatsApp Share button (secondary action)

### 5. **Customers**
- **Customers List Screen**
  - Search by name/phone
  - Customer cards showing: name, phone, total udhaar balance (red if owing)
  - Add Customer button (floating action button)
  
- **Customer Detail Screen**
  - Customer name, phone
  - Total udhaar balance (prominent)
  - Payment history (scrollable list)
  - Mark as Paid button (for full/partial payment)
  - WhatsApp Reminder button
  - Delete customer option

### 6. **Reports**
- **Reports Screen**
  - Time filter tabs: Today / This Week / This Month
  - Key metrics (cards):
    - Total Sales (amount)
    - Total Profit (amount)
    - Total Transactions (count)
  - Best Selling Products (top 5, list)
  - Weekly Sales Chart (simple bar chart)
  - Export to WhatsApp button

---

## Primary Content & Functionality

### Dashboard
- **Content:** Sales metrics, alerts, quick actions
- **Functionality:** Navigate to all major screens, view low stock alerts
- **Data:** Fetched from SQLite on app load, updated after each sale

### Products
- **Content:** Searchable/filterable product list
- **Functionality:** Add, edit, delete products; view stock levels
- **Data:** All products stored in SQLite; stock decreases on sale

### Sales
- **Content:** Multi-product selection, bill generation
- **Functionality:** Select products, enter quantities, choose payment type, generate bill
- **Data:** Sale saved to SQLite; customer created if needed (for Udhaar)

### Customers
- **Content:** Customer list, udhaar balance, payment history
- **Functionality:** Add customer, view history, mark payments, send WhatsApp reminders
- **Data:** Customer info and payment history in SQLite

### Reports
- **Content:** Sales metrics, product performance, weekly trends
- **Functionality:** Filter by time period, view charts, export to WhatsApp
- **Data:** Aggregated from SQLite sales data

---

## Key User Flows

### Flow 1: New Sale (Cash)
1. User taps "New Sale" from dashboard
2. Product Selection Screen: Search/select products, enter quantities
3. Bill Summary: Review total, select "Cash"
4. Confirm Sale → Sale saved to SQLite, stock decreases
5. Return to Dashboard

### Flow 2: New Sale (Udhaar)
1. User taps "New Sale" from dashboard
2. Product Selection Screen: Search/select products, enter quantities
3. Bill Summary: Review total, select "Udhaar"
4. Customer Selector: Choose existing customer or create new one
5. Confirm Sale → Sale saved, customer udhaar balance updated
6. Option to share bill via WhatsApp

### Flow 3: Manage Udhaar
1. User navigates to Customers tab
2. Taps on a customer with udhaar balance
3. Customer Detail Screen: View balance and payment history
4. Taps "Mark as Paid"
5. Enter payment amount (full or partial)
6. Payment saved, balance updated

### Flow 4: View Reports
1. User navigates to Reports tab
2. Select time filter (Today/Week/Month)
3. View metrics, product performance, and chart
4. Optional: Export to WhatsApp

---

## Color Choices

| Element | Color | Usage |
|---------|-------|-------|
| **Primary Accent** | #2E7D32 (Green) | Buttons, active states, highlights |
| **Background** | #FFFFFF (White) | Main screen background |
| **Surface** | #F5F5F5 (Light Gray) | Cards, elevated surfaces |
| **Text Primary** | #11181C (Dark Gray) | Headings, body text |
| **Text Secondary** | #687076 (Medium Gray) | Subtitles, labels |
| **Success** | #22C55E (Light Green) | Positive feedback |
| **Warning** | #F59E0B (Amber) | Low stock alerts |
| **Error** | #EF4444 (Red) | Udhaar balance, delete actions |
| **Border** | #E5E7EB (Light Border) | Dividers, card borders |

---

## Navigation Structure

```
Bottom Tab Navigation:
├── Home (Dashboard)
├── Products (Inventory)
├── New Sale (Billing)
├── Customers
└── Reports

Stack Navigation (within each tab):
├── Dashboard
│   ├── Low Stock Detail (modal)
│   └── Quick Actions
├── Products
│   ├── Products List
│   ├── Add Product
│   └── Edit Product
├── New Sale
│   ├── Product Selection
│   └── Bill Summary
├── Customers
│   ├── Customers List
│   ├── Customer Detail
│   ├── Add Customer
│   └── Mark Payment
└── Reports
    └── Reports Detail
```

---

## Responsive Design Notes
- All screens designed for 5-inch minimum (375px width)
- Touch targets: 48px minimum height
- Padding: 16px standard, 12px compact
- Font sizes: 16px body, 18px subheading, 20px+ heading
- Lists use `FlatList` for performance
- Forms stack vertically on small screens
- Charts scale responsively

---

## Accessibility
- All buttons have clear labels
- Color not the only indicator (use icons + text)
- Confirmation dialogs before destructive actions
- Loading states clearly indicated
- Empty states with helpful messages
