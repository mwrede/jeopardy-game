# Supabase Setup Instructions

This guide will help you set up Supabase for your Jeopardy game.

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in your project details:
   - Name: `jeopardy-game` (or any name you prefer)
   - Database Password: Create a strong password
   - Region: Choose the closest region to your users
4. Click "Create new project" and wait for it to initialize

## Step 2: Run the Database Schema

1. In your Supabase project, go to the **SQL Editor** (in the left sidebar)
2. Click "New query"
3. Copy the contents of `supabase-schema.sql` and paste it into the editor
4. Click "Run" to execute the SQL

This will create:
- **users** table: Stores user information
- **games** table: Stores all game sessions with scores
- **leaderboard** view: Automatically computes rankings from games table
- Indexes for better performance
- Row Level Security (RLS) policies

## Step 3: Get Your Supabase Credentials

1. In your Supabase project, go to **Settings** (gear icon in the left sidebar)
2. Click on **API** in the settings menu
3. You'll see two important values:
   - **Project URL**: This is your `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key**: This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Step 4: Configure Environment Variables

1. In your project root, copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Open `.env.local` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## Step 5: Restart Your Development Server

If your dev server is running, restart it to load the new environment variables:

```bash
npm run dev
```

## Database Structure

### Users Table
- `id` (TEXT, PRIMARY KEY): User identifier
- `username` (TEXT, UNIQUE): User's username for login
- `password` (TEXT): Hashed password (using bcrypt)
- `name` (TEXT): User's display name
- `image` (TEXT): Profile image URL (optional)
- `created_at` (TIMESTAMP): Account creation time

### Games Table
- `id` (SERIAL, PRIMARY KEY): Auto-incrementing game ID
- `user_id` (TEXT, FOREIGN KEY): References users(id)
- `score` (INTEGER): Final game score
- `completed_at` (TIMESTAMP): When the game was completed
- `date` (DATE): Date of the game (for daily leaderboard)

### Leaderboard View
Automatically computed view that shows:
- Best score per user per day
- Ordered by score (highest first)
- Includes user details (name, image)

## Verifying the Setup

To verify everything is working:

1. Start your dev server: `npm run dev`
2. Login and play a game
3. Check the Supabase dashboard:
   - Go to **Table Editor** and view the `users` and `games` tables
   - You should see your user and game data
4. View the leaderboard in your app

## Security Notes

- Row Level Security (RLS) is enabled on both tables
- Users can read all data (for leaderboard functionality)
- Users can only insert their own records
- The anon key is safe to use in the browser
- Never commit your `.env.local` file to version control

## Troubleshooting

### "Missing Supabase environment variables" error
- Make sure you've created `.env.local` with your Supabase credentials
- Restart your dev server after adding environment variables

### Database connection errors
- Verify your Supabase URL and anon key are correct
- Check that your Supabase project is active (not paused)

### No data showing up
- Check the browser console for errors
- Verify the SQL schema was run successfully in Supabase
- Check the Supabase logs in the dashboard under **Logs**
