# Quick cPanel Deployment (সংক্ষিপ্ত)

## 🚀 দ্রুত Deployment Steps

### 1. Frontend Build & Upload

```bash
# Local terminal এ:
cd frontend
npm run build
```

**cPanel এ:**
- File Manager → `public_html` (বা আপনার domain folder)
- পুরানো `build` folder backup নিন
- নতুন `build` folder এর সব files upload করুন

### 2. Backend Upload

**cPanel File Manager এ:**
- `backend` folder এ যান
- শুধু **changed files** upload করুন:
  - `routes/` folder
  - `components/` folder (frontend এর)
  - `utils/` folder
  - `server.js` (যদি change হয়)
  - `package.json` (যদি change হয়)

**⚠️ Upload করবেন না:**
- `node_modules` ❌
- `.env` file ❌ (existing file keep করুন)
- `uploads` folder ❌ (existing images preserve করুন)

### 3. cPanel Terminal/SSH

```bash
cd ~/backend
npm install --production
```

### 4. Node.js App Restart

- cPanel → Node.js Selector
- আপনার app select করুন
- "Restart App" click করুন

### 5. Test

- Visit: `https://yourdomain.com`
- API check: `https://yourdomain.com/api/health`

## ⚠️ Database - কোনো Changes করবেন না!

- ✅ Existing database **preserve** করুন
- ✅ Existing properties **রাখুন**
- ❌ Database **overwrite করবেন না**
- ❌ Database **drop/create করবেন না**

## 📝 Checklist

- [ ] Database backup নিয়েছেন
- [ ] Frontend build complete
- [ ] Build folder upload complete
- [ ] Backend changed files upload complete
- [ ] `npm install` run করেছেন
- [ ] Node.js app restart করেছেন
- [ ] Test করেছেন

---

**বিস্তারিত guide:** `CPANEL_DEPLOYMENT_GUIDE.md` file দেখুন

