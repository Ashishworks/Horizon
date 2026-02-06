# Horizon  
AI-Powered Mental Health Journal, Analytics & Support Platform

Horizon is a AI-driven mental health journaling and reflection platform designed to help users understand their emotional patterns, lifestyle habits, and mental well-being over time.

Unlike generic journaling or chatbot-based mental health applications, Horizon is built on **structured data collection, statistical analysis, rule-based intelligence, and contextual AI reasoning**. The system prioritizes data integrity and long-term trends before applying large language models, ensuring insights are meaningful, explainable, and grounded.

Horizon is intended for **self-reflection, awareness, and early support discovery**. It is **not a medical diagnostic or treatment tool**.

---

## Table of Contents
1. Overview  
2. Motivation  
3. Core Features  
4. Application Pages and Routes  
5. Zony – Horizon AI Companion  
6. AI Architecture and Intelligence Pipeline  
7. Tech Stack  
8. Database Design  
9. Performance and Caching Strategy  
10. Privacy, Ethics, and Responsibility  
11. Getting Started  
12. Environment Configuration  
13. Roadmap  
14. Author  

---

## Overview

Mental health is deeply influenced by daily habits such as sleep, exercise, social interaction, and screen usage. Most applications either rely heavily on free-text journaling or provide generic AI responses without understanding long-term user behavior.

Horizon addresses this gap by:
- Collecting **structured daily mental health signals**
- Normalizing and analyzing data over time
- Applying **rule-based and statistical intelligence**
- Using AI only after data has been meaningfully processed

This approach allows Horizon to surface trends, correlations, and early warning patterns that are difficult to notice through manual reflection alone.

---

## Motivation

Horizon was built with the belief that:
- Mental health insights should be **data-driven, not guess-driven**
- AI systems should be **context-aware and time-aware**
- LLMs should **explain data**, not replace reasoning
- Users should retain **full ownership and privacy** of their data

The project focuses on building a **real AI system**, not a thin wrapper around a language model.

---

## Core Features

### Structured Daily Journaling
Horizon replaces unstructured journaling with a guided reflection system. Each daily entry captures consistent, comparable data points:

- Mood level
- Stress level
- Sleep duration and sleep quality
- Exercise and physical activity
- Diet quality
- Caffeine consumption
- Time spent outdoors
- Productivity level
- Social interaction level
- Screen time
- Challenges faced
- Free-text daily summary

If a user skips a field, intelligent defaults are applied to preserve continuity and reduce friction.

Each user can submit **one journal per day**, enforced at the database level.

---

### Visual Analytics and Pattern Detection
Collected data is transformed into visual and analytical insights:

- Mood and stress trends over 7, 30, and 90 days
- Sleep and exercise consistency metrics
- Mood volatility and emotional stability indicators
- Identification of best and worst days
- Lifestyle correlations such as sleep vs mood or screen time vs stress

All analytics are based on **normalized and statistically processed data**, not raw values.

---

### Nearby Mental Health Help Discovery
Horizon integrates location-based support discovery directly into the dashboard:

- Search for nearby psychiatrists
- Discover mental health hospitals and care centers
- Map-based visualization using Leaflet.js
- Designed for quick access during difficult periods

This feature focuses on **support discovery**, not medical advice.

---

### Journal History and Calendar View
Users can explore their past entries using a calendar-based interface:

- Select any previous date
- Review emotional state, habits, and reflections
- Observe long-term behavioral and emotional changes

This reinforces self-awareness and accountability.

---

### AI-Generated Mental Health Reports
Horizon allows users to generate comprehensive PDF reports:

- Select a custom time range
- Export a well-documented PDF
- Reports include:
  - Graphs and trend visualizations
  - Statistical summaries
  - Pattern explanations
  - AI-generated commentary and observations

Reports are designed for:
- Personal reflection
- Long-term self-analysis
- Sharing with psychiatrists or mental health professionals

---

## Application Pages and Routes

| Page | Description |
|-----|------------|
| Dashboard | Displays analytics, trends, patterns, and nearby mental health help |
| Reflect | Modern structured journaling interface |
| Calendar | View and explore previous journal entries |
| Reports | Generate and export AI-powered mental health reports |

---

## Zony – Horizon AI Companion

Zony is Horizon’s AI companion, represented as a floating face component that is accessible across all pages.

### Visual and Interaction Design
- Floating and always available
- Eyes dynamically track the user’s cursor
- Designed to feel present without being intrusive

Zony is intentionally minimal to avoid overwhelming users.

---

### AI Modes

#### AI Overview
- User selects a time period
- Zony analyzes:
  - Normalized journal data
  - Statistical trends
  - Rule-based signals
- Outputs:
  - High-level mental health summaries
  - Improvements and declines
  - Lifestyle correlations
  - Early warning indicators

This mode focuses on **analysis and explanation**, not conversation.

---

#### AI Chat
- Purpose-locked mental health chat
- Context-aware using:
  - Previous chat history
  - Historical journal data
  - Emotional trends
- Designed for reflective, supportive interaction
- Avoids generic or unrelated responses

The chat system is built to understand *who the user is over time*, not just what they typed last.

---

## AI Architecture and Intelligence Pipeline

Horizon’s AI system is multi-layered and data-first.

### 1. Data Normalization and Statistical Processing
- Structured journaling inputs
- Time-series normalization
- Statistical analysis including:
  - Trend detection
  - Volatility measurement
  - Consistency scoring
  - Correlation analysis

This layer produces machine-readable insights.

---

### 2. Rule-Based Intelligence
- Threshold-based rules
- Behavioral pattern detection
- Early risk indicators
- Guards against hallucinations and misleading conclusions

This layer ensures reliability and interpretability.

---

### 3. LLM Reasoning Layer (Gemini)
- Gemini LLM is applied only after data processing
- Responsible for:
  - Natural language explanations
  - AI overview summaries
  - Report commentary
  - Contextual chat responses
- Receives:
  - Processed statistics
  - Rule-based conclusions
  - Time-range context
  - User history

This makes Horizon closer to an **intelligent system** rather than a chatbot.

---

## Tech Stack

### Frontend
- Next.js (App Router)
- TypeScript
- React
- Tailwind CSS
- Framer Motion
- Nivo Charts
- React Day Picker
- Leaflet.js

### Backend and Infrastructure
- Node.js
- Supabase
  - PostgreSQL Database
  - Authentication
  - Storage
- Redis
  - Caching analytics and summaries
  - Reduces API response time significantly

### AI and Intelligence
- Gemini LLM
- Statistical data analysis
- Rule-based intelligence
- Context-aware reasoning

---

## Database Design

### Tables

**profiles**
- User baseline mental health data
- Preferences
- Avatar and metadata

**journals**
- One entry per user per day
- Structured numerical and categorical fields
- Free-text reflection
- AI-generated insights

### Constraints
- Unique constraint on (user_id, date)
- Upsert-based daily journaling logic

---

## Performance and Caching Strategy
- Redis caches frequently accessed analytics
- Reduced database load
- Faster dashboard rendering
- Optimized reporting queries
- Designed for scalability with long-term usage

---

## Privacy, Ethics, and Responsibility
- User data is private by default
- No medical diagnosis or treatment claims
- No data sharing without explicit consent
- Designed to support, not replace, mental health professionals

---

## Getting Started

### Clone the Repository
```bash
git clone https://github.com/your-username/horizon.git
cd horizon
