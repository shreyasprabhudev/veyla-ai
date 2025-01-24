# VeylaAI

A privacy-first AI platform that protects sensitive information in AI interactions.

## 🚀 Features

- **Chrome Extension**: Automatically detects and flags sensitive information in text inputs before they reach LLMs
- **Browser-based LLM**: Local inference capabilities to process data without external API calls
- **Secure Data Caching**: Supabase-powered secure database for caching and augmenting AI responses
- **HIPAA Compliance**: Built-in privacy preservation mechanisms for healthcare data

## 🏗️ Project Structure

```
opaque-ai/
├── extension/         # Chrome extension source code
├── web/              # Next.js web application
└── supabase/         # Database schemas and functions
```

## 🛠️ Tech Stack

- Next.js/React for web application
- Chrome Extensions Manifest V3
- Local LLM implementation
- Supabase for secure data storage
- TypeScript for type safety

## 🔒 Privacy Features

- Local LLM processing to minimize data exposure
- Sensitive data detection before API calls
- Secure response caching and augmentation
- HIPAA-compliant data handling

## 🚦 Getting Started

### Prerequisites

- Node.js >= 18.17.0 (check `.node-version`)
- npm or yarn
- A Supabase project (for authentication)

### Local Development Setup

1. Clone the repository:
```bash
git clone https://github.com/your-username/veyla-ai.git
cd veyla-ai
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Navigate to the landing package
cd packages/landing

# Copy the example env file
cp .env.example .env

# Edit .env with your Supabase credentials
# You can find these in your Supabase project settings
```

4. Start the development server:
```bash
# From the root directory
npm run dev

# Or from the landing package
cd packages/landing
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Testing

The app will redirect authenticated users to `https://app.veylaai.com`. For local testing:

1. Create a test account through the Supabase UI
2. Use the sign-in functionality on the landing page
3. You can temporarily modify the redirect URL in `page.tsx` to test locally:
```typescript
// In packages/landing/app/page.tsx
if (session && window.location.pathname !== '/') {
  // For local testing, comment out the production URL
  // window.location.href = 'https://app.veylaai.com';
  console.log('Auth successful:', session);
}
```

### Project Structure

```
veyla-ai/
├── packages/
│   └── landing/        # Landing page (Next.js)
│       ├── app/        # Next.js app directory
│       ├── components/ # React components
│       └── public/     # Static assets
└── package.json        # Root package.json for workspace
```

## 📝 License

[License details to be added]