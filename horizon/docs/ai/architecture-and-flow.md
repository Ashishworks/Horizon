# Horizon AI — Architecture & Interaction Flow

> This document defines the **layered architecture**, **data boundaries**, and **execution flow** for Horizon’s AI system. It is the single source of truth for how AI is designed, implemented, and constrained.

---

## Core Principles

* AI is **purpose-locked** to mental health journaling and reflection
* **Code computes intelligence**; the LLM only explains
* Raw user data is **never** exposed to the LLM
* Time awareness (today, yesterday, ranges) is resolved by code
* Safety, explainability, and determinism come before completeness

---

## Layered System Overview

```
User
 ↓
UI Layer
 ↓
Control / Orchestration Layer
 ↓
Data Layer (Raw)
 ↓
Intelligence Layer (Computed)
 ↓
Validation & Guardrails
 ↓
LLM (Language Layer)
 ↓
Response & Observability
```

Each layer has a **single responsibility**. Layers must not leak concerns upward or downward.

---

## Layer 1 — UI / Interaction Layer

**Purpose**

* Capture user interactions and display results

**Lives in**

* `AIFaceModal.tsx`
* Dashboard cards & charts

**Responsibilities**

* Collect user input (chat messages, tab selection)
* Call backend APIs
* Render text, charts, and cards

**Must NOT**

* Perform analytics
* Parse dates
* Call the LLM
* Apply AI logic

---

## Layer 2 — Control / Orchestration Layer

**Purpose**

* Route requests and control execution order

**Lives in**

* `src/app/api/ai/overview/route.ts`
* `src/app/api/ai/chat/route.ts`

**Responsibilities**

* Authenticate user
* Determine mode (overview vs chat)
* Invoke downstream layers in order

**Must NOT**

* Compute stats
* Read raw journals directly
* Contain AI prompts

---

## Layer 3 — Data Layer (Raw)

**Purpose**

* Store the source-of-truth user data

**Lives in**

* Supabase tables (`journals`, `profiles`)
* Accessed via `api/journal` routes

**Responsibilities**

* Persist raw journal entries
* Enforce schemas & defaults

**Must NOT**

* Talk to the LLM
* Perform analytics
* Infer trends

---

## Layer 4 — Intelligence Layer (Computed)

**Purpose**

* Convert raw data into deterministic intelligence

**Lives in**

* `src/lib/intelligence/*`

**Responsibilities**

* Rolling averages (7/30/90 days)
* Slopes (progress rate)
* Volatility (std deviation)
* Correlations (sleep ↔ mood, exercise ↔ stress)
* Rule-based risk scoring

**Output**

* A structured `UserMentalSummary` object

**Must NOT**

* Generate text
* Guess or hallucinate
* Access UI or LLM

---

## Layer 5 — Validation & Guardrails

**Purpose**

* Enforce scope, safety, and data sufficiency

**Responsibilities**

* Intent classification (mental-health only)
* Time-range validation
* Data sufficiency checks

**Failure Behavior**

* Politely refuse out-of-scope requests
* Avoid speculation when data is missing

---

## Layer 6 — LLM (Language Layer)

**Purpose**

* Explain computed results in natural language

**Input to LLM**

* Structured summaries only
* Explicit constraints and instructions

**Responsibilities**

* Explanation
* Reflection
* Comparison (using provided numbers)

**Must NOT**

* Compute statistics
* Infer missing data
* Diagnose or give medical advice
* Answer unrelated questions

---

## Layer 7 — Response & Observability

**Purpose**

* Deliver results and ensure traceability

**Responsibilities**

* Return final response to UI
* Log inputs, computed summaries, and outputs
* Enable debugging and audits

---

## AI Interaction Flow

1. User interacts via Overview or Chat
2. UI sends request to backend
3. Control layer authenticates and routes
4. Raw data is fetched and normalized
5. Intelligence layer computes summaries
6. Validation checks scope and sufficiency
7. LLM explains structured results (optional for overview)
8. Response is returned and logged

---

## Non-Negotiable Constraints

* LLM never sees raw journals
* All time references are resolved by code
* Intelligence must be reproducible without LLM
* Safety > verbosity

---

## Change Policy

* Any change affecting AI scope, data access, or computation must update this document first.
