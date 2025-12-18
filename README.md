# Jeopardy Game

A Jeopardy-style trivia game built with Next.js, featuring username/password authentication, real-time scoring, and a leaderboard.

## Features

- Username/password authentication
- 3-column game board (2 work categories, 1 fun category)
- Timer-based scoring (20 points lost per second)
- Daily Doubles with wagering
- Final Jeopardy
- Leaderboard tracking
- Roboflow-inspired design

## Setup

### Prerequisites

- Node.js 18+ installed
- Supabase account (for database)

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL schema from `supabase-schema.sql` in your Supabase SQL Editor
3. Get your Supabase URL and anon key from Settings → API

### 3. Configure Environment Variables

Edit the `.env.local` file and add your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-here
```

To generate a NEXTAUTH_SECRET, run:

```bash
openssl rand -base64 32
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Game Rules

- **2 categories are work related, 1 is for fun!** A well-rounded individual.
- Click on any tile to reveal a clue
- Answer against the clock - you lose 20 points per second
- Click "I don't know" to skip without penalty
- Answer correctly to earn points (tile value - time penalty)
- Answer incorrectly and lose the full tile value
- Daily Doubles let you wager (minimum $2,000)
- Final Jeopardy appears when all tiles are completed
- **The winner gets a singular lenny!** ( ͡° ͜ʖ ͡°)

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Authentication:** NextAuth.js with username/password (Credentials)
- **Database:** SQLite with better-sqlite3
- **Styling:** Tailwind CSS
- **Language:** TypeScript

## Project Structure

```
jeopardy/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/  # NextAuth configuration
│   │   ├── game/save/           # Save game scores
│   │   └── leaderboard/         # Leaderboard API
│   ├── login/                   # Login page
│   ├── leaderboard/             # Leaderboard page
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home/game page
├── components/
│   ├── AuthProvider.tsx         # Auth session provider
│   ├── Navbar.tsx               # Navigation bar
│   ├── Instructions.tsx         # Game instructions
│   ├── GameBoard.tsx            # Main game board
│   ├── QuestionModal.tsx        # Question/answer modal
│   └── FinalJeopardy.tsx        # Final Jeopardy component
├── lib/
│   ├── db.ts                    # Database utilities
│   └── gameData.ts              # Game questions/answers
└── types/
    └── next-auth.d.ts           # TypeScript definitions

```

## Customizing Game Content

Edit `lib/gameData.ts` to change:
- Categories
- Questions and answers
- Point values
- Daily Double locations
- Final Jeopardy question

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard (Supabase URL, Supabase key, NEXTAUTH_URL, NEXTAUTH_SECRET)
4. Update `NEXTAUTH_URL` to your production URL

**Note:** SQLite database won't persist on Vercel. For production, consider using:
- Vercel Postgres
- PlanetScale
- Supabase
- MongoDB Atlas

## License

MIT
