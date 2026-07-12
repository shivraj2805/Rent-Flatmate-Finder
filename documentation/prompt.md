# Gemini AI Compatibility Prompt

RoomSync leverages Google Gemini Flash API (`gemini-2.5-flash`) for matches, returning structured ratings based on locations, budgets, dates, and lifestyles.

---

## AI Prompt Template

The prompt is constructed dynamically in `server/services/compatibilityService.js` and populated with Mongoose documents for both the listing and the tenant profile.

```text
You are an expert real estate matching assistant. Calculate a compatibility score (0 to 100) and provide a concise explanation (max 2-3 sentences) indicating how well a tenant's preferences match a listed room.

Room Listing details:
- Location: {listing.location}
- Monthly Rent: ₹{listing.rent}
- Available Date: {listing.availableFrom}
- Room Type: {listing.roomType}

Tenant Profile details:
- Preferred Locations: {profile.preferredLocations}
- Budget Range: ₹{profile.min} to ₹{profile.max}
- Target Move-in Date: {profile.moveInDate}

Evaluation criteria:
1. Budget Match: Rent should ideally fall within the budget range.
2. Location Match: Listing location should match or be close to the tenant's preferred locations.
3. Move-in Date Match: Listing available date should be near or before the tenant's target move-in date.

Return ONLY a JSON object with this exact structure:
{
  "score": <integer score from 0 to 100>,
  "explanation": "<concise explanation detail>"
}
```

---

## Evaluation Criteria Guidelines

When Gemini evaluates the prompt, it weighs the fields semantically based on the following guidelines:

1. **Rent vs. Budget Range (High Priority)**
   - Ideal: Rent falls squarely within the tenant's budget range (`[min, max]`).
   - Acceptable: Rent is below the tenant's minimum budget (still 100% budget match, as cheaper is positive).
   - Penalized: Rent is higher than the tenant's maximum budget. The penalty should scale with the percentage overage.

2. **Location Proximity (High Priority)**
   - Ideal: Listing location neighborhood matches or is located immediately adjacent to one of the tenant's `preferredLocations`.
   - Acceptable: Neighboring areas in Pune (e.g. Koregaon Park matching Kalyani Nagar or Viman Nagar).
   - Penalized: Mismatched cities or completely different ends of the metropolitan area (e.g., Hinjewadi vs. Kharadi).

3. **Move-in Timeline Compatibility (Medium Priority)**
   - Ideal: Listing is available *on or before* the tenant's target move-in date.
   - Acceptable: Listing is available within a short window (1-7 days) *after* the tenant's target date.
   - Penalized: Availability date is weeks or months after the target move-in date.

---

## Response Formatting Constraints

To ensure compatibility with our backend JSON parser, the model must obey these strict output instructions:
- **No Markdown Fencing**: The response must contain raw JSON without ` ```json ` markdown headers.
- **Strict JSON Types**: The `score` property must be an integer, and the `explanation` must be a double-quoted string.
- **No Explanatory Text Outside JSON**: The API calls specify `generationConfig: { responseMimeType: 'application/json' }` to enforce JSON structure generation.

---

## Example Execution

### 1. Request Input Parameters
- **Listing location**: `Lane 5, Koregaon Park, Pune`
- **Listing monthly rent**: `₹14,000`
- **Listing available from**: `2026-08-01`
- **Listing room type**: `studio`
- **Tenant preferred locations**: `["Koregaon Park", "Viman Nagar"]`
- **Tenant budget range**: `₹10,000` to `₹15,000`
- **Tenant target move-in date**: `2026-08-01`

### 2. Formatted API Request Body
The raw JSON payload dispatched to the Gemini API endpoint:
```json
{
  "contents": [
    {
      "parts": [
        {
          "text": "\nYou are an expert real estate matching assistant. Calculate a compatibility score (0 to 100) and provide a concise explanation (max 2-3 sentences) indicating how well a tenant's preferences match a listed room.\n\nRoom Listing details:\n- Location: Lane 5, Koregaon Park, Pune\n- Monthly Rent: ₹14000\n- Available Date: Sun Aug 01 2026\n- Room Type: studio\n\nTenant Profile details:\n- Preferred Locations: Koregaon Park, Viman Nagar\n- Budget Range: ₹10000 to ₹15000\n- Target Move-in Date: Sun Aug 01 2026\n\nEvaluation criteria:\n1. Budget Match: Rent should ideally fall within the budget range.\n2. Location Match: Listing location should match or be close to the tenant's preferred locations.\n3. Move-in Date Match: Listing available date should be near or before the tenant's target move-in date.\n\nReturn ONLY a JSON object with this exact structure:\n{\n  \"score\": <integer score from 0 to 100>,\n  \"explanation\": \"<concise explanation detail>\"\n}\n"
        }
      ]
    }
  ],
  "generationConfig": {
    "responseMimeType": "application/json"
  }
}
```

### 3. API Response Output Received
```json
{
  "score": 100,
  "explanation": "This room offers an excellent match, perfectly aligning with the tenant's budget of ₹10,000-₹15,000 and their target move-in date. Additionally, the Koregaon Park location is one of the tenant's top preferred areas, ensuring a high degree of compatibility."
}
```
