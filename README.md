# Horizon

**AI‑Powered Mental Health Journal, Sentiment Analyzer & Report Generator**

Horizon is a **mental health journaling platform** built with **Next.js** that helps users reflect on their daily life, track emotional and behavioral patterns, and generate meaningful insights over time.

AI in Horizon is an **enhancement layer**, not the product itself. The core of Horizon is **structured journaling, analytics, and reflection**, with AI used carefully to support understanding, summarization, and long‑term pattern recognition.

---

## ✨ Key Features

### 📝 Daily Journaling

* Write and save daily journal entries
* Encourages self‑reflection and emotional awareness
* Helps users build consistency through daily tracking
* Calendar‑based journal history

---

### 🧠 AI‑Powered Insights

AI helps interpret data — it does not replace human judgment.

* Sentiment analysis for journal entries
* Non‑clinical condition signals based on trends
* Time‑aware insights (recent days vs long‑term patterns)
* Better long‑term emotional and behavioral trend tracking

> AI explanations are grounded in structured analytics, not raw text guesses.

---

### 🔍 Smart Search

* Search past journal entries using keywords
* Quickly find specific events, triggers, or emotional states
* Useful for reflection and therapist consultations

---

### 📊 Structured Tracking

Each journal entry can optionally include:

* Mood / happiness score
* Confidence level
* Sleep hours and sleep quality
* Stress and overthinking level
* Productivity
* Exercise, diet, and screen time
* Physical problems or symptoms
* Exception notes
* Location (optional)

These structured signals power analytics and AI‑assisted insights.

---

## 🧭 Onboarding Survey

When a user opens Horizon for the first time, they complete a short onboarding survey to capture a **personal baseline**, including:

* Typical happiness level
* Normal sleep duration and quality
* Common problems or stressors
* Known mental conditions (optional)
* Location (optional)

### Why this matters

1. **Personal Baseline Setup**
   Helps Horizon understand what is *normal* for the user.

2. **Improved Insights**
   Baselines are used for comparisons, trends, and AI explanations.

3. **Anonymous Community Insights (Optional)**
   Aggregated trends may be shown without exposing personal identity.

---

## 📄 Report Generation (For Psychiatrists / Therapists)

Horizon can generate **structured mental health reports** that users may choose to share with professionals.

Reports may include:

* Weekly / monthly mood trends
* Sentiment distribution
* Sleep‑mood correlations
* Journaling consistency scores
* Highlighted improvement or deterioration periods
* Clear summary insights

These reports help professionals:

* Understand patterns quickly
* Reduce reliance on memory‑based recall
* Make data‑backed decisions

---

## 🧠 How AI Is Used in Horizon

AI is **one component** of Horizon, not the entire system.

* Raw journal data is never sent directly to AI
* Data is normalized and analyzed in code first
* Trends, correlations, and risk signals are computed deterministically
* AI is primarily used for:

  * explanation
  * reflection
  * summarization

This design keeps Horizon **safe, explainable, and reliable**.

---

## 🗃️ Journal Data Stored

Each journal entry may store:

* Journal text
* Sentiment label and score
* Condition signal (non‑clinical)
* Mood / happiness score
* Confidence
* Sleep hours and sleep quality
* Stress and overthinking level
* Productivity
* Exercise, diet, and social interaction
* Physical problems
* Exception notes
* Location
* Created timestamp

> AI works on **derived features**, not raw journal text.

---

## 🗃️ Tech Stack

### Frontend

* Next.js (App Router)
* React
* TypeScript
* Tailwind CSS
* Data visualizations & animations

### Backend

* Next.js API routes
* TypeScript
* Redis (caching & performance optimization)
* Structured analytics pipelines

### Data

* Supabase (PostgreSQL)
* Supabase Auth
* Normalized journal schema
* Derived analytics layer

### AI / Analytics

* Sentiment analysis
* Time‑series trend analysis
* Statistical metrics
* Rule‑based intelligence
* Controlled LLM usage (explanation only)

---

## 🚀 Future Enhancements

* Alerts when mental health deteriorates over time
* Weekly / monthly reflection summaries
* Downloadable report export (PDF)
* Nearby doctor suggestions (opt‑in, location‑based)
* Advanced analytics dashboard
* Long‑term progress visualization

---

## ⚠️ Disclaimer

Horizon is **not a medical device** and does not provide diagnosis or treatment.
It is a **self‑reflection and insight tool** intended to support mental well‑being.

---

## 🛠️ Project Setup

```bash
git clone https://github.com/your-username/horizon.git
cd horizon
npm install
npm run dev
```

---

## Final Note

Horizon is built as a **product first**:

* journaling
* reflection
* structure
* analytics

AI exists to **support these goals**, not replace them.

