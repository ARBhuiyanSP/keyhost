# cPanel Deployment Guide (বাংলা)

## ⚠️ গুরুত্বপূর্ণ: Database Backup নিন

cPanel-এ update করার আগে **অবশ্যই database backup** নিন!

## 📋 Deployment Steps

### 1. Frontend Build & Upload

#### Step 1.1: Local এ Build করুন
```bash
cd frontend
npm install
npm run build
```

এটি `frontend/build` folder তৈরি করবে।

#### Step 1.2: Build Folder Upload করুন
- cPanel File Manager এ যান
- আপনার domain/subdomain এর `public_html` বা `public_html/your-app-name` folder এ যান
- **পুরানো `build` folder backup নিন** (rename করুন `build_old`)
- নতুন `build` folder এর সব files upload করুন
- `.htaccess` file check করুন (যদি থাকে)

#### Step 1.3: Environment Variables Update
`build/static/js/` folder এ `main.*.js` file এ API URL check করুন। 
যদি localhost থাকে, তাহলে:
- `frontend/.env.production` file তৈরি করুন:
```
REACT_APP_API_URL=https://yourdomain.com/api
```
- তারপর আবার build করুন

### 2. Backend Upload

#### Step 2.1: Backend Files Upload
cPanel এ backend folder structure:
```
/home/username/
  └── backend/
      ├── config/
      ├── middleware/
      ├── routes/
      ├── utils/
      ├── server.js
      ├── package.json
      └── .env (নতুন তৈরি করবেন)
```

**⚠️ গুরুত্বপূর্ণ:**
- `node_modules` upload করবেন **না** (cPanel এ install করবেন)
- `uploads` folder preserve করুন (existing images এর জন্য)
- `.env` file **নতুন** তৈরি করবেন (existing database credentials দিয়ে)

#### Step 2.2: cPanel Terminal/SSH এ Dependencies Install
```bash
cd ~/backend
npm install --production
```

#### Step 2.3: .env File Setup
cPanel File Manager এ `.env` file তৈরি করুন:
```env
# Database (cPanel এর existing database credentials)
DB_HOST=localhost
DB_USER=your_cpanel_db_user
DB_PASSWORD=your_cpanel_db_password
DB_NAME=your_cpanel_db_name
DB_PORT=3306

# JWT (existing values ব্যবহার করুন)
JWT_SECRET=your_existing_jwt_secret
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_existing_refresh_secret
JWT_REFRESH_EXPIRES_IN=30d

# Server
PORT=5000
NODE_ENV=production

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# Frontend URL
FRONTEND_URL=https://yourdomain.com
```

### 3. Database Management

#### ⚠️ Database Overwrite করবেন না!

**Existing database preserve করার জন্য:**

1. **Database Backup নিন:**
   - cPanel → phpMyAdmin
   - Database select করুন
   - Export → Go (SQL format)

2. **Schema Changes Check করুন:**
   - Local এ যদি নতুন table/column add করেন, তাহলে:
   - cPanel database এ manually SQL run করুন
   - **কখনো পুরো database drop/create করবেন না**

3. **Migration Scripts (যদি থাকে):**
   - নতুন table/column এর জন্য SQL scripts
   - phpMyAdmin এ run করুন

### 4. Node.js App Setup (cPanel)

#### Step 4.1: Node.js App Create/Update
cPanel → Node.js Selector:
1. Create Application (যদি না থাকে)
2. Application root: `backend`
3. Application URL: `yourdomain.com/api` (বা subdomain)
4. Application startup file: `server.js`
5. Node.js version: 18.x বা 20.x
6. **Environment variables:** `.env` file থেকে load হবে

#### Step 4.2: Start Application
- Node.js Selector এ "Start App" click করুন
- Logs check করুন errors এর জন্য

### 5. File Permissions

```bash
# SSH/Terminal এ:
chmod 755 ~/backend
chmod 755 ~/backend/uploads
chmod 644 ~/backend/.env
chmod 644 ~/backend/server.js
```

### 6. Nginx/Reverse Proxy Setup (যদি প্রয়োজন)

cPanel → Domains → Redirects:
- `/api/*` → `http://localhost:5000/api/*` (proxy)

অথবা `.htaccess` file (Apache):
```apache
RewriteEngine On
RewriteRule ^api/(.*)$ http://localhost:5000/api/$1 [P,L]
```

### 7. Testing

1. **Frontend Test:**
   - `https://yourdomain.com` visit করুন
   - API calls check করুন

2. **Backend Test:**
   - `https://yourdomain.com/api/health` visit করুন
   - Response: `{"success":true,"message":"Keyhost Homes API is running"}`

3. **Database Test:**
   - Login করুন
   - Existing properties দেখুন
   - New features test করুন

## 🔄 Update Process (পরবর্তী বার)

### Quick Update:
1. Local এ changes করুন
2. Frontend: `npm run build` → `build` folder upload
3. Backend: Changed files upload (routes, utils, etc.)
4. Node.js app restart করুন cPanel এ

### Full Update:
1. Database backup নিন
2. Frontend build & upload
3. Backend files upload
4. `npm install` (যদি package.json change হয়)
5. Node.js app restart

## ⚠️ Common Issues

### Issue 1: API 404 Error
**Solution:** 
- Check Node.js app running আছে কিনা
- Check reverse proxy/redirect setup
- Check `.env` file এর `FRONTEND_URL`

### Issue 2: Database Connection Error
**Solution:**
- Check `.env` file এর database credentials
- Check database user permissions
- Check database host (localhost vs 127.0.0.1)

### Issue 3: Images Not Loading
**Solution:**
- Check `uploads` folder permissions
- Check `UPLOAD_PATH` in `.env`
- Check static file serving in `server.js`

### Issue 4: Build Files Not Updating
**Solution:**
- Clear browser cache
- Check `.htaccess` file
- Check file permissions

## 📝 Checklist

- [ ] Database backup নিয়েছেন
- [ ] Frontend build successful
- [ ] Build folder upload complete
- [ ] Backend files upload complete
- [ ] `.env` file setup complete
- [ ] `node_modules` install complete
- [ ] Node.js app started
- [ ] File permissions set
- [ ] API health check passed
- [ ] Frontend loading correctly
- [ ] Existing properties showing
- [ ] Login working
- [ ] New features working

## 🆘 Support

যদি কোনো সমস্যা হয়:
1. cPanel Error Logs check করুন
2. Node.js Application Logs check করুন
3. Browser Console check করুন
4. Network tab এ API calls check করুন

---

**সতর্কতা:** কখনো production database এ direct changes করবেন না। সবসময় backup নিয়ে কাজ করুন!

