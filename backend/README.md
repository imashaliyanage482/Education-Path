# EduPath Backend API (Node.js + Express + MongoDB Atlas + OpenAI)

This backend provides a secure, production-ready REST API for the **EduPath** Mobile Application.

## Key Features

1. **Course & Institution Management**: Verified Sri Lankan and international university course data.
2. **Career Pathways & Milestones**: Structured progression routes from school to career.
3. **AI Education Advisor Proxy**:
   - Secure server-side OpenAI integration (API key is never exposed on the mobile client).
   - Strict grounding against verified database records.
   - Multilingual support for English, Sinhala, and Singlish.
4. **JWT Authentication**: Secure role-based administration for verified course and qualification updates.
5. **Guest Mode Privacy**: Guest student qualification inputs and temporary queries are never permanently persisted by default.

## Setup Instructions

1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Configure environment variables:
   Copy `.env.example` to `.env` and fill in your MongoDB Atlas connection URI and OpenAI API key:
   ```bash
   cp .env.example .env
   ```

3. Start server:
   ```bash
   npm run dev
   ```

4. Connect Mobile App:
   In `src/services/api.ts`, update `API_CONFIG.USE_REMOTE_BACKEND = true` or provide `EXPO_PUBLIC_API_URL`.
