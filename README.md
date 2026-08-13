# 🏆 ToxicNullified Official - BGMI Tournament Platform

ToxicNullified Official is a full-stack, modern esports tournament website and management platform designed specifically for **Battlegrounds Mobile India (BGMI)** tournaments. It features a sleek esports dark theme, team registration with UPI payment QR code generation, screenshot proof verification, live points table standings, and an admin management control panel.

---

## ⚡ Quick Start & Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Installation & Launch

1. **Install Dependencies for Both Client & Server**:
   ```bash
   npm run setup
   ```

2. **Seed Initial BGMI Tournament & Team Data**:
   ```bash
   npm run seed
   ```

3. **Start Full-Stack Development Servers**:
   ```bash
   npm run dev
   ```
   - **Frontend App**: `http://localhost:3000`
   - **Backend API**: `http://localhost:5000`

---

## 🔐 Admin Authentication Portal

- **Admin Login URL**: `http://localhost:3000/admin/login`
- **Access**: Restricted to authorized tournament administrators.

---

## 🚀 API Endpoint Specifications

### Tournaments & Standings
- `GET /api/tournaments` — List all tournaments with status/format/search query parameters.
- `GET /api/tournaments/:id` — Retrieve detailed tournament specs, rules, schedule, prize breakdown, and live standings.
- `POST /api/tournaments` — *(Admin)* Create a new tournament.
- `PUT /api/tournaments/:id` — *(Admin)* Update tournament details.
- `DELETE /api/tournaments/:id` — *(Admin)* Delete a tournament and linked registrations.
- `PUT /api/tournaments/:id/points` — *(Admin)* Live update points table (rank, team, WWCDs, placement points, kill points).

### Registrations & Payments
- `POST /api/registrations` — Submit team entry with team logo, player lineup (IGNs and Character IDs), payment reference ID, and payment screenshot proof file upload.
- `GET /api/registrations` — *(Admin)* List all submitted team registrations.
- `PATCH /api/registrations/:id/status` — *(Admin)* Approve or Reject team registration status.
- `GET /api/qrcode` — Generate dynamic UPI QR Code string and base64 DataURL (`upi://pay?pa=toxicnullified@upi`).

### Admin Auth & Data Export
- `POST /api/auth/login` — Authenticate admin and return JWT access token.
- `GET /api/stats` — *(Admin)* Retrieve dashboard statistics (Total revenue, active tournaments, registration review counts).
- `GET /api/export/registrations` — *(Admin)* Export all team registration data as a downloadable `.csv` file.

---

## 🌟 Key Features

1. **Sleek Esports UI & Micro-Interactions**: Dark cyber theme with glowing neon accents (`#00f3ff`, `#ffb700`, `#ff2a5f`), responsive card layouts, slot fill progress bars, and tabbed tournament details.
2. **Interactive Registration Flow**: Player roster entry (4 main + 1 sub), dynamic UPI QR code generator, screenshot upload preview, and Terms & Conditions acceptance checkbox gating.
3. **Live Points Table**: Real-time standings display with WWCD icons, placement points, kill points, and total score calculation.
4. **Admin Dashboard**: Visual metric cards, CRUD management for tournaments, team registration approval workflow with payment screenshot inspector, and CSV export capabilities.
