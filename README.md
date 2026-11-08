# AniCloud

## Project Purpose:
A web platform for interactive anime streaming and tracking. It allows users to conveniently plan their watchlists, save personal cloud bookmarks, track up-to-date episode release schedules, receive notifications for new releases, chat within title-specific discussions, and watch anime together with friends in real time.


## Functional Requirements
* **Аутентифікація:** JWT (Refresh tokens are stored in the database (in hashed form))
* **Roles:** `User`,`Admin-content`,`Admin-user`,`Admin-chat`
* **Initial setup:** Automatically provisions the initial administrator account on startup via a database seeder (includes built-in duplication checks to prevent recreating an existing admin).
* **Rules:** Every admin must keep rules of own category or will blocked profile
* **Voting:** Every admin can give own vote only in own category and for each actions must  vote certaion numbers of admins in this category

### Features ###
* **User**
  * 1-Authorization
  * 2-Registration
  * 3-Sending a request for getting admin-rules 
  * 4-Review list of titles
  * 5-Searching for a specific title
  * 6-Review information about title
  * 7-Set a reminder for updating title 
  * 8-Correspone with other people about a specific title 
  * 9-Manage own group (Create/Remove/Invite) for speaking about specific title
  * 10-File a complaint against an admin
  * 11-Review user profile 
* **Admin(General)**
  * 1-Authorization
  * 2-Switch between pages (`User`,`Admin-content`,`Admin-chats`,`Admin-user`)
  * 3-Sending a request for getting other admin-rules
  * 4-Review requests for the removal of admin rights
  * 5-Review users profile
  * 6-Agreeing or disagreeing with the confirmation or removal of admin rights in the current category
* **Admin-content**
  * 1-Tools for update title
  * 2-Review request for getting admin-content ruiles 
  * 3-Confirm or reject changes to the title
* **Admin-chats**
  * 1-Block user for words
  * 2-Review request for getting admin-chats rules
* **Admin-user**
  * 1-Reviewing user reports regarding profiles that violate the rules or contain offensive language.
  * 2-Sending notification about violate rules of user data






## ⚙️ Non-Functional Requirements

### 🛡️ Security
- **SQL Injection Protection:** Usage of TypeORM/Prisma for query parameterization and strict DTO validation via `class-validator`.
- **XSS (Cross-Site Scripting) Protection:** Data sanitization/escaping, storing tokens in HTTP-only cookies, and configuring security headers with `Helmet`.
- **CSRF (Cross-Site Request Forgery) Protection:** `SameSite` flags for cookies and CSRF tokens for state-changing requests (`POST`, `PUT`, `DELETE`).
- **CORS (Cross-Origin Resource Sharing) Configuration:** Restricting access via a whitelist of allowed origins, methods, and headers.
- **Rate Limiting:** Protection against DDoS and brute-force attacks via `@nestjs/throttler` with Redis (up to 100 req/15 min for public endpoints, 5 attempts/15 min for auth).

---

### ⚡ Performance & Scalability
- **Server Response Time (Latency):** $\le 200\text{ ms}$ for 95% of standard requests (p95 latency) and under 500 ms for complex queries.
- **Throughput (RPS — Requests Per Second):** Handling 100+ RPS under normal operations, with peak capacity up to 300+ RPS.
- **Concurrent Users:** Support for up to 1,000 active concurrent sessions.
- **Optimization & Caching:** Redis implementation for caching and session management, mandatory data pagination, and DB indexing on key fields.




## Backend ##
* **Framework:** NestJS
* **Caching & Real-time:** Redis
* **Cloud storage:** Google Cloud
* **Containerization:** Docker
* **Notification:** Email and telegram-notification
* **Testing:** `K6(Stress test)`,`Integration-test` ,`Unit-test`
* **База даних:**
    * **Database:** MySql
    * **ORM:** Typeorm
    * **Entities**
    * <details>
      <summary><b>Entities - Click to expand</b></summary>

      <br/>

      ### 1. 👤 User (`users`)
      Зберігає базову інформацію про зареєстрованих користувачів системи.
      * **`id`** (`UUID`, Primary Key) — унікальний ідентифікатор.
      * **`email`** (`string`, Unique) — електронна пошта.
      * **`passwordHash`** (`string`) — захешований пароль.
      * **`nickname`** (`string`) — нікнейм користувача.
      * **`avatarUrl`** (`string`, Nullable) — посилання на аватар у Google Cloud Storage.
      * **`bio`** (`text`, Nullable) — коротка інформація про себе.
      * **`isBlockedInChat`** (`boolean`, default: `false`) — прапорець блокування доступів до чату.
      * **`createdAt`** / **`updatedAt`** (`Timestamp`) — дати створення та оновлення.
      
      ---
      </details>



* **Libraries:**

### Architecture ###
* **Architectural approaches:** `Modular Monolith`, `Microservices` , `WebSocket`
* **Modular Monolith:**
  * **Catalog animes:** Manages database titles, descriptions, posters, and release metadata.
  * **Notification:** Handles alerts and notifications regarding new anime releases and schedules.
  * **Cloud storage:** Manages the uploading and referencing of posters, banners, and media assets via cloud storage.
  * **Rest API:** Provides a standardized interface for interaction between the client-side and the application core.
* **Microservices:**
  * **Direct Chat Microservice:** Handles private messaging, social connections, and direct communication between users independently from the core domain.
* **Real-time Layer (WebSockets):**
  * **Title-Specific Chat & SyncPlay:** Real-time communication for live title discussions and synchronized co-watching rooms.



### API Endpoints (Backend)


### 📚 API Documentation (Swagger)
You can explore and test the interactive API documentation directly in your browser once the backend is running. Open the following link:
- **Swagger UI:** `http://localhost:4000/api` (or your configured port/prefix)
  

## Frontend ##
* **Framework:** Next.js
* **State Management** Redux + Redux-Saga
* **Validation:** yup
* **Forms:** Formik
* **Libraries:**

## 📦Installation
* Backend
* Frontend


## 📦 Seeds


Running all filling seed functions
```
npm run seed
```



## Tests
### Backend
Running vitest test
```
npm run test
```

Running oxlint test
```
npm run lint
```
### Frontend
Running eslint test
```
npm run lint
```



## 🔌 External Services
- NestJS Mailer (@nestjs-modules/mailer) — service integration used for sending email notifications to users.

## 🚀 Project Status
Active developing
