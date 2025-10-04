# MessMate Firebase Setup (Beginner Friendly)

This guide is super simple and tells you exactly where to click in the Firebase Console and what to run on Windows.

Files in this folder you will use:
- index.html — the app
- app.js — the app’s JavaScript
- styles.css — the app’s CSS
- instruction.md — this guide

Admin login for the dashboard:
- Email: dishantgotisdg9881@gmail.com
- Password: iamadmin

—

## Step 1 — Create a Firebase project
1) Open: https://console.firebase.google.com
2) Click: Add project
3) Project name: MessMate (or any name)
4) Google Analytics: Off (optional)
5) Click: Create project → Continue

Where to find it later: Left sidebar top = Project Overview (shows your current project).

—

## Step 2 — Add a Web App inside the project
Path in Firebase Console: Gear icon (top-left of sidebar) → Project settings → General tab → Your apps.

1) Click the Web icon “</>” under Your apps
2) App nickname: MessMate Web (any name)
3) Do not enable hosting (optional)
4) Click: Register app
5) On the next page you will see “SDK setup and configuration”. Keep this page open — you’ll copy that config JSON in Step 7.

What the config looks like:
```json
{
  "apiKey": "...",
  "authDomain": "your-project.firebaseapp.com",
  "projectId": "your-project",
  "storageBucket": "your-project.appspot.com",
  "messagingSenderId": "...",
  "appId": "..."
}
```

—

## Step 3 — Enable Email/Password + Google Authentication
Path: Left sidebar → Build → Authentication → Sign-in method tab.

Enable Email/Password:
1) Click: Email/Password
2) Toggle: Enable
3) Click: Save

Enable Google:
1) Back on Sign-in method tab, find “Google”
2) Click: Google → Toggle: Enable
3) Project support email: choose your email (required)
4) Click: Save

Authorized domains (if needed for Google sign-in):
- Path: Authentication → Settings tab → Authorized domains → Add domain → add: localhost

—

## Step 4 — Create a Cloud Firestore database
Path: Left sidebar → Build → Firestore Database → Create database.

1) Click: Create database
2) Choose: Start in test mode (OK for local demo)
3) Choose a location (any is fine)
4) Click: Enable

—

## Step 5 — Create the Admin user
Path: Left sidebar → Build → Authentication → Users tab.

1) Click: Add user
2) Email: dishantgotisdg9881@gmail.com
3) Password: iamadmin
4) Click: Add user

This account unlocks the Admin Dashboard.

—

## Step 6 — Run the app locally on Windows
You should open the app via http://localhost (not by double-clicking index.html), otherwise Firebase Auth may fail.

Pick ONE of these options:

Option A — VS Code Live Server (easiest)
- Open this folder in VS Code
- Right‑click index.html → Open with Live Server
- Your browser will open something like http://127.0.0.1:5500/index.html

Option B — Python 3 (if installed)
- PowerShell in this folder:
```
python -m http.server 5500
```
- Open: http://localhost:5500/index.html

Option C — Node.js (if installed)
- PowerShell in this folder:
```
npx serve .
```
- Open the URL printed (often http://localhost:3000)

—

## Step 7 — Connect the app to your Firebase project (paste config)
When the app loads the first time, a “Setup Firebase” popup appears.

Where to copy the config from:
Path: Gear icon → Project settings → General tab → Your apps → Select your Web app → “SDK setup and configuration” → choose “Config”/“CDN” and copy the JSON object.

Then in the popup:
1) Paste the JSON config
2) Click: Save & Reload

If you need to change it later:
- In the browser, press F12 → Console, run:
```
localStorage.removeItem('messmate_firebase_config');
```
- Refresh the page (popup will appear again)

—

## Step 8 — Use the app
- To browse messes: Click Register (create a student account) or Login with any student credentials
- To manage data: Login with admin credentials (from Step 5)
- To add samples: Admin → Dashboard → Seed Sample Data
- For nearest messes: Allow the browser’s location prompt when asked

—

## Step 9 — Firestore Rules (Production)
Path: Build → Firestore Database → Rules tab → Edit rules → Publish.

Use these production rules (we also saved a copy in firestore.rules in your repo):
```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() { return request.auth != null; }
    function isAdmin() {
      return isSignedIn() && request.auth.token.email == 'dishantgotisdg9881@gmail.com' && request.auth.token.email_verified == true;
    }
    function validateMess(data) {
      return data.keys().hasAll(['name','type','pricePerMeal','rating','todaysMenu','address','coordinates','phone']) &&
        data.name is string && data.name.size() > 0 && data.name.size() <= 100 &&
        data.type in ['veg','non-veg','both'] &&
        data.pricePerMeal is number && data.pricePerMeal >= 0 && data.pricePerMeal <= 10000 &&
        data.rating is number && data.rating >= 1 && data.rating <= 5 &&
        data.todaysMenu is list && data.todaysMenu.size() <= 50 &&
        data.address is string && data.address.size() > 0 && data.address.size() <= 300 &&
        data.coordinates is map &&
        data.coordinates.lat is number && data.coordinates.lat >= -90 && data.coordinates.lat <= 90 &&
        data.coordinates.lng is number && data.coordinates.lng >= -180 && data.coordinates.lng <= 180 &&
        data.phone is string && data.phone.size() >= 10 && data.phone.size() <= 20;
    }
    function validateStudent(data) {
      return data.keys().hasAll(['id','name','email','phone','status']) &&
        data.id == request.auth.uid &&
        data.name is string && data.name.size() > 0 && data.name.size() <= 100 &&
        data.email is string && data.email == request.auth.token.email &&
        data.phone is string && data.phone.size() >= 10 && data.phone.size() <= 20 &&
        (!('address' in data) || (data.address is string && data.address.size() <= 300)) &&
        data.status in ['active','inactive'];
    }
    function validateStudentUpdate(old, data) {
      return validateStudent(data) && data.status == old.status;
    }
    match /messes/{messId} {
      allow read: if true; // public read
      allow create, update, delete: if isAdmin() && validateMess(request.resource.data);
    }
    match /students/{studentId} {
      allow read: if isAdmin() || ( isSignedIn() && request.auth.uid == studentId );
      allow create: if isSignedIn() && request.auth.uid == request.resource.data.id && validateStudent(request.resource.data);
      allow update: if isAdmin() || ( isSignedIn() && request.auth.uid == studentId && validateStudentUpdate(resource.data, request.resource.data) );
      allow delete: if isAdmin();
    }
    match /{document=**} {
      allow read, write: if false; // default deny
    }
  }
}
```
Notes:
- Public can read messes. Only admin (email match + email verified) can write messes.
- Students can read their own profile; admin can read all students.
- Students can update their own name/phone/address; status can only be changed by admin.

—

## Step 10 — Deploy to Vercel (Static hosting)
Option A — GitHub import (UI):
1) Push this folder to a GitHub repo (Messmate)
2) Go to https://vercel.com → New Project → Import Git Repository
3) Select your repo
4) Framework preset: Other
5) Build command: (leave empty)
6) Output directory: . (a single dot)
7) Deploy

Option B — Vercel CLI (PowerShell):
```
npm i -g vercel
vercel --prod
```
Answer prompts:
- Framework: Other
- Build command: (empty)
- Output directory: .

Authorize your deployed domain in Firebase Auth:
- Path: Authentication → Settings → Authorized domains → Add domain → add your Vercel domain, e.g. your-app.vercel.app (and your custom domain if any)

Google Sign-In works on Vercel as long as the domain is authorized. No extra redirect URLs are needed.

—

## Step 11 — Final production checklist
- Rules published: Firestore Database → Rules → Publish (using the production rules above)
- Auth providers enabled: Authentication → Sign-in method → Email/Password + Google (with Project support email set)
- Authorized domains: localhost + your Vercel domain(s)
- Admin user exists with the exact email: dishantgotisdg9881@gmail.com
- Optional: Remove hardcoded Firebase config from app.js and rely on the setup popup or environment-specific build (tell me if you want me to switch it back)

—

## Step 10 — Common problems and exact places to fix them
1) “Operation not allowed / sign-in disabled”
   - Path: Build → Authentication → Sign‑in method → Email/Password → Enable → Save

2) “Missing or insufficient permissions” (Firestore)
   - Path: Build → Firestore Database → Rules tab → Edit rules → Publish (use demo rules above)

3) “This domain is not authorized”
   - Path: Build → Authentication → Settings tab → Authorized domains → Add domain → localhost

4) Popup to paste config didn’t show up
   - Press F12 → Console → run:
```
localStorage.removeItem('messmate_firebase_config');
```
   - Refresh

5) Distance/Nearest sorting not working
   - Allow the browser’s location prompt, or re-enable via the address bar lock icon (Site settings → Location: Allow)

6) Blank page when double‑clicking index.html
   - Serve via a local server (Step 6). Do not use file://

—

## You’re done!
- Student accounts can register and browse nearby messes.
- Admin account (email/password above) can view the dashboard, manage messes and students, and seed sample data.

If you want, I can also tighten Firestore rules for production later.
