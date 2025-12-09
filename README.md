🍳 CookVision AI

--AI-powered smart cooking assistant with recipe generation, dish visualization, and voice-guided cooking.

CookVision AI helps users cook smarter with instant AI recipes, realistic food images, and hands-free voice guidance—perfect for beginners, bachelors, and busy people.

🚀 Features

AI Recipe Generation
Enter any dish name → get structured, step-by-step cooking instructions.

Realistic Dish Visualization
Generates photorealistic images of the dish before you cook.

Voice-Guided Cooking Mode
Natural text-to-speech instructions for hands-free cooking.

Smart Ingredient Shopping
Auto-generated Blinkit/Zepto links based on servings.

🧩 Tech Stack Overview
🎨 Frontend

React 19 – UI components & state

TypeScript (strict) – Types for safety (types.ts)

Native ES Modules – No bundler, importmap-based setup

Tailwind CSS (CDN) – Utility styling + custom theme

Google Fonts – Inter + Playfair Display

Lucide React – Icon set

🤖 AI (Google Gemini)

Recipes & Chat: gemini-2.5-flash

Dish Images: gemini-2.5-flash-image

Voice Mode (TTS): gemini-2.5-flash-preview-tts

🌐 Browser APIs

Audio & speech playback

File/Blob handling for TTS

Fetch API for AI requests

📦 Installation
git clone https://github.com/your-username/cookvision-ai
cd cookvision-ai
npm install
npm run dev

📘 Usage

Enter a dish name

Choose servings

Generate recipe + image

Start voice-guided cooking
Shop missing ingredients instantly

