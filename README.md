# AI-based Diet Planner

ChronoDietAI is a modern, AI-powered diet planning app designed for users with chronic diseases and fitness goals. It generates personalized Indian meal plans using Google Gemini AI, tracks daily nutrition, and provides actionable health tips.

## Features
- **Personalized Diet Generation:** Uses Google Gemini AI to create meal plans tailored to your age, gender, health conditions, dietary preferences, and fitness goals.
- **Meal Quantity Tracking:** Each meal includes main ingredient quantity (in gm or serving size) for easy tracking.
- **Daily Nutrition Dashboard:** View, check off, and manage your daily meals. See calories, completion status, and pie chart breakdowns.
- **CSV Export:** Download your daily meal plan as a CSV for offline tracking or sharing.
- **Full Plan View:** See your complete diet plan with macronutrient breakdowns and important notes.
- **Persistent Storage:** All data is stored locally for privacy.
- **Modern UI:** Built with Next.js, Tailwind CSS, and Radix UI for a fast, responsive experience.

## Tech Stack
- **Next.js 15 (App Router)**
- **React 18**
- **Tailwind CSS**
- **Radix UI & Lucide Icons**
- **Recharts (Pie Chart)**
- **Google Gemini AI (via Genkit)**
- **TypeScript**

## Getting Started

1. **Clone the repository:**
   ```sh
   git clone https://github.com/Armaanv0843dev/AI-based-DIET-plannerFor-ChronicDISEASE-Fitness.git
   cd AI-based-DIET-plannerFor-ChronicDISEASE-Fitness
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Set up your Google Gemini API key:**
   - Create a `.env` file in the root directory.
   - Add your Gemini API key:
     ```env
     GEMINI_API_KEY=your_google_gemini_api_key
     ```

4. **Run the development server:**
   ```sh
   npm run dev
   ```
   - App will be available at [http://localhost:3000](http://localhost:3000)

## Usage
- **Step 1:** Complete your profile (age, gender, health, fitness goal, etc.).
- **Step 2:** Generate your personalized diet plan.
- **Step 3:** View and track your daily meals in the dashboard.
- **Step 4:** Export your plan as CSV or view the full plan for details.

## Screenshots
- Dashboard, Profile, Diet Plan, CSV Export (add screenshots here)

## License
MIT

---
For questions or support, open an issue on GitHub or contact the maintainer.
