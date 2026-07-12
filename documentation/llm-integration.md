# RoomSync AI Compatibility Scoring Engine

This document details the architecture, request prompt formats, JSON output shapes, and fallback matching algorithms that power RoomSync's Roommate Compatibility engine.

---

## 🧠 Engine Workflow

The compatibility calculation is triggered:
1. **On-The-Fly**: When a tenant browses listings, any unrated listings trigger a background calculation.
2. **On-Demand**: When a tenant views a listing details panel or when an owner opens a matching request.
3. **Background Sync**: During bulk recalculation triggered when users change their profiles or listings.

To prevent wasteful parallel calls to the Gemini API, a concurrent evaluation cache lock is checked first:

```
Tenant Profile + Listing Match Request
                 │
                 ▼
     Is evaluation in progress?
         ├── Yes ──► Skip recalculation (use cached pending)
         └── No  ──► Lock Cache Key (listingId-tenantProfileId)
                       │
                       ▼
             Attempt Gemini Call
                 ├── Success ──► Parse & Validate JSON response
                 └── Failure ──► Log Warning & Run Rule-Based Engine
                                       │
                                       ▼
                             Save to MongoDB Compatibility
                             (scoringMethod: 'LLM' | 'Rule-Based')
                                       │
                                       ▼
                               Release Cache Key
```

---

## 📝 Gemini LLM Prompt Specification

The engine queries **Gemini 2.5 Flash** with system instructions to return a structured JSON response.

### System Instructions
```
You are an expert roommate matching assistant. Your job is to calculate a compatibility score (0-100) between a tenant profile and a room listing based on 4 weighted criteria:
1. Budget Fit (Max 40 points)
2. Location Match (Max 30 points)
3. Available Date vs Move-in Date Match (Max 20 points)
4. Room Type Preference (Max 10 points)

Rules:
- Budget fit: Deduct points if listing rent is above tenant maximum budget.
- Location fit: Check if listing location matches tenant's preferred locations.
- Timeline fit: Available date should align with tenant's move-in timeline.
- Room layout: Match tenant preferred roomType against listing roomType.

You must respond ONLY with a raw JSON object containing the keys: "score", "budgetScore", "locationScore", "dateScore", "roomTypeScore", "strengths", "weaknesses", and "explanation". Do not wrap response in markdown code blocks.
```

### Input Payload Example
```json
{
  "tenantProfile": {
    "preferredLocations": ["Koregaon Park", "Kalyani Nagar"],
    "budgetRange": { "min": 12000, "max": 16000 },
    "moveInDate": "2026-08-01T00:00:00.000Z",
    "roomPreferences": ["studio", "private-room"],
    "bio": "Non-smoker IT engineer searching for a quiet room.",
    "gender": "female"
  },
  "listing": {
    "title": "Cosy Studio in Koregaon Park",
    "location": "Koregaon Park, Pune",
    "rent": 15000,
    "roomType": "studio",
    "availableFrom": "2026-08-03T00:00:00.000Z",
    "furnished": true,
    "genderPreference": "female"
  }
}
```

### Output Response Format (Must Return ONLY JSON)
```json
{
  "score": 92,
  "budgetScore": 40,
  "locationScore": 30,
  "dateScore": 12,
  "roomTypeScore": 10,
  "strengths": [
    "Monthly rent of ₹15,000 fits perfectly within your budget range.",
    "Located in your highly preferred area of Koregaon Park.",
    "Listing room type aligns with your layout preferences."
  ],
  "weaknesses": [
    "Available date (August 3rd) is 2 days after your target move-in timeline."
  ],
  "explanation": "Excellent overall compatibility with location and layout preferences matching, and budget rent falling cleanly within limits. The minor timeline delay is negligible."
}
```

---

## 🛠️ Rules-Based Fallback Engine

If the Gemini API key is missing, a rate limit is exceeded, or JSON parsing fails, the system runs local fallback calculations to prevent service disruptions:

| Match Category | Max Points | Fallback Formula |
| :--- | :--- | :--- |
| **Budget Fit** | 40 | `100%` points if rent $\le$ max budget. If rent exceeds budget, deduct points proportionally to overage amount. |
| **Location Match** | 30 | `100%` points if listing location matches any preferred location (case-insensitive substring). Otherwise `0%`. |
| **Timeline Match** | 20 | Deduct `1 point` per day difference between available date and target move-in date, up to a maximum deduction of `20 points`. |
| **Preferences Match** | 10 | `100%` points if listing room type matches any tenant layout preferences. Otherwise `0%`. |

The fallback engine populates identical attributes (`strengths`, `weaknesses`, `explanation`), saving the record with `scoringMethod = 'Rule-Based'`.
