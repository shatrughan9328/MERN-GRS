# 🔐 JWT, Bcrypt & Web Security — Complete Technical Guide & Interview Preparation

> **Project:** College Grievance Redressal System (MERN-GRS)  
> **Security Stack:** JSON Web Tokens (JWT), Bcrypt Password Hashing, RBAC, IDOR Defense  
> **Reference Material:** Analyzed from `100_NodeJS_Interview_Questions_by_Pushkar_Singh.pdf` (Chapter 9) & Active GRS Security Middleware

---

## 📑 Table of Contents
1. [Core Authentication & Security Theory](#-1-core-authentication--security-theory)
2. [JWT Structure & Token Lifecycle](#-2-jwt-structure--token-lifecycle)
3. [Password Hashing & Cryptographic Salting (Bcrypt)](#-3-password-hashing--cryptographic-salting-bcrypt)
4. [How Security & Auth are Implemented in MERN-GRS (Interviewer Questions & Answers)](#-4-how-security--auth-are-implemented-in-mern-grs)
5. [IDOR Prevention & Scope Isolation in GRS](#-5-idor-prevention--scope-isolation-in-grs)
6. [Top Auth & Security Interview Questions & Answers (English & Hinglish)](#-6-top-auth--security-interview-questions--answers-english--hinglish)
   - [Chapter 1: Authentication vs Authorization & JWT Fundamentals](#chapter-1-authentication-vs-authorization--jwt-fundamentals)
   - [Chapter 2: Cryptographic Password Hashing with Bcrypt](#chapter-2-cryptographic-password-hashing-with-bcrypt)
   - [Chapter 3: Web Vulnerabilities (IDOR, CSRF, XSS, Injection)](#chapter-3-web-vulnerabilities)
   - [Chapter 4: Token Storage, Expiration & Best Practices](#chapter-4-token-storage-expiration--best-practices)

---

## 🧠 1. Core Authentication & Security Theory

### Authentication vs Authorization
- **Authentication (AuthN)**: Verifying **identity**—confirming that users are who they claim to be (e.g., verifying student email and password during login).
- **Authorization (AuthZ)**: Verifying **permissions**—determining what authenticated users are allowed to see and perform (e.g., verifying that a user has the `Admin` role before allowing priority overrides).

### Stateless Token Auth vs Stateful Session Cookies:
| Dimension | Session-Based (Cookies) | Token-Based (JWT) |
| :--- | :--- | :--- |
| **State Storage** | Server memory / Redis store | Completely Stateless (stored inside client token) |
| **Horizontal Scalability** | Requires sticky sessions or shared session store | Effortless; any backend instance can verify token |
| **Mobile / Microservices** | Difficult across native apps and multiple domains | Universal; passed easily in HTTP headers |
| **CSRF Vulnerability** | Vulnerable if cookies lack `SameSite` flags | Immune when passed via `Authorization: Bearer` |

---

## 🎫 2. JWT Structure & Token Lifecycle

A JSON Web Token consists of three parts separated by dots (`.`): `header.payload.signature`

```
   ┌────────────────┐      ┌────────────────┐      ┌────────────────┐
   │     HEADER     │  .   │    PAYLOAD     │  .   │   SIGNATURE    │
   └───────┬────────┘      └───────┬────────┘      └───────┬────────┘
           │                       │                       │
           ▼                       ▼                       ▼
   Base64UrlEncoded        Base64UrlEncoded        HMACSHA256(
   {                       {                         base64Url(header) + "." +
     "alg": "HS256",         "id": "65ab8f...",      base64Url(payload),
     "typ": "JWT"            "role": "Admin",        process.env.JWT_SECRET
   }                         "exp": 1729450000     )
                           }
```

### How the Server Verifies the Token:
1. The server receives the token from the `Authorization: Bearer <token>` header.
2. It splits the token into `header`, `payload`, and `signature`.
3. It takes `header` and `payload`, hashes them using `process.env.JWT_SECRET`, and produces a calculated signature.
4. If calculated signature === provided signature, the token is authentic and un-tampered!
5. It checks the `exp` (expiration timestamp). If not expired, request proceeds.

---

## 🔒 3. Password Hashing & Cryptographic Salting (Bcrypt)

### Why NOT use plain text or MD5/SHA256?
- **Plaintext**: If the database is compromised, all user passwords are leaked immediately.
- **Fast Hashes (MD5, SHA-1, SHA-256)**: Designed to be fast for file verification. Modern GPUs can compute over 100 billion SHA-256 hashes per second, allowing attackers to crack complex passwords using **Rainbow Tables** (precomputed hash dictionaries) in minutes.

### How Bcrypt Protects Passwords:
1. **Adaptive Key Stretching**: Bcrypt is intentionally slow. The computational cost is determined by **Salt Rounds** (work factor). Each increment of salt rounds doubles the hashing time:
   - Work factor = 10 (used in GRS) means $2^{10} = 1,024$ internal hashing iterations, taking ~100ms per attempt—fast enough for users, but rendering brute-force attacks computationally impossible.
2. **Cryptographic Salt**: Bcrypt generates a random 128-bit cryptographic salt for every password. Even if two students choose the identical password (`password123`), their stored hashes will look completely different, completely neutralizing rainbow table dictionary attacks!

---

## 🎯 4. How Security & Auth are Implemented in MERN-GRS

### 🎙️ Interviewer Question:
> *"How is authentication and security implemented in your project? How do you manage roles and prevent security vulnerabilities?"*

### 💼 Model Answer (English):
> "In MERN-GRS, security is built across multiple defensive layers:
>
> 1. **Bcrypt Password Encryption**: Upon student registration, passwords are never stored in plaintext. We hash them using `bcrypt.hash(password, 10)`. During authentication, we verify credentials using `bcrypt.compare()` to guard against timing attacks.
> 2. **Stateless JWT Authorization**: Upon login, the backend signs a JWT token containing `{ id, role }` with a 1-day expiration (`expiresIn: "1d"`). This token is stored in the client's `localStorage` and dispatched in Axios headers via `Authorization: Bearer <token>`.
> 3. **Role-Based Access Control (RBAC)**: In `server/middleware/authMiddleware.js`, we implemented:
>    - `verifyToken`: Validates token signature, expiration, and extracts user ID.
>    - `requireAdmin`: Guarantees only verified administrators can confirm department routings, trigger AI re-evaluations, or perform priority overrides. Unauthorized student attempts return `403 Forbidden`.
>    - `requireStudent`: Guarantees student-only access to grievance creation.
> 4. **IDOR Mitigation**: Naive applications allow students to view each other's complaints by changing URL parameters (`/api/complaint/student/:id`). We explicitly check that `req.user.id === req.params.studentId`.
> 5. **Chatbot Data Isolation**: In the AI student assistant (`POST /api/ai/chat`), the student ID is **never trusted from the request body**. It is pulled strictly from the cryptographically verified JWT payload (`req.user.id`). The AI query only injects grievances owned by that specific student, completely eliminating cross-student data leakage."

### 🇮🇳 Model Answer (Hinglish):
> "Humare Grievance Redressal System me security ko bohot priority di gayi hai:
>
> 1. **Password Hashing (Bcrypt)**: Student signup ke waqt hum plain password database me save nahi karte. Hum `bcrypt.hash(password, 10)` se 10 salt rounds ke saath encrypt karte hain. Login ke waqt `bcrypt.compare()` se password match kiya jata hai.
> 2. **JWT Authentication**: Login successful hone par server ek JSON Web Token sign karta hai jisme user ID, role (`Student` ya `Admin`) aur 1 day ki expiry hoti hai. Frontend is token ko `localStorage` me save karta hai aur har request ke header me `Bearer <token>` bhejta hai.
> 3. **Role-Based Access Control (RBAC)**: Humne `authMiddleware.js` me middlewares banaye hain. Agar koi student admin ka route hit karta hai (jaise priority override ya status change), toh `requireAdmin` middleware use `403 Forbidden` throw kar deta hai.
> 4. **IDOR (Data Leak) Prevention**: Humne verify kiya hai ki koi student doosre student ki complaints na dekh sake. Middleware check karta hai ki logged-in user ki ID URL me pass ki gayi student ID ke barabar hai ya nahi.
> 5. **Chatbot Isolation**: Chatbot ke endpoint me student ID body se lene ke bajaye token ke `req.user.id` se li jaati hai, taaki AI sirf usi student ke tickets padh sake aur kisi aur ka data leak na ho."

---

## 🛡️ 5. IDOR Prevention & Scope Isolation in GRS

### The IDOR Vulnerability:
**Insecure Direct Object Reference (IDOR)** occurs when an application exposes a reference to an internal object (such as a database ID in the URL) without validating that the authenticated user actually owns that object.

```
Attacker (Student A, ID: 101) ───> GET /api/complaint/student/102 ───> Naive Server returns Student B's Private Complaints! ❌
```

### How GRS Blocks IDOR:
In `server/routes/complaintRoute.js`:
```javascript
routes.get("/student/:studentId", optionalAuth, async (req, res) => {
  // Enforce that authenticated students can ONLY view their own records
  if (req.user && req.user.role === "Student" && req.user.id !== req.params.studentId) {
    return res.status(403).json({
      msg: "Unauthorized access: You can only view your own complaints.",
    });
  }
  ...
});
```

### Chatbot Identity Grounding:
In `server/routes/aiRoute.js`:
```javascript
// Student ID is extracted strictly from verified token, NOT from request body!
const studentId = req.user.id;
const response = await handleStudentChat(message, history, studentId);
```
Even if an attacker tampers with the HTTP payload, the server strictly fetches and injects grievances tied to `req.user.id`.

---

## ❓ 6. Top Auth & Security Interview Questions & Answers (English & Hinglish)

### Chapter 1: Authentication vs Authorization & JWT Fundamentals

#### Q1. What is a JWT and how does it prevent tampering?
- **English Answer:**  
  A JSON Web Token is a compact, URL-safe means of representing claims between two parties. It consists of a Header, Payload, and cryptographic Signature. The signature is created by hashing the header and payload with a secret key known only to the server (`process.env.JWT_SECRET`). If an attacker alters any claim in the payload (e.g., changing `"role": "Student"` to `"role": "Admin"`), the calculated signature will not match the token's signature, and the server will reject it with `Invalid Token`.
- **Hinglish Answer:**  
  JWT ek secure token hota hai jo teen hisson me divided hota hai: Header, Payload aur Signature. Server apne secret key se iska signature banata hai. Agar koi hacker payload ke andar apni role badal kar 'Admin' karne ki koshish karega, toh uska signature invalid ho jayega aur server request ko turant reject kar dega.

#### Q2. Can sensitive data (like passwords) be stored in a JWT payload?
- **English Answer:**  
  **No! Absolutely not.** The payload of a standard JWT is only **Base64Url encoded**, not encrypted. Anyone who intercepts the token can decode the payload instantly using `atob()` or `jwt.io`. Only non-sensitive identity claims like user ID, roles, and expiration timestamps should be stored in the payload.
- **Hinglish Answer:**  
  Bilkul nahi! JWT ka payload encrypt nahi hota, sirf Base64 encode hota hai jise koi bhi `jwt.io` par jaakar dekh sakta hai. Isliye payload me kabhi bhi password, credit card ya sensitive data nahi daalna chahiye; sirf user ki ID aur role daalna chahiye.

---

### Chapter 2: Cryptographic Password Hashing with Bcrypt

#### Q3. What is Salt in Bcrypt and why is it necessary?
- **English Answer:**  
  A salt is a random 16-byte cryptographic string appended to a password before hashing.  
  **Why it is necessary:**
  1. It ensures that identical passwords yield different hashes, preventing attackers from using **Rainbow Tables** (pre-computed hash lookup tables) to reverse passwords in bulk.
  2. It forces attackers to compute separate brute-force calculations for every single account individually.
- **Hinglish Answer:**  
  Salt ek random data hota hai jo password ke saath jod kar hash banaya jata hai. Iska fayda ye hai ki agar do users ka password same (`123456`) bhi ho, tab bhi dono ka database me hash alag dikhega. Isse hackers pre-calculated dictionary (Rainbow Table) use karke passwords crack nahi kar sakte.

#### Q4. What is the difference between `bcrypt.hash()` and `bcrypt.compare()`?
- **English Answer:**  
  - `bcrypt.hash(password, saltRounds)`: Generates a random salt and hashes the plaintext password, returning a 60-character string containing the algorithm identifier, cost factor, salt, and hash.
  - `bcrypt.compare(enteredPassword, storedHash)`: Extracts the salt and cost factor from the `storedHash`, hashes the `enteredPassword` using that identical salt, and compares the resulting hash with the stored hash using constant-time comparison to prevent timing attacks.
- **Hinglish Answer:**  
  - `bcrypt.hash()`: Signup ke time naya password encrypt karke database me save karne ke kaam aata hai.
  - `bcrypt.compare()`: Login ke time user ke dale hue password ko database ke encrypted hash ke saath check karta hai bina decrypt kiye.

---

### Chapter 3: Web Vulnerabilities

#### Q5. What is Cross-Site Scripting (XSS) and how does React defend against it?
- **English Answer:**  
  XSS is an attack where malicious JavaScript is injected into trusted web applications and executed in victims' browsers.  
  **React's Defense**: React automatically escapes all strings rendered inside JSX expressions (`<div>{userInput}</div>`) before injecting them into the DOM, converting characters like `<` and `>` into HTML entities (`&lt;`, `&gt;`). Malicious scripts are treated as harmless strings rather than executable code unless developers dangerously use `dangerouslySetInnerHTML`.
- **Hinglish Answer:**  
  XSS me hacker input box me malicious JavaScript code (`<script>stealCookie()</script>`) daal kar doosre users ke browser me run karwane ki koshish karta hai. React isse automatically bachata hai kyunki JSX ke andar ka saara text auto-escape ho jata hai aur browser use code ke roop me execute karne ke bajaye plain text ki tarah display karta hai.

#### Q6. What is Cross-Site Request Forgery (CSRF) and why is JWT immune to it?
- **English Answer:**  
  CSRF occurs when a malicious website tricks a user's browser into sending unauthorized HTTP requests to an application where the user is currently authenticated (browsers automatically attach session cookies to cross-origin requests).  
  **JWT Defense**: When JWTs are stored in `localStorage` and sent via the custom `Authorization: Bearer <token>` header, browsers **never automatically attach** this header during cross-origin requests. A third-party malicious site cannot forge the request because it cannot access the token.
- **Hinglish Answer:**  
  CSRF attack me koi doosri website user ke browser se silently requests bhejti hai kyunki browser cookies ko automatically bhej deta hai. Lekin JWT me hum token ko header me `Authorization: Bearer` ke roop me bhejte hain jo browser automatically attach nahi karta. Isliye JWT authentication CSRF attacks se safe hoti hai.

---

### Chapter 4: Token Storage, Expiration & Best Practices

#### Q7. Where should JWTs be stored in the browser: `localStorage` vs `httpOnly` Cookies?
- **English Answer:**  
  - **`localStorage`**: Easy to implement across SPAs, immune to CSRF. Vulnerable if the application has an XSS vulnerability.
  - **`httpOnly` Cookies**: Immune to XSS token theft because JavaScript cannot read `document.cookie`. Requires CSRF protection (e.g., `SameSite=Strict` and anti-CSRF tokens).
  - **Enterprise Standard**: Access token in memory/localStorage with short expiry (15 mins), and a refresh token stored in a secure, `httpOnly`, `SameSite=Strict` cookie.
- **Hinglish Answer:**  
  - `localStorage`: SPA me use karna aasan hai aur CSRF attack se safe hai, lekin agar site me XSS bug ho toh JS ke through read kiya ja sakta hai.
  - `httpOnly Cookie`: JavaScript se read nahi ho sakti isliye XSS se safe hai, lekin CSRF se bachne ke liye `SameSite=Strict` lagana padta hai.

---

## 📌 Summary Checklist for Security & Auth Interview

| Concept | Quick Memory Trigger | GRS Project Reference |
| :--- | :--- | :--- |
| **Bcrypt Salt** | 10 rounds = $2^{10}$ iterations | Registration & login password hashing |
| **JWT Claims** | `{ id, role }` signed with secret | `jwt.sign()`, `jwt.verify()` |
| **RBAC Enforcement** | 403 Forbidden for non-admins | `requireAdmin` in `authMiddleware.js` |
| **IDOR Protection** | `req.user.id !== req.params.studentId` | `GET /api/complaint/student/:id` |
| **Chatbot Isolation** | Context grounded strictly in `req.user.id` | Student chatbot ticket scope |
| **CORS Policy** | Origin whitelisting & preflight | `app.use(cors())` in `server/index.js` |
