# Globe Trotter - Control Flow Architecture

## 1. REQUEST FLOW OVERVIEW

```
User Browser 
    ↓
server.js (Express App)
    ↓
Routes (authRoutes.js, tripRoutes.js, stopRoutes.js)
    ↓
Middleware (authMiddleware.js - JWT Verification)
    ↓
Controllers (authController.js, etc)
    ↓
Database (SQLite - db.js)
    ↓
Response to Browser
    ↓
EJS Pages (render HTML)
```

---

## 2. DETAILED FLOW WITH EXAMPLES

### Example 1: User Login Flow

#### Step 1: User Submits Login Form (Browser)
**File:** `pages/login.ejs`
```javascript
// User enters email & password, clicks Submit
fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@email.com', password: 'password123' })
})
```

#### Step 2: Server Receives Request (server.js)
**File:** `server.js` (Line 31)
```javascript
app.use("/api/auth", authRoutes);
// Request goes to /api/auth/login → authRoutes handles it
```

#### Step 3: Route Directs to Controller (authRoutes.js)
**File:** `routes/authRoutes.js` (Line 16)
```javascript
router.post("/login", login);
// login is imported from authController.js
```

#### Step 4: Controller Processes Logic (authController.js)
**File:** `controllers/authController.js` (Line 61-85)
```javascript
export const login = async (req, res) => {
  const { email, password } = req.body;  // Extract from request
  
  // Query database
  db.get("SELECT * FROM users WHERE email=?", [email], async (err, user) => {
    if (!user) return res.status(400).json({ error: "User not found" });
    
    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: "Invalid password" });
    
    // Generate JWT token
    const token = jwt.sign({ id: user.id }, config.JWT_SECRET);
    
    // Send response
    res.json({ token, userId: user.id, message: "Login successful" });
  });
};
```

#### Step 5: Browser Receives Response
**File:** `pages/login.ejs` (JavaScript)
```javascript
// Response received with token and userId
localStorage.setItem('token', response.token);
localStorage.setItem('userId', response.userId);
window.location.href = '/dashboard';  // Redirect to dashboard
```

#### Step 6: Server Renders Dashboard Page (server.js)
**File:** `server.js` (Line 58)
```javascript
app.get("/dashboard", (req, res) => {
  res.render("dashboard");  // Renders pages/dashboard.ejs
});
```

#### Step 7: Dashboard Page Fetches User Data (Browser)
**File:** `pages/dashboard.ejs` (JavaScript)
```javascript
async function fetchUserData() {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  
  const response = await fetch(`/api/auth/profile/${userId}`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  // Display user data on page
}
```

#### Step 8: Profile Request Goes Through Middleware
**File:** `routes/authRoutes.js` (Line 21)
```javascript
router.get("/profile/:id", protect, getProfile);
// protect middleware runs FIRST before getProfile controller
```

#### Step 9: Middleware Verifies JWT Token
**File:** `middleware/authMiddleware.js` (Line 3-13)
```javascript
export const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];  // Extract token
  
  if (!token) return res.status(401).json({ error: "No token" });
  
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);  // Verify token
    req.user = decoded;  // Store decoded user data in request
    next();  // Continue to controller
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};
```

#### Step 10: Controller Fetches User Profile
**File:** `controllers/authController.js` (Line 142-152)
```javascript
export const getProfile = (req, res) => {
  const userId = req.params.id;
  
  db.get("SELECT id, name, email FROM users WHERE id=?", [userId], (err, user) => {
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  });
};
```

#### Step 11: User Data Returned to Browser
Browser receives user data and displays it on dashboard.

---

### Example 2: Navigation to Pages (UI Routes)

#### User Clicks "My Trips" in Sidebar
**File:** `pages/dashboard.ejs` (HTML)
```html
<a href="/trips" class="...">
  <span class="text-xl">✈️</span>
  <span class="font-medium">My Trips</span>
</a>
```

#### Server Routes to Trips Page
**File:** `server.js` (Line 67)
```javascript
app.get("/trips", (req, res) => {
  res.render("trips");  // Renders pages/trips.ejs
});
```

#### Trips Page Loads in Browser
**File:** `pages/trips.ejs`
- Shows trip listing with sample data
- No API call needed for initial load

---

### Example 3: API Flow (Future - Trip Management)

When trips API is implemented:

```
Browser (fetch /api/trips/create)
    ↓
server.js (route: /api/trips → tripRoutes)
    ↓
tripRoutes.js (POST /create → tripController.createTrip)
    ↓
middleware/authMiddleware.js (verify JWT)
    ↓
controllers/tripController.js (handle business logic)
    ↓
db.js (INSERT into trips table)
    ↓
Response with trip data
    ↓
Browser receives response → redirect to /trips
```

---

## 3. FILE STRUCTURE & RESPONSIBILITIES

### `server.js` - Entry Point & Route Delegation
- **Purpose:** Initialize Express app, configure middleware, delegate routes
- **Key Lines:**
  - Line 13-14: Import route handlers
  - Line 31: Mount auth routes
  - Line 32-33: Mount other API routes
  - Line 35+: Mount UI routes (render EJS pages)

### `routes/authRoutes.js` - API Route Mapping
- **Purpose:** Map HTTP methods and paths to controller functions
- **Pattern:** `router.METHOD(path, [middleware], controller)`
- **Example:** `router.post("/login", login)` → calls `login()` from authController

### `middleware/authMiddleware.js` - Request Validation
- **Purpose:** Verify JWT tokens before allowing access to protected routes
- **Flow:** Extract token → Verify with secret → Attach user to request → Continue or reject
- **Used In:** `/api/auth/profile/:id` route (Line 21 of authRoutes)

### `controllers/authController.js` - Business Logic
- **Purpose:** Handle authentication logic, database operations, error handling
- **Functions:**
  - `register()` - Create user, send OTP
  - `verifyOtp()` - Validate OTP, mark user verified
  - `login()` - Validate credentials, generate JWT
  - `getProfile()` - Fetch user data (protected)
  - `resetPassword()` - Update password

### `db.js` - Database Setup & Schema
- **Purpose:** Initialize SQLite database and create tables
- **Tables:**
  - `users` - User accounts (id, name, email, password, otp, isVerified)
  - `trips` - User trips (id, user_id, title, description, dates, etc)
  - `stops` - Trip stops/destinations

### `pages/*.ejs` - Frontend Templates
- **Purpose:** Render HTML with embedded JavaScript
- **Files:**
  - `login.ejs` - Login form, calls `/api/auth/login`
  - `register.ejs` - Registration form
  - `dashboard.ejs` - Main dashboard, calls `/api/auth/profile/:userId`
  - `trips.ejs` - Trip listing page (currently hardcoded data)
  - `create-trip.ejs` - Trip creation form
  - `profile.ejs` - User profile management

---

## 4. DATA FLOW EXAMPLE: Login → Dashboard

```
1. USER ENTERS EMAIL & PASSWORD (login.ejs)
   ↓
2. JavaScript fetch() sends POST to /api/auth/login
   ↓
3. server.js receives request, matches route /api/auth/login
   ↓
4. Routes to authRoutes.js → router.post("/login", login)
   ↓
5. authController.login() executes:
   - Extract email, password from request body
   - Query database for user
   - Compare password with bcrypt
   - Generate JWT token
   - Send {token, userId}
   ↓
6. login.ejs receives response:
   - Store token and userId in localStorage
   - Redirect to /dashboard
   ↓
7. Browser navigates to /dashboard
   ↓
8. server.js matches GET /dashboard
   ↓
9. res.render("dashboard") sends dashboard.ejs to browser
   ↓
10. dashboard.ejs loads in browser:
    - Runs fetchUserData() function
    - Sends GET /api/auth/profile/:userId with token
    ↓
11. authRoutes.js matches GET /profile/:id
    ↓
12. Middleware (protect) validates token
    ↓
13. authController.getProfile() executes:
    - Extract userId from params
    - Query database for user
    - Send {user}
    ↓
14. dashboard.ejs receives user data
    - Display name, email in UI
    ↓
15. USER SEES DASHBOARD WITH THEIR DATA
```

---

## 5. MIDDLEWARE EXECUTION ORDER

When a request hits a protected route like `GET /api/auth/profile/:id`:

```
Request Arrives at /api/auth/profile/:id
    ↓
Express Routes Middleware Stack:
1. app.use(cors())              ← Allow cross-origin requests
2. app.use(express.json())      ← Parse JSON body
3. app.use(express.static())    ← Serve static files
4. app.use("/api/auth", authRoutes)  ← Route to authRoutes
    ↓
    Within authRoutes:
    router.get("/profile/:id", protect, getProfile)
    ↓
5. protect middleware           ← Verify JWT token
    ↓
    If valid: next() → proceed to controller
    If invalid: return 401 error
    ↓
6. getProfile controller        ← Fetch user from database
    ↓
Response sent to browser
```

---

## 6. KEY CONCEPTS

### Request Lifecycle
1. **Route Match** - Express finds matching route in server.js or sub-routes
2. **Middleware** - Request passes through middleware (auth, parsing, etc)
3. **Controller** - Business logic executes
4. **Database** - Data is read/written via db.js
5. **Response** - Data sent back to browser (JSON or HTML)

### Authentication Flow
- **JWT Token** - Issued on login, stored in localStorage
- **Bearer Token** - Sent in Authorization header for protected routes
- **Verify Token** - Middleware checks token validity before allowing access

### Data Flow
- **Frontend** → sends data via fetch()
- **Server** → processes request, validates, queries database
- **Database** → returns data
- **Server** → sends response
- **Frontend** → updates UI with response

---

## 7. CURRENT ROUTES SUMMARY

### UI Routes (server.js)
```
GET  /                  → login.ejs
GET  /login             → login.ejs
GET  /register          → register.ejs
GET  /verify-otp        → verify-otp.ejs
GET  /forgot-password   → forgot-password.ejs
GET  /reset-password    → reset-password.ejs
GET  /dashboard         → dashboard.ejs
GET  /profile           → profile.ejs
GET  /trips             → trips.ejs
GET  /create-trip       → create-trip.ejs
```

### API Routes (authRoutes.js)
```
POST /api/auth/register              → register user
POST /api/auth/verify-otp            → verify OTP
POST /api/auth/resend-otp            → resend OTP
POST /api/auth/login                 → login user
POST /api/auth/forgot-password       → request password reset
POST /api/auth/reset-password        → reset password
GET  /api/auth/profile/:id [PROTECTED] → fetch user profile
```

### TODO API Routes (to be implemented)
```
GET    /api/trips              → Get all trips for user
POST   /api/trips              → Create new trip
GET    /api/trips/:id          → Get trip details
PUT    /api/trips/:id          → Update trip
DELETE /api/trips/:id          → Delete trip

GET    /api/stops              → Get stops for a trip
POST   /api/stops              → Create stop
PUT    /api/stops/:id          → Update stop
DELETE /api/stops/:id          → Delete stop
```

---

**Summary:** The control flow follows a standard **MVC (Model-View-Controller)** pattern where requests route through handlers to controllers, which interact with the database and send responses back to the frontend pages (EJS templates).
