# Digital Invoice Generator

A full‑stack web application for creating, managing, and exporting professional invoices.

This repository contains:

- **`server/`**: Node.js + Express REST API (MongoDB, JWT auth) + PDF/email utilities
- **`ui-v2/`**: **Primary frontend** (React + Vite + Tailwind + Framer Motion)
- **`client/`**: Legacy frontend (kept for reference; `ui-v2/` is the active UI)

---

## Project Overview

### What is a Digital Invoice Generator?
A **digital invoice generator** is software that helps businesses create invoices electronically, store them, and share them with customers. It replaces manual invoicing (spreadsheets, word documents, paper invoices) with:

- Structured invoice data (clients, items, totals, dates, status)
- Consistent formatting and branding
- Faster delivery (PDF/email)
- Better tracking and reporting

### This Project’s Role
This project provides an end‑to‑end invoicing workflow:

- Create invoices using stored clients/items
- Track status (e.g., draft/sent/paid)
- Export invoices as PDFs
- Email invoices directly to a client
- View dashboards/reports
- (UI v2) Display invoice values in a **user‑selected currency** with live FX rates

---

## Key Features

### Invoice Creation
- Create invoices with:
  - Client selection
  - Multiple line items (quantity, price)
  - Due date and invoice number
  - Status updates
- Totals are stored and processed in **INR as the base currency** (UI can display in other currencies).

### Client Management
- Create, list, update, and delete clients
- Client data is tied to the authenticated user

### Item Catalog (Products/Services)
- Maintain reusable items (description, quantity, price)
- Items can be used in invoices

### Authentication & Authorization
- User registration and login
- JWT-based authentication
- Protected routes enforce data ownership

### PDF Export
- Download invoices as PDFs
- Currency-aware PDF generation (matches UI selected currency when provided)

### Email Sending
- Email invoices to the client with the PDF attached
- Currency-aware email attachment generation

### Reporting & Analytics (UI)
- Dashboard and reports to summarize invoice totals and status

### Live Currency Conversion (UI v2)
- Currency selector persisted in the browser (`localStorage`)
- Live FX rates fetched via backend endpoint
- UI amounts and exports can match the selected currency

---

## Technology Stack

### Frontend (Primary: `ui-v2/`)
- **React (Vite)**
- **React Router** for routing
- **Tailwind CSS** for styling
- **Framer Motion** for polished transitions

### Backend (`server/`)
- **Node.js** + **Express** (REST API)
- **MongoDB** + **Mongoose** for persistence
- **JWT (jsonwebtoken)** for auth
- **bcryptjs** for password hashing
- **pdfkit** for PDF generation
- **nodemailer** for sending invoices via email

### Currency / FX
- Backend FX endpoint: **`GET /api/fx/latest`** (cached)
- Data source: a free, no-key public dataset

---

## Logical Explanations & Architecture

### Architectural Design
This is a **monolithic full‑stack project**:

- A single Express server exposes REST endpoints under `/api/*`
- Frontend consumes the API and stores auth token client-side
- MongoDB stores core entities (users, invoices, clients, items)

### Core Logic
- **Ownership rules**: most business objects are scoped to the authenticated user.
- **Invoice totals**: invoice totals are stored in the DB in base currency (INR). The UI can convert values for display.
- **PDF generation**: PDF is generated server-side using invoice + client + items and streamed to the client.
- **Email sending**: server generates a PDF in-memory and sends it as an attachment.

### Data Structures (MongoDB Models)
- **User**: authentication + profile fields (e.g., company info/logo)
- **Client**: customer/contact details
- **Item**: reusable product/service rows
- **Invoice**: references `client` and `items`, includes invoice metadata and `total`

### Key Algorithms / Processes
- **Tax/discount calculation (UI)**: totals are computed from line items; stored in the invoice total.
- **Currency conversion (UI + exports)**:
  - Base currency is INR
  - Converted amount = `inrAmount * rate(INR->target)`
  - The backend can apply the same conversion for PDF/email when `?currency=XXX` is provided

---

## Project Structure (Breakdown)

### `server/`
- `index.js`: Express app entrypoint; registers routes and middleware
- `config/db.js`: MongoDB connection
- `routes/`: Express routers for users/invoices/clients/items/pdf/email/fx
- `controllers/`: request handlers for each resource
- `middleware/authMiddleware.js`: JWT verification and route protection
- `utils/pdfGenerator.js`: PDF layout rendering
- `utils/fx.js`: FX fetching + caching + INR->currency rate lookup

### `ui-v2/` (Primary UI)
- `src/state/`:
  - `auth.jsx`: auth state + token handling
  - `theme.jsx`: light/dark theme state
  - `currency.jsx`: selected currency + FX rates + persistence
- `src/lib/`:
  - `http.js`: API wrapper
  - `money.js`: shared money formatter (currency-aware)
  - `pdfApi.js`, `emailApi.js`: export helpers (pass `currency`)
- `src/pages/`: core screens (Dashboard, Create Invoice, Invoice Detail, Clients, Reports, Settings)
- `src/components/Shell.jsx`: main layout + navbar

### `client/` (Legacy)
This folder is not the active UI. It remains in the repo for reference.

---

## Setup & Installation

### Prerequisites
- Node.js (LTS recommended)
- MongoDB instance (local or Atlas)

### 1) Backend (`server/`)
Create `server/.env`:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
PORT=5000

# Optional (email)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_user
EMAIL_PASS=your_pass
EMAIL_FROM=your_from_address
```

Install and run:

```bash
npm install
npm start
```

Backend runs on `http://localhost:5000`.

### 2) Frontend (`ui-v2/`)

```bash
npm install
npm run dev
```

UI runs on the Vite dev server (shown in terminal output). It proxies `/api/*` to the backend.

---

## API Endpoints (High Level)

- **Auth**
  - `POST /api/users` (register)
  - `POST /api/users/login` (login)
  - `GET /api/users/me` (current user)
  - `PUT /api/users/profile` (update profile)
- **Invoices**
  - `GET/POST /api/invoices`
  - `PUT/DELETE /api/invoices/:id`
- **Clients**
  - `GET/POST /api/clients`
  - `PUT/DELETE /api/clients/:id`
- **Items**
  - `GET/POST /api/items`
  - `PUT/DELETE /api/items/:id`
- **Exports**
  - `GET /api/pdf/:id/generate?currency=USD`
  - `POST /api/email/:id/send?currency=USD`
- **FX**
  - `GET /api/fx/latest?base=INR&symbols=USD,EUR`

---

## Contribution Guidelines

- Create a feature branch off `main`
- Keep changes scoped and readable
- Prefer small, reviewable commits
- Run `ui-v2` build before opening a PR

---

## License

No license has been specified yet. If you plan to open-source this project, add a `LICENSE` file (MIT/Apache-2.0/etc.) and update this section accordingly.
