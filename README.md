# Jeopardy Game

A Jeopardy-style trivia game built with Next.js, featuring Google authentication, real-time scoring, and a leaderboard.

## Features

- Google OAuth authentication
- 3-column game board (2 work categories, 1 fun category)
- Timer-based scoring (20 points lost per second)
- Daily Doubles with wagering
- Final Jeopardy
- Leaderboard tracking
- Roboflow-inspired design

## Setup

### Prerequisites

- Node.js 18+ installed
- Google Cloud Console account for OAuth credentials

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Configure the OAuth consent screen
6. Set the authorized redirect URI to: `http://localhost:3000/api/auth/callback/google`
7. Copy the Client ID and Client Secret

### 3. Configure Environment Variables

Edit the `.env.local` file and add your credentials:

```env
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
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
- **Authentication:** NextAuth.js with Google OAuth
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
3. Add environment variables in Vercel dashboard
4. Update `NEXTAUTH_URL` to your production URL
5. Update Google OAuth redirect URI to include production URL

**Note:** SQLite database won't persist on Vercel. For production, consider using:
- Vercel Postgres
- PlanetScale
- Supabase
- MongoDB Atlas

## License

MIT
