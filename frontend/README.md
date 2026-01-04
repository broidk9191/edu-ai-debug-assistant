# Frontend - Learning-First AI Debug Assistant

A React + TypeScript chat interface for the Learning-First AI Debug Assistant.

## Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The frontend runs at `http://localhost:3001` and proxies API requests to `http://localhost:3000`.

**Make sure the backend is running before using the frontend.**

## Production Build

### 1. Set Environment Variables

Create a `.env.production` file or set in your hosting platform:

```env
# Your deployed backend URL
VITE_API_URL=https://api.learning-first.ai
```

### 2. Build

```bash
npm run build
```

The build output is in the `dist/` folder.

### 3. Preview Production Build

```bash
npm run preview
```

## Deployment Options

### Vercel (Recommended for React)

1. Connect your GitHub repo to Vercel
2. Set the root directory to `edu-ai-debug-assistant/frontend`
3. Add environment variable: `VITE_API_URL=https://your-backend-url`
4. Deploy

### Netlify

1. Connect your GitHub repo to Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add environment variable: `VITE_API_URL=https://your-backend-url`

### Azure Static Web Apps

1. Create a Static Web App in Azure Portal
2. Connect to your GitHub repo
3. Set app location to `edu-ai-debug-assistant/frontend`
4. Set output location to `dist`
5. Add environment variable in Configuration

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Production only | Backend API URL (e.g., `https://api.learning-first.ai`) |

**Note:** In development, the Vite dev server proxies `/api` requests to `localhost:3000`, so `VITE_API_URL` is not needed.

## Features

- ✅ **Unified chat interface** with conversation memory
- ✅ **Mode selector**: Toggle between Debug and Assignment modes
- ✅ **Difficulty level selector**: Choose Beginner, Intermediate, or Advanced
- ✅ **Enhanced UX**: Tooltips and clear explanations for modes and difficulty levels
- ✅ Dark mode UI with Learning-First.ai branding
- ✅ Auto-resizing input
- ✅ Loading states and error handling
- ✅ Metadata stripping (developer info hidden from users)
- ✅ Session management (New Chat button)
- ✅ **Mobile-responsive design**: Works seamlessly across all platforms (desktop, tablet, mobile)
- ✅ Sidebar with session overview
- ✅ Smooth animations and transitions