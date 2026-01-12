# Horizon
AI-Powered Mental Health Journal, Sentiment Analyzer and Report Generator

Horizon is a Next.js-based mental health journaling platform where users can write daily journal entries and receive AI-powered insights like sentiment detection and mental condition prediction.  
It also generates professional reports that can help psychiatrists/therapists understand a user’s mental health patterns faster and make better decisions during consultations.

---

## Key Features

### Daily Journaling
- Write and save daily journal entries
- Helps users reflect, track emotional patterns, and build consistency

### AI-Powered Insights
- Sentiment analysis for each journal entry
- Condition prediction using journal text and context fields
- Better long-term mental health trend tracking

### Smart Search
- Search past journal entries using keywords
- Quickly find specific events, triggers, or emotional states

### Structured Tracking (Optional Fields)
Each journal entry can include additional structured fields:
- Happiness score
- Confidence level
- Sleep hours and sleep quality
- Physical problems/symptoms
- Exception notes
- Location (optional)

---

## Onboarding Survey (Visible to General Users)

When a user opens Horizon for the first time, they answer a short onboarding survey to capture baseline mental and lifestyle information, such as:
- Typical happiness level
- Normal sleep hours and sleep quality
- Common physical problems
- Known mental conditions (if any)
- Location (optional)

This survey has two purposes:

1. Personal Baseline Setup
- Helps Horizon understand the user's normal condition
- Improves accuracy of AI predictions and insights

2. Community Survey Insights (For General Users)
Horizon can show anonymous aggregated insights, like:
- Average happiness trends
- Common sleep patterns
- Frequent physical problems
- Common mental health concerns

No personal identity is exposed. Only aggregated trends are shown.

---

## Report Generation (For Psychiatrists / Therapists)

Horizon generates structured mental health reports that users can share with professionals.

Reports can include:
- Mood trend (weekly/monthly)
- Sentiment distribution (positive/neutral/negative)
- AI predicted condition trends
- Sleep correlation with mood
- Consistency score (journaling frequency)
- Highlighted risky/deterioration periods
- Summary insights and key observations

This helps psychiatrists/therapists:
- Understand patterns quickly
- Reduce dependency on memory-based recall
- Make data-backed decisions during sessions

---

## Journal Data Stored

Each journal entry can store:
- text (journal content)
- sentiment (label and score)
- conditionPrediction (AI result)
- happinessScore
- confidence
- sleepHours
- sleepQuality
- physicalProblems
- exceptionNotes
- location
- createdAt

---

## Tech Stack

- Frontend: Next.js, React, Tailwind CSS
- Backend: Node.js APIs (Next.js API routes)
- AI/NLP: Sentiment analysis and condition prediction model/API
- Database: Supabase
- Auth (optional): Supabase Auth

---

## Future Enhancements
- Alerts if mental health deteriorates
- Downloadable report export (PDF)
- Nearby doctor suggestions (location-based)
- Advanced analytics dashboard
- Multi-user support with authentication

---

## Project Setup

### 1) Clone the repository
```bash
git clone https://github.com/your-username/horizon.git
cd horizon
