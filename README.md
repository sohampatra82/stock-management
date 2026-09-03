# Material Stock Management System

A complete Material Stock / Inventory Management System built with Node.js, Express, MongoDB, Mongoose, and EJS.

**Login is disabled** — open the app and use the dashboard directly. No admin credentials required.

## Features

- **No Login Required** — open and use immediately
- **Material Management** — Add, edit, delete, view, search, filter, and sort materials
- **Stock In** — Add stock with automatic quantity calculation and transaction logging
- **Stock Out / Issue** — Reduce stock with validation (cannot go below zero)
- **Automatic Stock Calculation** — Server-side stock updates
- **Email Notifications** — Automatic emails on stock reduction and low-stock alerts (optional)
- **Low Stock & Out of Stock** — Dashboard highlights and badges
- **Transaction History** — Complete audit trail of all stock movements
- **Reports** — Current stock, stock in/out, low stock + CSV export + date filters
- **Responsive UI** — Bootstrap 5, works on desktop, tablet, and mobile

## Tech Stack

- Node.js + Express.js
- MongoDB + Mongoose
- EJS templating
- Bootstrap 5
- express-session + connect-mongo
- Nodemailer
- method-override

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

## Installation

1. Extract the project

2. Install dependencies
   ```bash
   cd material-stock-management
   npm install
   ```

3. Configure environment
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set:
   - `MONGODB_URI` — your MongoDB connection string
   - `SESSION_SECRET` — any random string
   - `EMAIL_USER` / `EMAIL_PASSWORD` — optional (for email notifications)

4. Start the application
   ```bash
   npm start
   ```

5. Open **http://localhost:3000**

   You go straight to the Dashboard — **no login**.

## Main Routes

| Route | Description |
|-------|-------------|
| `/` or `/dashboard` | Dashboard with summary cards |
| `/materials` | Material list, search, filters |
| `/materials/add` | Add material |
| `/materials/edit/:id` | Edit material |
| `/materials/view/:id` | View material details |
| `/stock/add` | Add stock (Stock In) |
| `/stock/reduce` | Reduce / issue stock |
| `/stock/history` | Transaction history |
| `/reports` | Reports hub |
| `/reports/stock` | Current stock report (+ CSV) |
| `/reports/transactions` | Transaction report (+ CSV) |
| `/profile` | Simple profile (session only) |

## Stock Logic

**Stock In:** Validate → increase quantity → create STOCK_IN transaction

**Stock Out:** Validate → check quantity ≤ current stock → reduce → create STOCK_OUT transaction → send email (if configured) → low-stock alert if needed

## Email Setup (Optional)

If email is not configured, stock operations still work; notifications are skipped.

1. Gmail App Password in `EMAIL_PASSWORD`
2. Set `EMAIL_USER` and `ADMIN_EMAIL` in `.env`

## License

MIT
