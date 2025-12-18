#!/bin/bash

echo "Installing Homebrew..."
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

echo "Installing Node.js..."
brew install node

echo "Verifying installation..."
node --version
npm --version

echo "Node.js installation complete!"
echo "Now run: npm install"
