#!/bin/bash

# Script to set Vercel environment variables
# Run this after: vercel login

echo "Setting Vercel environment variables..."

# Set Supabase URL
echo "https://sylxsaquzuochdvonuzr.supabase.co" | vercel env add NEXT_PUBLIC_SUPABASE_URL production preview development

# Set Supabase Anon Key
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5bHhzYXF1enVvY2hkdm9udXpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNzIyNDksImV4cCI6MjA4MTY0ODI0OX0.Y9Qh0qx_CB7RdkgvglpA5t6enoLSogiAC9l4ODYzEWY" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production preview development

# Set NextAuth URL
echo "https://raccoonjep.com" | vercel env add NEXTAUTH_URL production preview development

# Set NextAuth Secret
echo "86MWsiv+a83zhRFiuaOgCUpgW+CUSqlK2XN3M38A6/s=" | vercel env add NEXTAUTH_SECRET production preview development

echo "Done! Environment variables have been set."
echo "Now redeploy your project in Vercel dashboard."

