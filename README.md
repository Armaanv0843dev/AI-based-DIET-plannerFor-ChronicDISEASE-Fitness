# AI-based Diet Planner for Chronic Diseases

## Overview
This project aims to provide a comprehensive diet planning tool specifically designed for individuals with chronic diseases. It considers dietary restrictions, health goals, and preferences to create tailored meal plans that support healthy living.

## Features
- Personalized diet plans based on user health conditions
- Nutritional information for each meal
- Ability to track dietary intake
- User-friendly interface
- Multi-lingual support

## Tech Stack
- **Frontend:** React.js
- **Backend:** Node.js with Express
- **Database:** MongoDB
- **API:** RESTful API for data interchange
- **Authentication:** JWT (JSON Web Tokens) for secure user sessions

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Armaanv0843dev/AI-based-DIET-plannerFor-ChronicDISEASE-Fitness.git
   ```
2. Navigate to the project directory:
   ```bash
   cd AI-based-DIET-plannerFor-ChronicDISEASE-Fitness
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## Configuration
1. Create a `.env` file in the root directory and add the following variables:
   ```env
   DATABASE_URL=your_database_url_here
   JWT_SECRET=your_jwt_secret_here
   PORT=your_port_number_here
   ```

## Usage
1. Start the application:
   ```bash
   npm start
   ```
2. Open your browser and go to `http://localhost:your_port_number`.
3. Follow on-screen instructions to create an account and start planning your diet!

## Project Structure
```
AI-based-DIET-plannerFor-ChronicDISEASE-Fitness/
├── client/                  # Frontend code
├── server/                  # Backend code
│   ├── models/              # Database models
│   ├── routes/              # API routes
│   ├── controllers/         # Business logic
│   └── middleware/          # Authentication middleware
└── .env                     # Environment variables
```

---