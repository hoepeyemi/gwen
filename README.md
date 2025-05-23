﻿# Gwen - Modern Payment Application

 Tweet link: https://x.com/gwen_radar/status/1917750795379826725?t=i-J7mGiqoB1kMzjYC9PkiQ&s=19

Gwen is a full-stack Next.js application that enables secure money transfers, user authentication, and financial management. It provides a modern, mobile-friendly interface with robust security features.

## 🚀 Features

- **Authentication**: Civic authentication with PIN verification for enhanced security
- **Money Transfer**: Send and receive money through multiple channels
- **Payment Processing**: Support for various payment methods including bank transfers
- **Bill Payments**: Pay utility bills and services directly from the app
- **KYC Integration**: Identity verification to comply with financial regulations
- **Bank Connections**: Link bank accounts for seamless transfers
- **Wallet Management**: Digital wallet for managing funds

## 📂 Project Structure

The project follows a modern Next.js 13+ application structure with App Router:

```
gwen/
├── prisma/              # Database schema and migrations
├── public/              # Static assets
├── src/
│   ├── app/             # Application pages and API routes
│   │   ├── api/         # API endpoints
│   │   ├── auth/        # Authentication pages
│   │   ├── dashboard/   # Dashboard views
│   │   ├── kyc/         # KYC verification
│   │   ├── payment-link/# Payment link processing
│   │   ├── wallet/      # Wallet functionality
│   │   ├── welcome/     # New user onboarding
│   │   └── components/  # Page-specific components
│   ├── components/      # Shared UI components
│   ├── hooks/           # Custom React hooks
│   │   └── stores/      # State management
│   ├── lib/             # Utility functions
│   ├── providers/       # Context providers
│   ├── server/          # Server-side code
│   │   ├── api/         # tRPC API routers
│   │   └── services/    # Business logic services
│   ├── styles/          # Global styles
│   └── trpc/            # tRPC client setup
└── .env                 # Environment variables
```

## 🔧 Technologies

- **Framework**: Next.js 13+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Civic Auth with PIN verification
- **API**: tRPC for type-safe APIs
- **State Management**: React Context, Zustand
- **Component Library**: Custom UI components

## 🛠️ Setup & Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/gwen.git
cd gwen
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Copy the `.env.example` file to `.env` and update the values:

```bash
cp .env.example .env
```

Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `CIVIC_CLIENT_ID`: Your Civic authentication client ID
- `NODE_ENV`: Development/production environment

Optional Twilio configuration (for SMS features):
- `TWILIO_ACCOUNT_SID`: Your Twilio account SID
- `TWILIO_AUTH_TOKEN`: Your Twilio auth token
- `TWILIO_PHONE_NUMBER`: Your Twilio phone number for sending SMS
- `ENABLE_SMS`: Set to "true" to enable SMS functionality

Environment-specific configuration:
```bash
# Development
NODE_ENV="development"
MOCK_KYC="true"  # Use mock KYC verification in development

# Production
NODE_ENV="production"
MOCK_KYC="false"  # Use real KYC verification in production
NEXT_PUBLIC_APP_URL="https://your-production-url.com"
```

4. **Set up the database**

```bash
npm run db:setup
# or
./start-database.sh  # If using the included script
npx prisma migrate dev
```

5. **Start the development server**

```bash
npm run dev
```

## 📊 Database Schema

The application uses a PostgreSQL database with the following key models:

- **User**: Stores user account information and authentication details
- **AuthSession**: Manages authentication sessions
- **Transfer**: Records money transfer transactions
- **OTPVerification**: Handles one-time password verification
- **KYC**: Stores know-your-customer verification data
- **Waitlist**: Manages user waitlist for new features

## 🌐 API Structure

The application uses tRPC for type-safe API communication. Main routers include:

- **userRouter**: User management and authentication
- **transferDataRouter**: Money transfer operations
- **transfersRouter**: Transfer creation and management
- **walletRouter**: Digital wallet operations
- **billsRouter**: Bill payment functionality
- **postRouter**: OTP and notification handling

## 📱 Application Flow

### Authentication Flow

1. User signs in via Civic authentication
2. PIN verification for sensitive operations
3. Session management with secure tokens

### Transfer Flow

1. User initiates a money transfer
2. Recipient details verification
3. OTP verification for security
4. KYC verification if required
5. Transfer processing
6. Confirmation to both parties

### Payment Link Flow

1. Sender creates a payment link
2. Recipient receives the link
3. Recipient chooses payment method
4. Verification process
5. Transfer completion

## 🛡️ Security Features

- **PIN Protection**: Sensitive operations require PIN verification
- **OTP Verification**: One-time passwords for transfers
- **KYC Integration**: Identity verification for compliance
- **Civic Authentication**: Secure user authentication
- **Session Management**: Secure token-based sessions

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run end-to-end tests
npm run test:e2e
```

## 🚀 Deployment

The application is configured for deployment on Vercel:

```bash
npm run build
```

## 📜 License

[MIT License](LICENSE)

## 📫 Contact

For questions or support, please open an issue in the repository.
