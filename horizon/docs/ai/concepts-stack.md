# Horizon AI Concepts Stack

This document lists **all AI-related concepts used in Horizon**, ordered from **foundational → advanced**, and explains **exactly where and why each concept is used**.

> Scope note: This is not an academic AI list. Only concepts that are **actually implemented or planned in Horizon** are included.

---

## 1. Foundations (Non-Negotiable)

These concepts form the base of the entire AI system. Without them, nothing above is reliable.

### 1.1 Data Normalization & Feature Engineering

**Purpose**

* Convert raw user journal input into consistent, numerical, machine-readable features.

**Used in Horizon for**

* Mood (1–10)
* Stress (1–10)
* Sleep hours (0–12)
* Sentiment score (-1 to +1)

**Why it matters**

* All statistics, trends, rules, and ML depend on clean features.
* Prevents AI hallucinations caused by inconsistent input.

---

### 1.2 Time-Series Analysis

**Purpose**

* Model user behavior across time.

**Used in Horizon for**

* 7 / 30 / 90-day rolling windows
* Day-over-day and week-over-week analysis
* Progress tracking

**Key ideas**

* Sliding windows
* Temporal ordering
* Trend direction

---

### 1.3 Descriptive Statistics

**Purpose**

* Describe user behavior accurately (not predict it).

**Used in Horizon for**

* Average mood
* Sleep consistency
* Stress stability

**Key metrics**

* Mean
* Standard deviation
* Variance

---

## 2. Intelligence Layer (Core AI Logic)

This layer produces **deterministic intelligence** without using an LLM.

---

### 2.1 Rule-Based Reasoning (Expert Systems)

**Purpose**

* Encode mental-health domain knowledge safely and explainably.

**Used in Horizon for**

* Risk level scoring
* Alert thresholds
* Safety decisions

**Example**

* If mood trend is decreasing AND sleep is low → elevated risk

**Why rules first**

* Transparent
* Debuggable
* Safe

---

### 2.2 Correlation Analysis

**Purpose**

* Identify relationships between habits and mental state.

**Used in Horizon for**

* Root cause insights

**Examples**

* Sleep ↔ Mood
* Exercise ↔ Stress

**Technique**

* Pearson correlation coefficient

---

### 2.3 Anomaly Detection (Lightweight)

**Purpose**

* Detect sudden or unusual changes.

**Used in Horizon for**

* Sudden mood drops
* Irregular sleep patterns

**Techniques**

* Z-score
* Deviation from baseline

---

## 3. Reasoning & Control Concepts

These concepts ensure AI behaves correctly and stays in scope.

---

### 3.1 Intent Classification (NLP)

**Purpose**

* Understand *why* the user is asking something.

**Used in Horizon for**

* Purpose locking (mental-health only)
* Routing user queries

**Intents**

* Compare
* Trend
* Explain
* Reflect
* Unrelated (blocked)

---

### 3.2 Temporal Reasoning

**Purpose**

* Resolve natural language time references.

**Used in Horizon for**

* “Yesterday”
* “Last week”
* Date range comparisons

**Important rule**

* Time is resolved by code, never guessed by AI.

---

## 4. Advanced but Practical AI Concepts

These concepts make Horizon feel intelligent while remaining safe.

---

### 4.1 Agent Architecture (Tool-Based AI)

**Purpose**

* Control AI behavior using tools instead of free-form reasoning.

**Used in Horizon for**

* Chat flow control
* Data access mediation

**Key idea**

* LLM chooses *which tool to use*, not *how to compute results*.

---

### 4.2 LLM as Language Interface

**Purpose**

* Convert structured intelligence into natural language.

**Used in Horizon for**

* Explanation
* Reflection
* Comparison

**Explicit limitations**

* No computation
* No inference of missing data
* No diagnosis

---

## 5. Safety, Trust & Explainability

These concepts protect users and maintain system integrity.

---

### 5.1 AI Guardrails & Scope Enforcement

**Purpose**

* Prevent misuse and hallucination.

**Used in Horizon for**

* Blocking unrelated queries
* Enforcing mental-health-only scope

---

### 5.2 Explainable AI (XAI Principles)

**Purpose**

* Ensure every insight is traceable and justifiable.

**Used in Horizon for**

* Debugging
* User trust
* Ethical safety

**Key principle**

* Intelligence must be reproducible without the LLM.

---

## 6. Concepts Explicitly NOT Used

These are intentionally excluded.

* Deep Learning
* Transformer model training
* Reinforcement Learning
* End-to-end LLM reasoning
* Black-box prediction models

---

## Final Summary

Horizon’s AI is a **system**, not a single model.

It combines:

* Feature engineering
* Time-series analysis
* Statistics
* Rule-based reasoning
* NLP intent control
* Agent-based LLM usage

> **LLM is the narrator, not the brain.**

---

## Change Policy

Any change to AI behavior or scope must update this document first.
