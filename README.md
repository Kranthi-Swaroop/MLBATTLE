# ⚔️ MLBattle: A Unified ML & Data Science Arena

> **A real-time, gamified platform for data science competitions, bridging the gap between Kaggle and competitive gaming.**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18-green.svg)
![React](https://img.shields.io/badge/react-19-blue.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)

## 🚀 Overview

**MLBattle** is a high-performance competitive platform that transforms standard data science problems into e-sports-style events. By integrating directly with the **Kaggle CLI**, it provides real-time leaderboard synchronization, automated scoring, and a proprietary **ELO rating system** to rank data scientists globally.

The platform monitors a brutalist, "glassmorphism" aesthetic powered by **Three.js** and **GSAP**, delivering an immersive 3D experience that feels alive.

## ✨ Key Features

*   **🏆 Unified Global Leaderboard**: A proprietary ELO-based ranking system that normalizes scores across diverse metrics (LogLoss, F1-Score, RMSE) to rank users on a single global scale.
*   **⚡ Real-Time Kaggle Sync**: Custom-built Node.js engine bridges the Kaggle CLI to ingest live leaderboard data, updating rankings instantly without manual refreshing.
*   **🌌 Immersive 3D UI**: Fully interactive frontend built with **React Three Fiber** and **GSAP**, featuring dynamic backgrounds (Galaxy, Hyperspeed, GridScan) and micro-interactions.
*   **🤝 Team Management**: Robust team creation and management system, allowing squads to compete together and track collective progress.
*   **📡 Live Updates**: **Socket.io** integration pushes live competition updates, ensuring users never miss a rank change.
*   **🔐 Secure & Scalable**: JWT-based authentication with role-based access control (RBAC) securely managing Admins, Users, and Team Leaders.

## 🛠️ Tech Stack

### Frontend Service
*   **Framework**: Next.js 16 (App Router)
*   **Language**: TypeScript
*   **Visuals**: Three.js (React Three Fiber), OGL, Postprocessing
*   **Animations**: GSAP (GreenSock), Framer Motion
*   **Styling**: Pure CSS Modules (Glassmorphism design system)

### Backend Service
*   **Runtime**: Node.js & Express
*   **Database**: MongoDB (Mongoose ODM)
*   **Integration**: Python & Kaggle CLI (via Child Processes)
*   **Real-time**: Socket.io
*   **Security**: BCrypt, JWT, Helmet

## 📂 Project Structure

```bash
MLBATTLE/
├── backend/                 # Node.js API Server
│   ├── src/
│   │   ├── config/          # DB & App Configuration
│   │   ├── models/          # MongoDB Schemas (User, Team, Competition)
│   │   ├── routes/          # REST API Endpoints
│   │   ├── services/        # Core Logic (Kaggle Sync, ELO Engine)
│   │   └── index.js         # Entry Point
│   └── ...
├── frontend/                # Next.js Client
│   ├── src/
│   │   ├── app/             # App Router Pages ((auth), (main))
│   │   ├── components/      # UI Components (3D Visuals, Navbar)
│   │   └── ...
│   └── ...
└── ...
```

## ⚡ Getting Started

### Prerequisites
*   Node.js (v18+)
*   MongoDB (Local or Atlas)
*   Python (for Kaggle CLI)
*   Kaggle API Key (`kaggle.json`)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Kranthi-Swaroop/MLBATTLE.git
    cd MLBATTLE
    ```

2.  **Setup Backend**
    ```bash
    cd backend
    npm install
    # Create .env file with:
    # PORT=5000
    # MONGODB_URI=your_mongo_uri
    # JWT_SECRET=your_secret
    npm run dev
    ```

3.  **Setup Frontend**
    ```bash
    cd ../frontend
    npm install
    npm run dev
    ```

4.  **Access the Arena**
    Open `http://localhost:3000` to view the application.

## 🧪 Key Services

### Kaggle Synchronization
Located in `backend/src/services/kaggleSync.js`, this service acts as a bridge:
1.  Spawns a child process to run `kaggle competitions leaderboard`.
2.  Parses the raw CSV output stream.
3.  Matches Kaggle usernames to MLBattle users via fuzzy matching.
4.  Updates the internal database and triggers ELO recalculation.

### ELO Rating Engine
Located in `backend/src/services/eloService.js`:
*   Calculates expected outcome based on rating difference.
*   Updates ratings after every finalized competition.
*   Prevents rating inflation via dynamic K-factor adjustment.

## 🛡️ License

This project is licensed under the MIT License.

---
*Built with ❤️ by Kranthi Swaroop*
