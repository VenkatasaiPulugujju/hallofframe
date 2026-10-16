# CAMPUS WALL OF FAME 💀
> **"Your campus. Your chaos. Funny moments deserve fame."**

Campus Wall of Fame is a college-exclusive entertainment and culture platform built for **Chinmaya Vishwavidyapeeth (CVV)**. Students can share humorous photos with verified consent, react with emoji pills (😂 Laugh, 💀 Skull, 🤡 Clown), browse trending campus legends, and participate in community activities.

---

## 🎨 Visual Design & Google Stitch Identity

The user interface preserves the original Google Stitch design system:
- **Bright Yellow Outer Canvas:** `#FFD719`
- **Warm Cream Content Surfaces:** `#FFF9F0`
- **Structural Black Outlines:** `#111111` (2.5px – 3px)
- **High-Voltage Accents:** Hot Pink (`#FF4388`), Vibrant Purple (`#8055F5`), Electric Green (`#39D62D`)
- **Hard-Edge Neo-Brutalist Box Shadows:** `3px 3px 0px #111111`, `5px 5px 0px #111111`, `8px 8px 0px #111111`
- **Tactile Mechanical Buttons:** Down-right press translation (`active:translate-x-[3px] active:translate-y-[3px]`)
- **Typography:** Display/Headers in **Bricolage Grotesque**, Body & Captions in **Plus Jakarta Sans**
- **Folder Tab Photo Cards:** Asymmetrical top folder tabs with category tags

---

## 🔐 Authentication & Domain Enforcement (@cvv.ac.in)

Access is strictly restricted to verified **@cvv.ac.in** Google accounts.

### Client-Side Guard
1. Google Sign-In with Firebase Authentication popup.
2. Provider custom parameters include `hd: "cvv.ac.in"`.
3. Email is normalized (`email.trim().toLowerCase()`).
4. Reject any account that does not match `^[a-zA-Z0-9._%+-]+@cvv\.ac\.in$`.
5. Non-CVV users (e.g. personal `@gmail.com`) are immediately signed out with an informative notice.

### Server-Enforced Security Rules
Client checks are never treated as sole security. Both **`firestore.rules`** and **`storage.rules`** evaluate:
```javascript
function isVerifiedCvv() {
  return request.auth != null
    && request.auth.token.email_verified == true
    && request.auth.token.email != null
    && request.auth.token.email.matches('^[a-zA-Z0-9._%+-]+@cvv[.]ac[.]in$');
}
```
Any unauthorized direct API or SDK read/write attempt by a non-CVV user returns `PERMISSION_DENIED`.

---

## 🚀 Step-by-Step Firebase Setup & Deployment Guide

### 1. Create Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Create a new project (e.g., `campus-wall-of-fame`).

### 2. Register Web Application
1. Click **Add app** > **Web (</>)**.
2. Register the app (e.g., `Campus Wall Web`).
3. Note down the `firebaseConfig` object values.

### 3. Enable Google Authentication
1. In Firebase Console, go to **Authentication** > **Sign-in method**.
2. Click **Add new provider** > **Google**.
3. Enable Google Sign-In and select a support email.
4. Under **Authorized domains**, ensure your hosting domain (or `localhost`) is added.

### 4. Create Firestore Database
1. Go to **Firestore Database** > **Create database**.
2. Select your preferred Cloud region.
3. Start in production mode.

### 5. Create Cloud Storage
1. Go to **Storage** > **Get started**.
2. Select your bucket region and default security settings.

### 6. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your client configuration:
```bash
VITE_FIREBASE_API_KEY="AIzaSy..."
VITE_FIREBASE_AUTH_DOMAIN="campus-wall-of-fame.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="campus-wall-of-fame"
VITE_FIREBASE_STORAGE_BUCKET="campus-wall-of-fame.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789012"
VITE_FIREBASE_APP_ID="1:123456789012:web:abcdef"
VITE_ALLOWED_EMAIL_DOMAIN="cvv.ac.in"
```

### 7. Deploy Security Rules
Deploy the provided `firestore.rules` and `storage.rules`:
```bash
firebase deploy --only firestore:rules,storage:rules
```

### 8. Set Up Administrator Custom Claims
Administrative privileges cannot be granted by client requests. Use Firebase Admin SDK:
```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function makeAdmin(uid) {
  await admin.auth().setCustomUserClaims(uid, { admin: true });
  console.log(`User ${uid} granted admin privileges.`);
}

// makeAdmin('TARGET_MODERATOR_UID');
```
Alternatively, add the user's UID as a document inside the `/admins/{uid}` collection.

---

## 📂 Firestore Data Architecture

- **`users/{uid}`**: Student profile with PII isolation (readable only by the owner or administrator).
- **`posts/{postId}`**: Post metadata, author info, image path, status (`pending`, `approved`, `rejected`, `removed`), aggregate reaction counters, and report counters.
- **`posts/{postId}/reactions/{uid}`**: User reactions subcollection enforcing exactly **one reaction per user per post** with atomic counts.
- **`reports/{reportId}`**: Moderation reports submitted by students. Only readable by administrators.
- **`moderationLogs/{logId}`**: Immutable audit logs created whenever a moderator approves, rejects, or takes down content.

---

## 🛠️ Local Development & Build

Install dependencies:
```bash
npm install
```

Start the local development server:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```
