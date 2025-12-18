# Quick Setup Guide

## Step 1: Install Node.js

If you don't have Node.js installed, download it from [nodejs.org](https://nodejs.org/) (LTS version recommended).

## Step 2: Install Dependencies

Open your terminal in the jeopardy directory and run:

```bash
npm install
```

## Step 3: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to Settings → API and copy your:
   - Project URL (this is your `NEXT_PUBLIC_SUPABASE_URL`)
   - anon public key (this is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
4. Go to SQL Editor and run the SQL from `supabase-schema.sql`

## Step 4: Configure Environment Variables

Open `.env.local` and replace the placeholder values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here
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

1. Create an account or sign in with username/password
2. Read the instructions
3. Click on any tile to start playing
4. Answer questions quickly to maximize points
5. Watch out for Daily Doubles!
6. Complete Final Jeopardy
7. Check the leaderboard

## Troubleshooting

**Issue:** Cannot login or signup
- Make sure you ran the SQL schema in Supabase
- Verify your Supabase URL and anon key are correct in `.env.local`
- Check that your Supabase project is active (not paused)

**Issue:** Database errors
- Verify your Supabase credentials are correct
- Check the Supabase dashboard for any errors

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
