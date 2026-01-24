# Horizon Journal Data Schema (Supabase-Aligned)

This document defines the **canonical journal data model for Horizon**, explicitly aligned with the **current Supabase schema** while clearly separating:

* **User-facing journaling data** (rich, expressive)
* **AI-facing normalized features** (numeric, stable)

> This is a **data contract**. AI, analytics, trends, and safety logic depend on this remaining consistent.

---

## 1. Design Philosophy

Horizon follows a **dual-layer data strategy**:

1. **Raw Journal Layer (Supabase)**

   * Optimized for human expression
   * Stores text, enums, subjective inputs

2. **Normalized Intelligence Layer (Derived)**

   * Optimized for statistics, AI, and ML
   * Uses numeric, bounded, deterministic features

The AI system **never consumes raw journal rows directly**.

---

## 2. Source: Supabase Journals Table (Current)

The following table already exists in Supabase and remains the **source of truth**:

```sql
journals (
  id uuid,
  user_id uuid,
  date date,

  mood integer,
  sleep_quality text,
  sleep_hours integer,
  exercise ARRAY,

  productivity integer,
  productivity_comparison text,
  overthinking integer,
  stress_level integer,

  diet_status text,
  social_time text,
  negative_thoughts text,

  screen_work integer,
  screen_entertainment integer,

  stress_triggers text,
  main_challenges text,
  daily_summary text,

  created_at timestamp,
  updated_at timestamp
)
```

This schema is **not modified** for AI.

---

## 3. Canonical AI-Normalized Journal Entry

This is the **derived representation** used by the intelligence layer.

```ts
NormalizedJournalEntry {
  user_id: string
  date: YYYY-MM-DD

  mood: number                // 1 – 10
  stress: number             // 1 – 10
  sleepHours: number         // 0 – 12
  productivity: number       // 1 – 10
  overthinking: number       // 1 – 10

  screenTimeHours: number    // 0 – 24
  exercise: boolean

  dietScore: number          // 0 – 1
  socialScore: number        // 0 – 1

  sentimentScore: number     // -1.0 – +1.0 (future)
}
```

This object is **computed at read-time or cache-time**, never manually written.

---

## 4. Field-by-Field Mapping Rules

### 4.1 Mood

* Source: `journals.mood`
* Range: `1 – 10`
* Default: `5`

---

### 4.2 Stress

* Source: `journals.stress_level`
* Range: `1 – 10`
* Default: `5`

---

### 4.3 Sleep Hours

* Source: `journals.sleep_hours`
* Range: `0 – 12`
* Default: `6`

---

### 4.4 Productivity

* Source: `journals.productivity`
* Range: `1 – 10`
* Default: `5`

---

### 4.5 Overthinking

* Source: `journals.overthinking`
* Range: `1 – 10`
* Default: `5`

---

### 4.6 Screen Time

```ts
screenTimeHours = (screen_work ?? 0) + (screen_entertainment ?? 0)
```

* Range: `0 – 24`

---

### 4.7 Exercise

```ts
exercise = Array.isArray(exercise) && exercise.length > 0
```

* Type: boolean

---

### 4.8 Diet Score

Derived from `diet_status`:

```ts
Good   → 1.0
Okaish → 0.5
Bad    → 0.0
```

* Default: `0.5`

---

### 4.9 Social Score

Derived from `social_time`:

```ts
Decent → 1.0
Less   → 0.5
Zero   → 0.0
```

* Default: `0.5`

---

### 4.10 Sentiment Score (Future)

* Source: AI model applied to `daily_summary`
* Range: `-1.0 – +1.0`
* Stored separately or computed dynamically

---

## 5. Explicitly Non-AI Fields

The following fields are **never consumed directly by AI**:

* `daily_summary`
* `main_challenges`
* `stress_triggers`
* `deal_breaker`
* `special_day`
* `negative_thoughts_detail`
* `caffeine_intake`

These may be used for **tag extraction only**.

---

## 6. Normalization Rules (Mandatory)

* No `null` values in normalized output
* All numeric values must be clamped to defined ranges
* Missing categorical values fall back to neutral defaults
* Normalization occurs **before analytics, AI, or trends**

---

## 7. AI Consumption Contract

* AI receives only normalized summaries
* AI never sees raw Supabase rows
* AI must not infer missing data
* All explanations must reference computed values

---

## 8. Change Policy

Any change to:

* Supabase journal fields
* Normalization logic
* Feature ranges

**requires updating this document first**.

---

## Status

**Stable – Version 1.1 (Supabase-aligned)**