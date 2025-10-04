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

## Step 3 — Enable Email/Password Authentication
Path: Left sidebar → Build → Authentication → Sign-in method tab.

1) Click: Email/Password
2) Toggle: Enable
3) Click: Save

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

## Step 9 — (Optional) Demo-friendly Firestore Rules
Path: Build → Firestore Database → Rules tab → Edit rules → Publish.

Paste this for demos:
```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if true;                 // Anyone can read
      allow write: if request.auth != null; // Only signed-in users can write
    }
  }
}
```
For production, lock writes to admin only (requires advanced setup like custom claims).

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
