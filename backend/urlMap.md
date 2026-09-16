# API URL Reference Map

This document outlines the routing architecture for the backend API. All endpoints are structured hierarchically to remain predictable, maintainable, and compliant with standard REST conventions.

Base URL: http://localhost:5000/api

---

## 1. User Accounts and Authentication
Managed by userController.js. Handles user creation, credentials, and token generation.

| Method | URI Path | Payload Location | Description |
| :--- | :--- | :--- | :--- |
| POST | /api/users | req.body | Registers a new account and initializes an empty profile |
| POST | /api/users/login | req.body | Validates credentials and returns a 7-day JWT token |
| GET | /api/users/:id | req.params | Fetches core account details |
| PUT | /api/users/:id | req.params / req.body | Updates core account configuration |
| DELETE | /api/users/:id | req.params | Permanently deletes an account from the system |

### Registration Payload Example (POST /api/users)
```json
{
  "name": {
    "firstName": "John",
    "lastName": "Doe"
  },
  "birthdate": "1995-04-12",
  "email": "john.doe@example.com",
  "phone": {
    "countryCode": "+39",
    "number": "3331234567"
  },
  "password": "SecurePassword123!"
}
```

---

## 2. Athlete Profiles (UserData)
Managed by userProfileController.js. Handles biometric and athletic metrics linked one-to-one with a specific user identity.

| Method | URI Path | Payload Location | Description |
| :--- | :--- | :--- | :--- |
| GET | /api/users/:userId/profile | req.params | Fetches the athlete profile metrics |
| PUT | /api/users/:userId/profile | req.params / req.body | Modifies athletic or biometric data |

---

## 3. Training Plans
Managed by trainingPlanController.js. Governs macro-level training structures mapped to an athlete.

| Method | URI Path | Payload Location | Description |
| :--- | :--- | :--- | :--- |
| POST | /api/training-plans | req.body | Generates a new plan after confirming user-to-coach association |
| GET | /api/users/:userId/training-plan | req.params | Pulls the active training plan layout for the athlete |

### Creation Payload Example (POST /api/training-plans)
```json
{
  "userId": "65a123bc456789def0123456",
  "coachId": "65b987fe654321cba0987654"
}
```

---

## 4. Training Sessions (Workouts)
Managed by trainingSessionController.js. Controls distinct scheduled workout events within a plan.

| Method | URI Path | Payload Location | Description |
| :--- | :--- | :--- | :--- |
| POST | /api/training-sessions | req.body | Logs a single structural session under a plan |
| GET | /api/training-sessions/:id | req.params | Fetches details for a single specific session |
| GET | /api/users/:userId/training-sessions | req.params / req.query | Fetches a historical collection of sessions in a date range |
| DELETE | /api/users/:userId/training-sessions | req.params / req.query | Delete sessions or a single session based on what query paramateres are provided (hybrid function) |

### Creation Payload Example (POST /api/training-sessions)
```json
{
  "trainingPlanId": "65b11aa222333ccc44455566",
  "date": "2026-06-24",
  "order": 1,
  "title": "Push Hypertrophy Day",
  "sport": "Powerlifting"
}
```

### Date Range Query String Example (GET)
When filtering workouts by date range, parameters must be provided in the query string rather than the request body.

```http
GET http://localhost:5000/api/users/65a123bc456789def0123456/training-sessions?startDate=2026-06-01&endDate=2026-06-30
```