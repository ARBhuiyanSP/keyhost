# aPanel/cPanel Troubleshooting Guide

## Problem: API Endpoint Not Found (404)

If you are seeing errors like:
```json
{
  "success": false,
  "message": "API endpoint not found",
  "path": "/api/auth/login"
}
```
This means the request is reaching your backend server, but the server does not recognize the path.

### Likely Causes & Solutions

#### 1. URL Path Mapping (Most Likely)
When deploying Node.js apps on cPanel/aPanel using the **Node.js Selector**, the "Application URL" setting effectively mounts your app at that path.
- If you set Application URL to `yourdomain.com/api`, the server might strip `/api` from the request before sending it to your Node app.
- So a request to `yourdomain.com/api/auth/login` becomes `/auth/login` inside your Node app.
- If your code expects `/api/auth/login`, it fails with 404.

**The Fix (Already Applied):**
We have updated `backend/server.js` to listen on **BOTH** `/api/auth` and `/auth`. This ensures it works regardless of how the server routes the request.

**Action Required:**
1. Upload the updated `backend/server.js` to your server.
2. **Restart the Node.js application** in aPanel/cPanel.

#### 2. Wrong Request Method
Ensure your frontend is sending a **POST** request for login.
- Check the browser Network tab (F12 > Network).
- Look for the `login` request.
- Verify the Method is `POST`.

#### 3. Frontend Environment Variable
Ensure your frontend knows the correct API URL.
If your frontend is built for production, it uses `REACT_APP_API_URL`.
- If this is missing, it might default to `localhost`.
- If you are seeing the JSON error above, it implies the URL **is** pointing to a server, so this is likely correct, but double check.

### Debugging Steps

1. **Check Health Endpoint:**
   Visit `https://yourdomain.com/api/health` (or `https://yourdomain.com/health` depending on your mount point).
   You should see: `{"success":true,"message":"Keyhost Homes API is running"}`.

2. **Check Server Logs:**
   In aPanel/cPanel, look for the "Stderr" or "Log" output for your Node.js app.
   You should see lines like:
   `POST /api/auth/login 404 ...`
   or
   `POST /auth/login 404 ...`
   This tells you exactly what path the server is receiving.

3. **Verify Deployment:**
   - Did you run `npm install --production` on the server?
   - Did you restart the app after uploading changes?

### Interactive Default Search
If you are still stuck, you can use the debug script:
1. Open this project locally.
2. Edit `test-api-debug.js` (create it if missing) with your production URL.
3. Run `node test-api-debug.js`.
