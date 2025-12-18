# Quick Setup Guide

## ⚠️ Important: Supabase Setup Required

Your Jeopardy game now uses Supabase for database and authentication. You need to complete the setup before the app will work.

## Quick Start

### 1. Install Dependencies (Already Done ✓)
```bash
npm install
```

### 2. Set Up Supabase

Follow the detailed instructions in [SUPABASE_SETUP.md](SUPABASE_SETUP.md):

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL schema from `supabase-schema.sql` in your Supabase SQL Editor
3. Copy your Supabase URL and anon key
4. Create `.env.local` file with your credentials:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-key-here

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here
```

### 3. Generate NextAuth Secret

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Copy the output and paste it as your `NEXTAUTH_SECRET` in `.env.local`.

### 4. Start the Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) and you should see the login page!

## What's New

- **Username/Password Authentication**: Users can sign up and login with username/password
- **Supabase Database**: All user data and game scores stored in Supabase
- **Session Persistence**: Users stay logged in for 30 days
- **One Play Per Day**: Users can only play once per day (enforced by database + session)

## Features

- ✅ Username/password authentication
- ✅ User registration and login
- ✅ Persistent sessions (30 days)
- ✅ Jeopardy-style trivia game
- ✅ Daily Doubles with custom wagering
- ✅ Final Jeopardy
- ✅ Real-time scoring with timer
- ✅ Daily leaderboard
- ✅ One play per day restriction
- ✅ Top 3 players shown on completion
- ✅ User rank display

## Troubleshooting

### "Missing Supabase environment variables" error
- Make sure you created `.env.local` file
- Verify you added both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Restart your dev server after adding environment variables

### Cannot login or signup
- Check that you ran the SQL schema in Supabase
- Verify your Supabase project is active (not paused)
- Check browser console for errors
- Check Supabase logs in the dashboard

### See detailed setup instructions in [SUPABASE_SETUP.md](SUPABASE_SETUP.md)

## File Structure

```
jeopardy/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/    # NextAuth configuration
│   │   ├── game/
│   │   │   ├── save/              # Save game score
│   │   │   └── status/            # Check if played today
│   │   └── leaderboard/           # Get leaderboard data
│   ├── login/                     # Login/Signup page
│   ├── leaderboard/               # Leaderboard page
│   └── page.tsx                   # Main game page
├── components/
│   ├── GameBoard.tsx              # Game board with categories
│   ├── QuestionModal.tsx          # Question/answer modal
│   ├── FinalJeopardy.tsx         # Final Jeopardy component
│   ├── Instructions.tsx           # Game instructions
│   └── Navbar.tsx                 # Navigation bar
├── lib/
│   ├── supabase.ts                # Supabase client setup
│   ├── supabaseDb.ts              # Database functions
│   ├── auth.ts                    # Authentication functions
│   └── gameData.ts                # Game questions/answers
├── supabase-schema.sql            # Database schema
├── SUPABASE_SETUP.md              # Detailed setup guide
└── AUTHENTICATION_UPDATE.md       # Auth system documentation
```

## Need Help?

- Read [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for detailed setup instructions
- Read [AUTHENTICATION_UPDATE.md](AUTHENTICATION_UPDATE.md) for authentication system details
- Check the [Supabase Documentation](https://supabase.com/docs)
- Check the [NextAuth Documentation](https://next-auth.js.org)
