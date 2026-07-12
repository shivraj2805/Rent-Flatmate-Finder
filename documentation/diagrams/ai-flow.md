# Diagram: AI Scoring Sequence & Fallback Flow

This sequence diagram visualizes how compatibility is evaluated between a tenant profile and a listing, showing lock checking, Gemini calculations, and rule-based fallback execution.

```mermaid
sequenceDiagram
    autonumber
    actor Tenant as Tenant Browser
    participant API as Express Router
    participant Service as Compatibility Service
    participant Cache as Concurrent Lock Set
    participant Gemini as Gemini AI API
    participant DB as MongoDB Database
    participant SMTP as Nodemailer SMTP

    Tenant->>API: View Listing Details
    API->>Service: evaluateAndSaveCompatibility(listingId, profileId)
    Service->>Cache: Check Lock (listingId-profileId)
    
    alt Lock already exists (In Progress)
        Cache-->>Service: Lock present
        Service-->>API: Skip calculation / Use cached response
        API-->>Tenant: Return cached match details
    else Lock is free
        Service->>Cache: Acquire Lock (Add to Set)
        
        Note over Service, Gemini: Attempt LLM Evaluation
        Service->>Gemini: Request score analysis (Prompt + Input JSON)
        
        alt Gemini Response Success
            Gemini-->>Service: Return score + explanation JSON
        else Gemini Response Failure (Rate Limit / Timeout / Error)
            Gemini--X Service: Revoke / Fail
            Note over Service: Trigger Fallback Engine
            Service->>Service: calculateRuleBasedScore() using weights
        end
        
        Service->>DB: Upsert Compatibility Score record
        DB-->>Service: Return saved compatibility document
        
        alt Compatibility Score > 80
            Service->>SMTP: sendHighCompatibilityEmail(owner)
            SMTP-->>Service: Dispatched email
        end
        
        Service->>Cache: Release Lock (Remove from Set)
        Service-->>API: Return evaluated compatibility
        API-->>Tenant: Render circular matching score & details
    end
```
