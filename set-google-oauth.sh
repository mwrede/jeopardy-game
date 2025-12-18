#!/bin/bash

# Script to set Google OAuth credentials in Vercel
# Run this after: vercel login

echo "Setting Google OAuth credentials in Vercel..."
echo ""
echo "Client ID: 289676295370-k8t2r3slscmi0tlmitjka4k9f35cbgrg.apps.googleusercontent.com"
echo ""

# Set Google Client ID
echo "289676295370-k8t2r3slscmi0tlmitjka4k9f35cbgrg.apps.googleusercontent.com" | vercel env add NEW_GOOGLE_CLIENT_ID production preview development

echo ""
echo "⚠️  IMPORTANT: You also need to set NEW_GOOGLE_CLIENT_SECRET"
echo "   Get it from Google Cloud Console → APIs & Services → Credentials"
echo "   Then run: echo 'YOUR_SECRET_HERE' | vercel env add NEW_GOOGLE_CLIENT_SECRET production preview development"
echo ""
echo "✅ Client ID has been set. Don't forget to set the Client Secret!"
echo ""

