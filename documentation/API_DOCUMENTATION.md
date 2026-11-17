# REST API Documentation

Base URL: `http://127.0.0.1:8000/api`

---

## 1. Authentication & Users

### `POST /auth/register/`
Registers a new platform user.
- **Access**: Public
- **Request Body**:
  ```json
  {
    "username": "alice",
    "email": "alice@domain.com",
    "password": "Password@123",
    "password_confirm": "Password@123",
    "role": "user",
    "phone_number": "+91 9876543210",
    "city": "Hyderabad"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "user": { "id": 2, "username": "alice", "email": "alice@domain.com", "role": "user" },
    "access": "eyJhbGciOi...",
    "refresh": "eyJhbGciOi...",
    "message": "Registration successful!"
  }
  ```

### `POST /auth/login/`
Authenticates user with username & password, returns JWT tokens.
- **Access**: Public
- **Request Body**:
  ```json
  {
    "username": "alice",
    "password": "Password@123"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "access": "eyJhbGciOi...",
    "refresh": "eyJhbGciOi...",
    "user": { "id": 2, "username": "alice", "role": "user" }
  }
  ```

### `GET /auth/profile/`
Fetches authenticated user's profile.
- **Access**: Authenticated (`Bearer <token>`)
- **Response `200 OK`**: Full user profile object.

### `PATCH /auth/profile/`
Updates personal details (first_name, last_name, email, phone_number, city, bio, avatar).
- **Access**: Authenticated

### `PUT /auth/change-password/`
Changes current user's password.
- **Access**: Authenticated
- **Request Body**:
  ```json
  {
    "old_password": "OldPassword@123",
    "new_password": "NewStrongPassword@123"
  }
  ```

---

## 2. Lost Items

### `GET /lost-items/`
Lists lost items with optional filters (`search`, `category`, `city`, `color`, `my_reports`).
- **Access**: Public

### `POST /lost-items/`
Submits a new lost item report and triggers background AI match calculation.
- **Access**: Authenticated (`multipart/form-data`)
- **Fields**: `title`, `category`, `description`, `primary_color`, `secondary_color`, `date_lost`, `location_name`, `city`, `area`, `latitude`, `longitude`, `image`, `contact_preference`

### `GET /lost-items/{id}/`
Retrieves a specific lost item by ID.

### `PATCH /lost-items/{id}/`
Updates lost item details. (Owner or Admin only).

### `DELETE /lost-items/{id}/`
Deletes lost item report. (Owner or Admin only).

---

## 3. Found Items

### `GET /found-items/`
Lists found items with filters (`search`, `category`, `city`, `color`, `my_reports`).
- **Access**: Public

### `POST /found-items/`
Submits a newly found item report and runs AI similarity evaluation.
- **Access**: Authenticated (`multipart/form-data`)
- **Fields**: `title`, `category`, `description`, `primary_color`, `secondary_color`, `date_found`, `found_location`, `city`, `area`, `latitude`, `longitude`, `storage_location`, `image`, `contact_preference`

### `GET /found-items/{id}/`
Retrieves found item details.

### `PATCH /found-items/{id}/`
Updates found item details. (Finder or Admin only).

### `DELETE /found-items/{id}/`
Deletes found item report. (Finder or Admin only).

---

## 4. AI Matching Engine

### `GET /matches/`
Lists potential matches for the user's reported items (or all matches if admin).
- **Access**: Authenticated
- **Query Params**: `lost_item`, `found_item`, `confidence` (`high`, `medium`, `low`)

### `POST /matches/generate/`
Triggers multimodal feature extraction and similarity comparison for a specific item.
- **Access**: Authenticated
- **Request Body**: `{ "lost_item_id": 1 }` or `{ "found_item_id": 2 }`

### `POST /matches/{id}/respond/`
Accepts user response to a match (`confirm`, `dismiss`, `initiate_claim`).
- **Access**: Authenticated (Item owner or Finder)

---

## 5. Location-Based Proximity Search

### `GET /items/nearby/`
Returns items within a radius of specified coordinates using the Haversine distance formula.
- **Access**: Public
- **Query Params**:
  - `lat`: Decimal latitude
  - `lon`: Decimal longitude
  - `radius`: Search radius in km (default: 25)
  - `type`: `all`, `lost`, `found`
  - `city`: Optional city string filter

---

## 6. Ownership Claims

### `GET /claims/`
Lists ownership claims for the user (submitted or received). Admins can view all.
- **Access**: Authenticated

### `POST /claims/`
Submits an ownership claim with confidential identifying information.
- **Access**: Authenticated (`multipart/form-data`)
- **Fields**:
  - `found_item`: Found item ID
  - `lost_item`: Optional associated lost item ID
  - `unique_identifying_features`: Private marks/descriptions (Confidential)
  - `serial_number`: Optional device serial or IMEI (Confidential)
  - `proof_of_ownership`: Optional receipt or verification document

### `PATCH /claims/{id}/status/`
Updates claim status (`approved`, `rejected`, `under_review`, `resolved`).
- **Access**: Authenticated (Finder of the item or Administrator only)
- **Request Body**:
  ```json
  {
    "status": "approved",
    "admin_notes": "Handover arranged at station security office."
  }
  ```

---

## 7. Notifications

### `GET /notifications/`
Returns in-app notifications and `unread_count`.
- **Access**: Authenticated

### `PATCH /notifications/{id}/read/`
Marks a specific notification as read.

### `POST /notifications/mark-all-read/`
Marks all user notifications as read.

---

## 8. Dashboard Analytics

### `GET /dashboard/user/`
Aggregated counts for user's lost reports, found reports, matches, pending claims, and unread notifications.

### `GET /dashboard/admin/`
Global platform KPIs (Total Users, Total Lost, Total Found, Matches, Pending/Approved/Rejected Claims, Resolved Cases, Category Breakdown).
- **Access**: Admin only (`is_staff=True` or `role='admin'`)
