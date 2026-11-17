# Entity-Relationship (ER) Diagram & Database Schema

## SMART LOST & FOUND PLATFORM - MySQL Relational Architecture

The application is structured into normalized relational tables managed via Django ORM and persisted in MySQL 8.4 (`lost_found_db`).

```mermaid
erDiagram
    USER ||--o{ LOST_ITEM : "reports (1:N)"
    USER ||--o{ FOUND_ITEM : "finds and reports (1:N)"
    USER ||--o{ CLAIM_REQUEST : "submits as claimant (1:N)"
    USER ||--o{ NOTIFICATION : "receives (1:N)"
    USER ||--o{ CLAIM_REQUEST : "reviews as admin/finder (1:N)"

    LOST_ITEM ||--o{ ITEM_IMAGE : "has additional gallery photos (1:N)"
    FOUND_ITEM ||--o{ ITEM_IMAGE : "has additional gallery photos (1:N)"

    LOST_ITEM ||--o| ITEM_EMBEDDING : "has normalized feature vector (1:1)"
    FOUND_ITEM ||--o| ITEM_EMBEDDING : "has normalized feature vector (1:1)"

    LOST_ITEM ||--o{ MATCH_RECORD : "compared in (1:N)"
    FOUND_ITEM ||--o{ MATCH_RECORD : "compared in (1:N)"

    FOUND_ITEM ||--o{ CLAIM_REQUEST : "targeted by (1:N)"
    LOST_ITEM ||--o{ CLAIM_REQUEST : "linked to (0..1:N)"

    USER {
        bigint id PK
        varchar username UK
        varchar email
        varchar password
        varchar role "user | finder | admin"
        varchar phone_number
        varchar city
        text bio
        boolean is_verified
        datetime created_at
    }

    LOST_ITEM {
        bigint id PK
        bigint user_id FK
        varchar title
        varchar category
        text description
        varchar primary_color
        varchar secondary_color
        date date_lost
        varchar location_name
        varchar city
        varchar area
        decimal latitude
        decimal longitude
        varchar image
        varchar contact_preference
        varchar status "reported | matched | claim_pending | recovered"
        boolean is_resolved
        datetime created_at
    }

    FOUND_ITEM {
        bigint id PK
        bigint finder_id FK
        varchar title
        varchar category
        text description
        varchar primary_color
        varchar secondary_color
        date date_found
        varchar found_location
        varchar city
        varchar area
        decimal latitude
        decimal longitude
        varchar storage_location
        varchar image
        varchar contact_preference
        varchar status "available | claimed | handed_over | closed"
        datetime created_at
    }

    ITEM_EMBEDDING {
        bigint id PK
        bigint lost_item_id FK "unique, nullable"
        bigint found_item_id FK "unique, nullable"
        varchar model_name
        int embedding_dim
        json embedding "normalized vector array"
        datetime created_at
    }

    MATCH_RECORD {
        bigint id PK
        bigint lost_item_id FK
        bigint found_item_id FK
        float image_similarity "0-100%"
        float category_similarity "0-100%"
        float color_similarity "0-100%"
        float description_similarity "0-100%"
        float location_similarity "0-100%"
        float combined_score "weighted 0-100%"
        varchar confidence_level "high | medium | low"
        varchar status "pending | confirmed_by_user | rejected_by_user | claim_initiated"
        datetime created_at
    }

    CLAIM_REQUEST {
        bigint id PK
        bigint claimant_id FK
        bigint found_item_id FK
        bigint lost_item_id FK "nullable"
        text unique_identifying_features "confidential verification info"
        varchar serial_number "confidential"
        varchar proof_of_ownership "document/invoice"
        bigint reviewed_by_id FK "nullable"
        text admin_notes
        varchar status "pending | under_review | approved | rejected | resolved"
        datetime decision_date
        datetime created_at
    }

    NOTIFICATION {
        bigint id PK
        bigint recipient_id FK
        varchar notification_type "match_found | claim_received | claim_approved | claim_rejected | status_update | system"
        varchar title
        text message
        varchar link
        boolean is_read
        datetime created_at
    }
```

---

## Relational Constraints and Optimization

1. **Composite Unique Constraint**:
   - `MatchRecord(lost_item_id, found_item_id)`: Prevents duplicate match records for the same pair of items while allowing scores to be updated dynamically when models re-evaluate.
2. **Confidentiality & Privacy Enforcements**:
   - `ClaimRequest.unique_identifying_features` and `serial_number` are strictly masked for unauthenticated or non-participating users in the REST serializer (`to_representation`).
   - Exact user coordinates on map popups are sanitized so personal residence landmarks are not exposed.
3. **Database Engine**:
   - MySQL 8.4 InnoDB engine with UTF8MB4 charset, foreign key integrity constraints, and cascade deletion rules for dependent child entities.
