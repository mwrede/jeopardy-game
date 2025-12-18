# Quick Setup Guide

## Step 1: Install Node.js

If you don't have Node.js installed, download it from [nodejs.org](https://nodejs.org/) (LTS version recommended).

## Step 2: Install Dependencies

Open your terminal in the jeopardy directory and run:

```bash
npm install
```

## Step 3: Set Up Google OAuth

### Create Google OAuth Credentials:

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Click "APIs & Services" → "Credentials"
4. Click "Create Credentials" → "OAuth 2.0 Client ID"
5. If prompted, configure the OAuth consent screen:
   - Choose "External" user type
   - Fill in app name: "Jeopardy Game"
   - Add your email as developer contact
   - Skip optional scopes
6. For Application type, select "Web application"
7. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
8. Click "Create"
9. Copy your Client ID and Client Secret

## Step 4: Configure Environment Variables

Open `.env.local` and replace the placeholder values:

```env
GOOGLE_CLIENT_ID=paste-your-client-id-here
GOOGLE_CLIENT_SECRET=paste-your-client-secret-here
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=run-openssl-rand-base64-32-to-generate
```

To generate `NEXTAUTH_SECRET`, run this in terminal:

```bash
openssl rand -base64 32
```

Then paste the output into `.env.local`.

## Step 5: Run the Game

```bash
npm run dev
```

Open your browser to [http://localhost:3000](http://localhost:3000)

## Step 6: Play!

1. Sign in with your Google account
2. Read the instructions
3. Click on any tile to start playing
4. Answer questions quickly to maximize points
5. Watch out for Daily Doubles!
6. Complete Final Jeopardy
7. Check the leaderboard

## Troubleshooting

**Issue:** Google sign-in fails
- Make sure your redirect URI is exactly: `http://localhost:3000/api/auth/callback/google`
- Check that your OAuth consent screen is configured
- Verify your Client ID and Secret are correct in `.env.local`

**Issue:** Database errors
- The database file will be created automatically on first run
- Make sure you have write permissions in the project directory

**Issue:** Port 3000 is already in use
- Run on a different port: `npm run dev -- -p 3001`
- Update `NEXTAUTH_URL` in `.env.local` to match the new port

## Customizing the Game

Edit `lib/gameData.ts` to change questions, categories, and point values.

The game currently has:
- **Machine Learning** (work category)
- **Software Engineering** (work category)
- **Pop Culture** (fun category)

Each category has 5 questions worth $200, $400, $600, $800, and $1,000.

Enjoy the game and may the best player win a singular lenny! ( ͡° ͜ʖ ͡°)
