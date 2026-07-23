# 🏭 Textile Factory Monitoring System

A full-stack web application for monitoring and managing textile factory operations. The system helps administrators monitor machines, manage workers, track maintenance, control inventory, and analyze production through an intuitive dashboard.

---

## 🚀 Features

### 🔐 Authentication & Security
- JWT Authentication
- Refresh Token Support
- Role-Based Access Control (Admin & Worker)
- Protected Routes

### ⚙️ Machine Management
- Add, Update, Delete Machines
- Machine Status Monitoring
- Machine Assignment

### 👷 Worker Management
- Worker Profiles
- Attendance Tracking
- Work Schedule
- Notifications

### 🛠 Maintenance
- Maintenance Requests
- Technician Assignment
- Maintenance History

### 📦 Inventory
- Inventory Management
- Stock History
- Low Stock Alerts

### 📊 Reports & Analytics
- Dashboard Statistics
- Production Reports
- PDF & Excel Export

### 🎨 User Interface
- Responsive Design
- Dark/Light Mode
- Modern Dashboard
- Industrial Theme

---

# 🛠 Tech Stack

## Frontend
- React.js
- Vite
- Tailwind CSS
- React Router
- Axios

## Backend
- Node.js
- Express.js
- Prisma ORM
- JWT Authentication

## Database
- PostgreSQL

---

# 📁 Project Structure

```
textile-factory-monitor/
│
├── backend/
│   ├── prisma/
│   ├── src/
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   └── package.json
│
└── README.md
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/khadija467/Textile-Monitory-System.git
cd Textile-Monitory-System
```

## Backend

```bash
cd backend
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate dev
npm run seed
npm run dev
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

---

# 🌐 Local URLs

Frontend

```
http://localhost:5173
```

Backend

```
http://localhost:5000
```

---

# 📸 Screenshots

> Add screenshots of:
- Login Page
- Dashboard
- Machine Management
- Production Dashboard
- Maintenance Module

---

# 👩‍💻 Author

**Khadija Malik**

BS Computer Science

GitHub: https://github.com/khadija467

---

# 📄 License

This project is for educational and portfolio purposes.
