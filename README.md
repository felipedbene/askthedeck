# Ask The Deck

A tarot reading app that weaves together card wisdom with real-time astrological context, powered by Cloudflare Workers and DeepSeek AI.

## Features

- **Interactive 3-Card Spread**: 7-day guidance with positions for Current State, Focus for Growth, and Potential in 7 Days
- **Cosmic Context Integration**: Readings incorporate multiple astrological aspects:
  - Current Moon Phase and Moon Sign
  - Zodiac Season (Sun's position)
  - Planetary Day (traditional day ruler)
  - Current date and cosmic timing
- **AI-Powered Interpretations**: DeepSeek AI generates flowing, narrative-style readings that blend card meanings with astrological weather
- **Full Tarot Deck**: Select from all 78 traditional tarot cards (22 Major Arcana + 56 Minor Arcana)
- **Visual Card Display**: Selected cards appear with their actual tarot card images, position labels, and card names
- **Mobile-First Responsive Design**: Optimized for all devices with touch-friendly interactions and responsive grid layout
- **Mystical UI Theme**: Purple and gold cosmic color scheme with smooth gradients and animations
- **Shuffle & Reset**: Clear your spread and start fresh anytime

## Tech Stack

- **Frontend**: Vanilla JavaScript, HTML, Tailwind CSS
- **Backend**: Cloudflare Workers
- **AI**: DeepSeek AI
- **Deployment**: Cloudflare Pages/Workers

## Local Development

```bash
wrangler dev
```

Visit `http://localhost:8787` to see the app.

## Deployment

```bash
wrangler deploy
```

## How It Works

1. Select 3 cards by clicking on the card backs in the responsive grid
2. Watch as your selected cards appear with their images and position labels
3. Click "Read Cards" to receive your AI-generated interpretation
4. Use "Clear & Shuffle" to reset and start over with a fresh deck

## Card Deck

Includes all 78 cards of the traditional tarot deck:
- 22 Major Arcana cards
- 56 Minor Arcana cards (4 suits: Wands, Cups, Swords, Pentacles)
