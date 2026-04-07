# Sansthaein Aur Samvidhan - PRD

## Problem Statement
AI-Based Gamified Constitutional Learning Platform that simplifies constitutional articles and explains Indian institutions through gamification, analytics, and multilingual accessibility (English/Hindi).

## Core Features
- Article simplification mapped to institutions (Legislature, Executive, Judiciary)
- Interactive games: Spin the Wheel, Memory Cards, Snake & Ladder, Quiz, Be the Judge, Choose the Violation
- AI-powered article simplification (Gemini via Emergent LLM Key)
- Performance tracking/analytics dashboard
- Multilingual support (English/Hindi)
- Light/Dark mode
- User profile management (password reset, photo upload, account deletion)
- Professional auth modal with strong password validation
- Loading screen on app start
- Custom footer ("Developed by E-G09")

## Tech Stack
- Frontend: React, Tailwind CSS, Shadcn UI, Phosphor Icons
- Backend: FastAPI, PyMongo, JWT Auth, bcrypt
- Database: MongoDB
- AI: Gemini (via Emergent LLM Key)

## What's Implemented
- [x] Full MVP (React + FastAPI + MongoDB)
- [x] JWT Authentication with strong password validation
- [x] Learn page categorized by government branches
- [x] Article Detail page with AI simplification
- [x] All 6 game modules built
- [x] All 6 games visible in Article Detail page (P0 fix - Apr 7, 2026)
- [x] Games Hub page — header "Games" button shows all 6 games (Apr 7, 2026)
- [x] Auth modal input icon/placeholder overlap fix (Apr 7, 2026)
- [x] Light/Dark mode toggle
- [x] English/Hindi toggle
- [x] User dashboard with stats and game links
- [x] Profile page with password reset, photo upload, account deletion
- [x] Loading screen, Footer

## Backlog
- P1: Connect game logic to specific articles (pass article context to games)
- P2: Refine backend analytics for Quiz, Be the Judge, Choose the Violation
