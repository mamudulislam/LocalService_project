# Startup Project

This is a full-stack application consisting of a **NestJS** backend and a **React Native (Expo)** mobile frontend. The project supports features like user authentication, real-time chat, map integration, and Stripe payments.

## Project Structure

- **backend/**: NestJS API server handling database, authentication, websocket (chat), and payments.
- **mobile/**: Expo React Native application for iOS and Android.

---

## Prerequisites

- **Node.js** (v18 or later recommended)
- **npm** or **yarn**
- **MongoDB** (for backend database)
- **Expo Go** app on your phone or an Android/iOS Simulator.

---

## 1. Backend Setup

### Installation

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

### Configuration

Create a `.env` file in the `backend` directory. You can use `.env.example` as a reference if available, or make sure to define the following variables:

```env
# Database
DATABASE_URL="postgresql://..." # If using Prisma with SQL
MONGO_URI="mongodb://localhost:27017/your-db-name" # If using Mongoose

# Authentication
JWT_SECRET="your_jwt_secret"

# Stripe (Payments)
STRIPE_SECRET_KEY="your_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="your_stripe_webhook_secret"

# App
PORT=3000
```

### Running the Backend

Start the development server:

```bash
npm run start:dev
```

The backend server will typically run on `http://localhost:3000`.

---

## 2. Mobile Setup

### Installation

Navigate to the mobile directory and install dependencies:

```bash
cd mobile
npm install
```

### Configuration

If the mobile app requires environment variables (e.g., API URL), create a `.env` file in the `mobile` directory:

```env
EXPO_PUBLIC_API_URL=http://<YOUR_IP_ADDRESS>:3000
```
*Note: Use your machine's local IP address (e.g., `192.168.x.x`) instead of `localhost` so the physical device or emulator can connect to the backend.*

### Running the App

Start the Expo development server:

```bash
npx expo start
```

- Press **`a`** to open on Android Emulator.
- Press **`i`** to open on iOS Simulator (macOS only).
- Scan the QR code with the **Expo Go** app on your physical device.

---

## Features

- **Authentication**: Secure login and registration using JWT.
- **Real-time Chat**: Socket.io integration for instant messaging.
- **Maps**: Interactive maps using `react-native-maps`.
- **Payments**: Stripe integration for secure transactions.
- **State Management**: Using `zustand` and `remote` server state management with `@tanstack/react-query`.
- **Styling**: Modern UI with `nativewind` (Tailwind CSS for React Native).

## License

This project is proprietary.
