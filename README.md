# AptosPilot - Google Authentication & Aptos Keyless Integration

A modern Next.js dApp that supports Aptos Keyless accounts via Google sign-in and Petra Wallet connection, featuring an AI-powered chat assistant for Aptos blockchain information.

## Features

### 🔐 Authentication
- **Google OAuth Integration**: Seamless sign-in with Google accounts
- **Aptos Keyless Accounts**: No seed phrases required, secured by Google account
- **Petra Wallet Support**: Traditional wallet connection for advanced users
- **Dual Wallet Options**: Choose between keyless or traditional wallet after sign-in

### 🤖 AI-Powered Assistant
- **Gemini AI Integration**: Powered by Google's Gemini Pro model
- **Aptos Expert Knowledge**: Specialized in Aptos blockchain ecosystem
- **Real-time Responses**: Get instant answers about:
  - Move language and smart contract development
  - Aptos architecture and DeFi protocols
  - Wallet integration and keyless accounts
  - Latest ecosystem updates and news
  - Technical troubleshooting and best practices
- **Suggested Questions**: Quick-start prompts for common queries
- **Rate Limiting**: Protected against abuse (10 requests/minute)

### 💰 Wallet Features
- **Live Balance Display**: Real-time APT balance with USD conversion
- **Network Switching**: Support for mainnet and testnet
- **Transaction History**: View recent transactions
- **Keyless Account Management**: Easy recovery and account management

### 🎨 Modern UI
- **Glassmorphic Design**: Beautiful, modern interface
- **Responsive Layout**: Works on desktop and mobile
- **Real-time Updates**: Live price feeds and balance updates
- **Error Handling**: Graceful error states and user feedback

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Google OAuth credentials
- Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd aptospilot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file with:
   ```env
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-random-secret
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   APTOS_NODE_URL=https://fullnode.mainnet.aptoslabs.com/v1
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
   GEMINI_API_KEY=your-gemini-api-key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## Usage

### Sign-in Flow
1. Click "Sign in with Google"
2. Complete Google OAuth
3. Choose your wallet option:
   - **Create Keyless Wallet**: No seed phrase, secured by Google
   - **Connect Petra Wallet**: Traditional wallet with full control

### AI Assistant
1. Click the chat icon in the dashboard
2. Ask questions about Aptos, Move language, DeFi, etc.
3. Use suggested questions for quick start
4. Get real-time, expert responses powered by Gemini AI

### Wallet Management
- View live balance and USD value
- Switch between networks
- Disconnect and reconnect wallets
- Manage keyless account settings

## API Endpoints

### AI Chat (`/api/ai/chat`)
- **Method**: POST
- **Body**: `{ "message": "string" }`
- **Response**: `{ "response": "string", "timestamp": "string" }`
- **Rate Limit**: 10 requests per minute per IP

## Architecture

### Frontend
- **Next.js 15**: App Router with TypeScript
- **Tailwind CSS**: Styling and responsive design
- **Aptos SDK**: Blockchain integration
- **Google Generative AI**: AI chat functionality

### Backend
- **Next.js API Routes**: Server-side API endpoints
- **Gemini AI**: Natural language processing
- **Rate Limiting**: In-memory rate limiting (production: use Redis)

## Security Features

- **Server-side API Keys**: Gemini API key never exposed to client
- **Rate Limiting**: Prevents API abuse
- **Input Validation**: Message length and type validation
- **Error Handling**: Graceful error states without exposing internals

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Check the AI assistant in the app
- Review the Aptos documentation
- Open an issue on GitHub

## 🏗️ How Keyless Accounts Work

**Keyless accounts** on Aptos allow users to own and control a blockchain account simply by signing in with their Google account. Here's what makes them special:

- **No seed phrases or private keys** - Users never handle cryptographic keys
- **Permanent for your dApp** - Once created, the account persists for that Google user on your dApp
- **App-specific** - Each dApp creates a unique account for the same Google user
- **Easy recovery** - Users can recover access by simply signing in with the same Google account
- **Zero-knowledge proofs** - Ensures privacy and security

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Google Cloud Console account
- Aptos mainnet access

## 🛠️ Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd aptospilot
npm install
```

### 2. Google OAuth Setup

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**
2. **Create a new project** or select an existing one
3. **Enable the Google+ API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. **Create OAuth 2.0 credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Set authorized redirect URIs:
     - `http://localhost:3001/api/auth/callback/google` (for development)
     - `https://yourdomain.com/api/auth/callback/google` (for production)
5. **Copy your credentials**:
   - Client ID
   - Client Secret

### 3. Environment Configuration

Create a `.env.local` file in your project root:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-random-secret-key-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Aptos Configuration (optional)
APTOS_NODE_URL=https://fullnode.mainnet.aptoslabs.com/v1
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 4. Run the Application

```bash
npm run dev
```

Visit `http://localhost:3001` to see your application.

## 🔄 User Flow

1. **User visits the app** → Redirected to sign-in page
2. **Clicks "Sign in with Google"** → OAuth flow begins
3. **Google authentication** → User signs in with Google
4. **Account creation** → App creates Aptos keyless account from JWT
5. **Dashboard display** → Shows account address, balance, and info
6. **Permanent access** → User can always return and access the same account

## 🏗️ Technical Architecture

### File Structure
```
aptospilot/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts    # NextAuth configuration
│   │   └── aptos/keyless/route.ts         # Keyless account API
│   ├── auth/signin/page.tsx               # Custom sign-in page
│   ├── components/Dashboard.tsx           # Main dashboard
│   ├── providers.tsx                      # Session provider
│   └── layout.tsx                         # App layout
├── lib/
│   └── aptos-keyless.ts                   # Keyless account logic
├── types/
│   └── next-auth.d.ts                     # TypeScript types
└── README.md
```

### Key Components

1. **NextAuth Configuration** (`app/api/auth/[...nextauth]/route.ts`)
   - Handles Google OAuth flow
   - Stores JWT tokens in session
   - Manages user authentication state

2. **Keyless Account Manager** (`lib/aptos-keyless.ts`)
   - Derives deterministic accounts from Google JWT
   - Handles account creation and balance queries
   - Implements cryptographic key derivation

3. **Dashboard Component** (`app/components/Dashboard.tsx`)
   - Main user interface
   - Handles account creation flow
   - Displays account information

## 🔐 Security Considerations

### Production Deployment

1. **Use proper JWT verification**:
   - Replace placeholder JWT verification with Google's public keys
   - Implement proper token validation

2. **Secure environment variables**:
   - Use proper secrets management
   - Never commit `.env.local` to version control

3. **HTTPS only**:
   - Always use HTTPS in production
   - Update redirect URIs accordingly

### JWT Verification (Production)

In production, replace the placeholder JWT verification in `lib/aptos-keyless.ts`:

```typescript
// Replace this:
const verified = await jwtVerify(
  idToken,
  new TextEncoder().encode("your-app-secret"),
  // ...
);

// With proper Google public key verification:
const verified = await jwtVerify(
  idToken,
  await getGooglePublicKey(kid), // Implement this function
  {
    issuer: "https://accounts.google.com",
    audience: process.env.GOOGLE_CLIENT_ID,
  }
);
```

## 🧪 Testing

1. **Local Development**:
   - Run `npm run dev`
   - Test Google sign-in flow
   - Verify account creation

2. **Build Testing**:
   ```bash
   npm run build
   npm start
   ```

## 📚 Additional Resources

- [Aptos Keyless Documentation](https://aptos.dev/en/build/guides/aptos-keyless/)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Aptos TypeScript SDK](https://github.com/aptos-labs/aptos-core/tree/main/ecosystem/typescript/sdk)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Note**: This implementation demonstrates the concept of keyless accounts. For production use, ensure proper security measures and follow Aptos best practices.
