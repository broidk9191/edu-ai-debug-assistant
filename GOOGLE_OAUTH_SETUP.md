# Google OAuth Setup Instructions

To enable Google Sign-In for your application, follow these steps:

## 1. Create Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google+ API** (or Google Identity Services)
4. Go to **Credentials** → **Create Credentials** → **OAuth client ID**
5. Configure the OAuth consent screen if prompted:
   - User Type: External (for testing) or Internal (for organization)
   - Fill in app name, support email, developer contact
6. Create OAuth 2.0 Client ID:
   - Application type: **Web application**
   - Name: Learning-First.ai
   - Authorized JavaScript origins:
     - `http://localhost:3001` (for development)
     - `http://localhost:5173` (for Vite dev server)
     - Your production domain (e.g., `https://learningfirstai.vercel.app`)
   - Authorized redirect URIs:
     - `http://localhost:3001` (for development)
     - `http://localhost:5173` (for Vite dev server)
     - Your production domain
7. Copy the **Client ID**

## 2. Backend Configuration

Add to your `backend/.env` file:
```env
GOOGLE_CLIENT_ID=your-google-client-id-here
```

## 3. Frontend Configuration

Add to your `frontend/.env` file (or set in Vercel/environment variables):
```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here
```

**For Production (Vercel):**
1. Go to your Vercel project settings
2. Navigate to Environment Variables
3. Add `VITE_GOOGLE_CLIENT_ID` with your Google Client ID value
4. Redeploy your application

**For Railway (Backend):**
1. Go to your Railway project settings
2. Navigate to Variables
3. Add `GOOGLE_CLIENT_ID` with your Google Client ID value
4. Redeploy your service

## 4. Testing

1. Start your backend server
2. Start your frontend dev server
3. Navigate to `/login` or `/register`
4. You should see a "Sign in with Google" button
5. Click it and authenticate with your Google account

## Notes

- The same Google Client ID is used for both frontend and backend
- For production, make sure to add all your production domains to authorized origins
- Google Sign-In will automatically create accounts for new users
- Existing email/password accounts and Google accounts can coexist (same email = same account)

## Troubleshooting

- **"Google OAuth not configured"**: Make sure `GOOGLE_CLIENT_ID` is set in backend `.env`
- **"Invalid origin"**: Add your domain to authorized JavaScript origins in Google Console
- **Button not showing**: Make sure `VITE_GOOGLE_CLIENT_ID` is set in frontend environment
- **CORS errors**: Ensure your frontend domain is in the authorized origins list
