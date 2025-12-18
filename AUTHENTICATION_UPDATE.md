# Authentication System Update

The Jeopardy game has been updated from test-user authentication to a full username/password system with Supabase backend.

## What Changed

### 1. Database Schema
- **Users table** now includes:
  - `username` (unique, required): For login
  - `password` (required): Bcrypt-hashed passwords
  - Removed `email` field (username is used as the identifier)

### 2. Authentication System
- **Login/Signup page** ([app/login/page.tsx](app/login/page.tsx)):
  - Toggle between Login and Sign Up modes
  - Username and password input fields
  - Display name field for signups
  - Error handling for invalid credentials or taken usernames

- **NextAuth configuration** ([app/api/auth/[...nextauth]/route.ts](app/api/auth/[...nextauth]/route.ts)):
  - Uses CredentialsProvider with username/password
  - Supports both login and signup in one endpoint
  - Sessions last 30 days (persistent browser sessions)

- **Authentication functions** ([lib/auth.ts](lib/auth.ts)):
  - `createUser()`: Creates new user with hashed password
  - `verifyUser()`: Validates username/password for login
  - `getUserById()`: Fetches user data by ID
  - Uses bcryptjs for password hashing

### 3. Session Persistence
- JWT-based sessions with 30-day expiration
- Browser automatically remembers logged-in users
- Combined with the "played today" check, users cannot play again until the next day

## How It Works

### User Registration Flow
1. User clicks "Sign Up" on login page
2. Enters username, display name, and password
3. System checks if username is available
4. Password is hashed with bcrypt (10 rounds)
5. User record created in Supabase
6. User automatically logged in with JWT session

### User Login Flow
1. User enters username and password
2. System looks up user by username
3. Password verified against stored hash
4. JWT session created (30-day expiration)
5. User redirected to game

### Play-Once-Per-Day Enforcement
1. JWT session persists in browser (lasts 30 days)
2. When user visits site, session auto-validates
3. `hasPlayedToday()` checks if user has game record for today's date
4. If yes, shows completion screen with their score
5. Users cannot bypass by logging out/in (same user ID)

## Security Features

- **Password Hashing**: Bcrypt with 10 rounds
- **JWT Sessions**: Secure token-based authentication
- **Row Level Security**: Supabase RLS policies protect data
- **Username Uniqueness**: Database constraint prevents duplicates
- **Session Expiration**: 30-day automatic timeout

## Database Migration

If you already have users in your database from the old schema, you'll need to:

1. Back up existing data
2. Drop and recreate the users table with new schema
3. Users will need to create new accounts

Or run this migration SQL:

```sql
-- Backup existing users
CREATE TABLE users_backup AS SELECT * FROM users;

-- Drop old table and recreate with new schema
DROP TABLE IF EXISTS users CASCADE;

-- Run the new schema from supabase-schema.sql
-- (Copy and paste the CREATE TABLE users statement)

-- Note: Games table remains unchanged
```

## Testing the System

1. Go to `/login`
2. Click "Sign Up"
3. Create a test account:
   - Username: `testuser`
   - Display Name: `Test User`
   - Password: `test123`
4. Play a game and complete it
5. Refresh the page - you should see your completion screen
6. Try logging out and back in - still see completion screen
7. Check Supabase dashboard to see your user and game records

## Files Modified

- `supabase-schema.sql`: Updated users table schema
- `lib/supabase.ts`: Updated User interface
- `lib/auth.ts`: New authentication functions
- `app/api/auth/[...nextauth]/route.ts`: Updated NextAuth config
- `app/login/page.tsx`: New login/signup UI
- `app/api/game/save/route.ts`: Simplified (no user creation)
- `SUPABASE_SETUP.md`: Updated documentation

## Dependencies Added

- `bcryptjs`: Password hashing
- `@types/bcryptjs`: TypeScript types for bcryptjs
