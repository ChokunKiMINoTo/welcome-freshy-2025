#!/bin/bash

echo "🚀 Setting up ICT Welcome Freshy 2025 GitHub Repository"
echo "======================================================="

# Check if we're in the right directory
if [ ! -d "freshy-dashboard" ]; then
    echo "❌ Error: freshy-dashboard directory not found"
    echo "Please run this script from the project root directory"
    exit 1
fi

# Step 1: Initialize Git repository
echo "📦 Step 1: Initializing Git repository..."
git init
git add .

# Step 2: Create initial commit
echo "💾 Step 2: Creating initial commit..."
git commit -m "[Cursor] Initial commit: ICT Welcome Freshy 2025 Mobile Event Dashboard

✨ Features:
- Real-time event scheduling with timer system
- Interactive venue status management with CSV persistence
- Team coordination dashboard with contact directory
- Live scoreboard and prop tracking
- Mobile-first responsive design with dark mode
- Material-UI components with TypeScript
- Emergency contacts and help request system

🔧 Tech Stack:
- Next.js 14 with TypeScript
- Material-UI v5 for components
- CSV-based data management
- Real-time status updates
- Mobile-optimized interface

📱 Event Management Features:
- ⏱️ Event Timer System with countdown
- 🏢 Venue Status Management (Active/Setup/Break/Maintenance)  
- 👥 Team Responsibilities with contact info
- 📊 Live Scoreboard tracking
- 🆘 Emergency Contact Directory
- 📋 Prop Tracking System

Ready for event coordination!"

# Step 3: Create GitHub repository
echo "🌐 Step 3: Creating GitHub repository..."
echo "You will need to authenticate with GitHub if prompted."
read -p "Press Enter to continue..."

gh repo create ict-welcome-freshy-2025 --private --description "ICT Welcome Freshy 2025 Mobile Event Dashboard - Real-time event coordination with venue management, team tracking, and live updates"

# Step 4: Push to GitHub
echo "⬆️ Step 4: Pushing to GitHub..."
git branch -M main
git remote add origin https://github.com/$(gh api user --jq .login)/ict-welcome-freshy-2025.git
git push -u origin main

echo "✅ Repository successfully created and uploaded!"
echo "🔗 Repository URL: https://github.com/$(gh api user --jq .login)/ict-welcome-freshy-2025"
echo ""
echo "📋 Next steps:"
echo "1. Visit your repository on GitHub"
echo "2. Configure repository settings if needed"
echo "3. Set up deployment if desired"
echo ""
echo "🎉 Your ICT Welcome Freshy 2025 dashboard is now on GitHub!" 