# PickSixNative

PickSix is a React Native college football pick'em application designed for employee engagement through weekly game predictions, competition, leaderboards, and rewards.

This project was developed by **Dalton Young** for **SENG 564 -- Fall 2026**.

## MVP Overview

The PickSix MVP was built with:

- React Native
- Expo
- TypeScript
- React state for application data
- Hard-coded sample college football data for demonstration

The MVP demonstrates the primary user experience and administrative workflow of the proposed application.

## Current Features

### Home
- Season points and current ranking
- Weekly pick accuracy
- Current winning streak
- Weekly competition information
- Recent results
- Leaderboard preview
- Quick access to weekly picks

### Weekly Picks
- Six weekly college football matchups
- School colors and team information
- Conference and ranking information
- Game-category filters
- Winner selection
- Predicted score entry for both teams
- Pick validation
- Individual pick submission
- Picks remain available while navigating between app screens

Available game filters include:

- All Division I
- Power 4
- Ranked Teams
- Group of 6
- Company Towns

### Live Scores
- Simulated college football scores
- Game status information
- School branding

### Leaderboard
- Employee standings
- Season point totals
- Current user's ranking

### Rewards
- Weekly reward information
- Monthly reward information
- Season championship reward information

### Admin Panel
The MVP also includes a simulated administrative interface for managing weekly competition settings.

Admin functionality includes:

- Weekly competition setup
- Competition name and deadline
- Notification settings
- Selecting and removing weekly games
- Filtering potential matchups
- Configurable scoring values
- Correct-winner points
- Exact-score bonuses
- Score-proximity bonuses
- Streak bonuses
- Simulated employee pick distribution and results

## Scoring Concept

PickSix is designed to reward more than simply selecting the winning team.

The scoring model can include points for:

- Correct winner
- Exact predicted score
- Predictions within a configurable point range
- Winning streaks

These scoring values can be adjusted through the Admin Panel in the MVP.

## Running the Project

### Requirements

- Node.js
- npm
- Expo Go mobile application

### Installation

Clone the repository and install the required packages:

```bash
npm install
