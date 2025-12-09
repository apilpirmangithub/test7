# RadutVerse

A production-ready web platform for managing, visualizing, and monetizing tokenized intellectual property (IP), built for the blockchain era and powered by the Story Protocol SDK.

## Overview

RadutVerse is an all-in-one portal for IP ownership and monetization.
It lets users register their creations as on-chain IP, connect a wallet, explore portfolios, and trade IP-backed NFTs — all from one clean interface.
The platform integrates Story Protocol, OpenAI, and Pinata IPFS to make IP management smarter and more transparent.

## Key Features

### Core Tools

- IP Assistant: AI-powered IP management with image and data analysis
- IP Registration: Register, mint, and link your creative assets
- Wallet Login: EVM wallet support (Metamask, Privy, etc.)
- Portfolio View: Track owned IP tokens and metadata
- Search and Explore: Discover tokenized IP assets
- Chat History: Review past assistant conversations
- Ownership Tracker: Real-time IP and transaction history

### Additional Features

- IP Fi Assistant: Financial insights for your IP value
- NFT Marketplace: Trade and browse tokenized IP assets
- Settings: Customize integrations and privacy preferences
- Responsive UI: Works across desktop and mobile
- Live Sync: Real-time updates and activity tracking

## Tech Stack

Frontend: React 18, TypeScript, Vite, TailwindCSS, Radix UI, Framer Motion, React Query
Backend: Node.js, Express 5, Multer, CORS
Web3: Story Protocol SDK, Viem, Privy Auth
AI and APIs: OpenAI Vision, Pinata IPFS, Story API
Dev Tools: Vitest, SWC, Prettier, TypeScript

## Project Structure

```
client/   → React SPA frontend
server/   → Express backend and APIs
api/      → Serverless entry (Vercel/Netlify)
public/   → Static assets
docs/     → README, deployment, and architecture
```

## Setup

### Prerequisites

- Node.js v18 or higher
- pnpm v10.14 or higher
- Git and Vercel account
- Story Protocol account and API access

### Installation

```bash
git clone https://github.com/yourusername/radutverse.git
cd radutverse
pnpm install
```

### Environment Variables

Create a `.env.local` file:

```env
VITE_PUBLIC_STORY_RPC=https://aeneid.storyrpc.io
STORY_API_KEY=your_story_key
OPENAI_API_KEY=your_openai_key
PINATA_JWT=your_pinata_jwt
PINATA_GATEWAY=https://gateway.pinata.cloud
```

Then start development:

```bash
pnpm dev
```

This runs both frontend and backend with hot reload on [http://localhost:5173](http://localhost:5173)

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository
2. Add environment variables in the Vercel dashboard
3. Deploy using:

   ```bash
   vercel
   ```

4. Your app will be live after the build completes

For Netlify or Docker, see `DEPLOYMENT_GUIDE.md` for details.

## API Endpoints

**Check IP Assets**

```
POST /api/check-ip-assets
{ "address": "0x123..." }
```

**Analyze Image**

```
POST /api/analyze-image-vision
# multipart form with image + wallet address
```

**Capture Asset Vision**

```
POST /api/capture-asset-vision
{ "description": "...", "address": "0x..." }
```

## Troubleshooting

| Issue                 | Solution                              |                |
| --------------------- | ------------------------------------- | -------------- |
| Module not found      | Run `pnpm install`                    |                |
| Missing API key       | Check `.env.local` or Vercel settings |                |
| Wallet not connecting | Ensure EVM address is valid           |                |
| Port already in use   | Run `lsof -ti:5173                    | xargs kill -9` |

## Security

- Never commit `.env` files
- Validate all inputs with Zod and server checks
- Keep API keys on the backend only
- Verify wallet addresses before any transaction
- Use trusted origins for CORS

## Support

- Story Protocol: [https://discord.gg/storyprotocol](https://discord.gg/storyprotocol)
- Vercel: [https://vercel.com/docs](https://vercel.com/docs)
- OpenAI: [https://platform.openai.com/docs](https://platform.openai.com/docs)

Refer to `DEPLOYMENT_GUIDE.md` or logs for debugging production issues.

## Contributing

1. Fork the repository
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit: `git commit -m "feat: add new feature"`
4. Push and open a Pull Request

Run checks before committing:

```bash
pnpm typecheck && pnpm format.fix
```

## License

MIT © 2025 RadutVerse

---

RadutVerse, Tokenizing creativity for the blockchain.
