# aPanel 500 Error Fix Guide

Your login is failing with a **500 Internal Server Error**. This usually means a critical configuration is missing on the server, most likely the `JWT_SECRET`.

### Step 1: Upload the Debug Scripts
I have created two new files in `backend/`:
1. `backend/routes/auth.js` (Updated with better error logging)
2. `backend/check-production.js` (Run this to verify your server setup)
3. `backend/generate-secrets.js` (Generates secure keys)

**Action:** Upload these files to your server in the `backend` folder.

### Step 2: Check Server Configuration
Open the terminal on your aPanel/cPanel server, go to your backend folder, and run:

```bash
cd backend
node check-production.js
```

**Look for:**
- `❌ .env file MISSING!` -> You need to create the .env file.
- `❌ JWT_SECRET is MISSING!` -> You need to add JWT_SECRET to your .env file.
- `❌ Database check failed` -> Your DB credentials in .env are wrong.

### Step 3: Fix the .env File
If `JWT_SECRET` is missing, run this locally or on the server to generate new secrets:
```bash
node generate-secrets.js
```
Copy the output (e.g., `JWT_SECRET=...`) and paste it into your server's `.env` file.

### Step 4: Restart the App
After updating the `.env` file or uploading the new code:
1. Go to aPanel -> Website -> Node.js Project (or wherever you manage the Node app).
2. **Restart** the application.

### Step 5: Test Login Again
Try to login. If it fails, check the browser Console (F12) Network tab response. The new code I added will now return a **specific error message** instead of just "Internal Server Error".
