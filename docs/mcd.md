# Modèle de données TouriBook (MCD)

> Généré depuis les modèles SQLAlchemy réels (14/08/2026). Architecture
> **database-per-service** : chaque diagramme correspond à une base distincte ;
> les références inter-services (pointillés du dernier schéma) sont de simples
> entiers **sans clé étrangère**, validés par appel API (voir
> [architecture.md — ADR-002](architecture.md#adr-002--une-base-postgresql-par-service)).

## 1. Base `touribook` — auth-service

```mermaid
erDiagram
    USERS {
        int id PK
        string nom
        string prenom
        string email UK "index"
        string hashed_password "pbkdf2_sha256"
        enum role "admin=1 | tourist=2"
        string preferences "nullable"
        datetime date_inscription
        bool is_active
        bool is_verified
        datetime email_verified_at "nullable"
        string preferred_language "fr par defaut"
        string phone "nullable"
        string avatar_url "nullable"
        datetime created_at
        datetime updated_at
    }
    REFRESH_TOKENS {
        uuid id PK
        int user_id FK "ON DELETE CASCADE"
        string token_hash UK "SHA-256, index"
        datetime expires_at
        bool revoked
        string user_agent "nullable"
    }
    EMAIL_VERIFICATION_TOKENS {
        uuid id PK
        int user_id FK "ON DELETE CASCADE"
        string token_hash "index"
        datetime expires_at
        datetime used_at "nullable = non utilise"
    }
    PASSWORD_RESET_TOKENS {
        uuid id PK
        int user_id FK "ON DELETE CASCADE"
        string token_hash UK "index"
        datetime expires_at
        datetime used_at "nullable = non utilise"
    }

    USERS ||--o{ REFRESH_TOKENS : "possede"
    USERS ||--o{ EMAIL_VERIFICATION_TOKENS : "recoit"
    USERS ||--o{ PASSWORD_RESET_TOKENS : "recoit"
```

## 2. Base `touribook_catalog` — catalog-service

```mermaid
erDiagram
    CATEGORIES {
        int id PK
        string nom UK
    }
    ACTIVITIES {
        int id PK
        string titre
        text description
        float prix
        int duree "minutes"
        string localisation
        float latitude "nullable"
        float longitude "nullable"
        text photos "nullable — /static/activities/…"
        int category_id FK
    }
    AVAILABILITIES {
        int id PK
        int activity_id FK
        date date
        time heure
        int places_disponibles "decrement atomique"
    }

    CATEGORIES ||--o{ ACTIVITIES : "classe"
    ACTIVITIES ||--o{ AVAILABILITIES : "propose"
```

## 3. Base `touribook_booking` — booking-service

```mermaid
erDiagram
    PROMO_CODES {
        int id PK
        string code UK "index"
        float reduction "pourcentage"
        date date_expiration
        bool actif
    }
    BOOKINGS {
        int id PK
        int user_id "ref auth (sans FK)"
        int activity_id "ref catalog (sans FK)"
        int availability_id "ref catalog (sans FK)"
        int promo_code_id FK "nullable"
        datetime date_reservation
        enum statut "pending | confirmed | cancelled"
        string qr_code "nullable — Phase 9"
        float montant_total "prix x nb_places, promo deduit"
        int nb_places "1 a 8"
    }

    PROMO_CODES ||--o{ BOOKINGS : "remise"
```

## 4. Base `touribook_payment` — payment-service

```mermaid
erDiagram
    PAYMENTS {
        int id PK
        int booking_id "ref booking (sans FK), index"
        float montant
        enum type "full | deposit"
        string methode "stripe par defaut"
        enum statut "pending | succeeded | failed"
        string stripe_intent_id "nullable — Phase 8"
        datetime date_paiement
    }
```

## 5. Base `touribook_review` — review-service

```mermaid
erDiagram
    REVIEWS {
        int id PK
        int user_id "ref auth (sans FK), index"
        int activity_id "ref catalog (sans FK), index"
        int note "1 a 5"
        text commentaire "nullable"
        datetime date
    }
    FAVORITES {
        int id PK
        int user_id "ref auth (sans FK)"
        int activity_id "ref catalog (sans FK)"
    }
```

> `FAVORITES` : contrainte d'unicité `(user_id, activity_id)` — un favori par
> utilisateur et par activité.

## 6. Vue d'ensemble — relations inter-services (logiques, sans FK)

```mermaid
erDiagram
    USERS ||--o{ BOOKINGS : "reserve (user_id)"
    USERS ||--o{ REVIEWS : "note (user_id)"
    USERS ||--o{ FAVORITES : "aime (user_id)"
    ACTIVITIES ||--o{ BOOKINGS : "objet de (activity_id)"
    AVAILABILITIES ||--o{ BOOKINGS : "creneau de (availability_id)"
    ACTIVITIES ||--o{ REVIEWS : "evaluee par (activity_id)"
    ACTIVITIES ||--o{ FAVORITES : "favorite de (activity_id)"
    BOOKINGS ||--o{ PAYMENTS : "reglee par (booking_id)"

    USERS { int id PK }
    ACTIVITIES { int id PK }
    AVAILABILITIES { int id PK }
    BOOKINGS { int id PK }
    PAYMENTS { int id PK }
    REVIEWS { int id PK }
    FAVORITES { int id PK }
```

**Règles de cohérence applicative** (remplacent les FK inter-services) :
- La création d'une réservation **vérifie** l'activité et le créneau via l'API du
  catalog-service (saga, [architecture.md §4.5](architecture.md#45-saga-de-réservation-multi-voyageurs)).
- La suppression d'une activité est **refusée** s'il existe des réservations
  (garde inter-services 409).
- Le dépôt d'un avis est **refusé** si l'utilisateur n'a pas de réservation non
  annulée de l'activité (`has-booked`).
- La suppression de compte **anonymise** l'utilisateur au lieu de le supprimer :
  les `user_id` référencés ailleurs restent valides.
