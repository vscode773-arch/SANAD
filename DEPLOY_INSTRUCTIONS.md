# دليل نشر تطبيق "السند برو" على الإنترنت

التطبيق الآن يعمل بقاعدة بيانات **PostgreSQL** خارجية لضمان عدم ضياع البيانات.

## المتطلبات:

1. **قاعدة بيانات PostgreSQL** - يمكنك الحصول عليها من:
   - [Neon.tech](https://neon.tech) (مجانية)
   - [Supabase](https://supabase.com) 
   - Render PostgreSQL

2. **منصة استضافة** - مثل:
   - [Render.com](https://render.com)
   - Railway.app
   - Vercel (للواجهة فقط)

## الخطوات:

### 1. إعداد قاعدة البيانات (Neon)

1. اذهب إلى [console.neon.tech](https://console.neon.tech)
2. أنشئ قاعدة بيانات جديدة (أو استخدم الموجودة)
3. انسخ **Connection String** من لوحة التحكم
   - صيغته: `postgresql://user:password@ep-xxx.neon.tech/dbname?sslmode=require`

### 2. النشر على Render

#### أ. رفع الكود على GitHub (إذا لم تفعل):
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

#### ب. إنشاء Web Service على Render:

1. اذهب إلى [dashboard.render.com](https://dashboard.render.com)
2. اضغط **New** → **Web Service**
3. اربط حسابك بـ GitHub واختر المستودع
4. املأ الإعدادات:
   - **Name**: `sanad-pro` (أو أي اسم)
   - **Region**: Frankfurt (أو الأقرب لك)
   - **Branch**: `main`
   - **Root Directory**: اتركه فارغاً
   - **Build Command**: `npm install && cd backend && npx prisma generate && npx prisma db push`
   - **Start Command**: `npm start`

#### ج. إضافة المتغيرات البيئية (Environment Variables):

في صفحة إعدادات الخدمة على Render، أضف:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `JWT_SECRET` | رمز طويل عشوائي مثل: `your-very-long-secret-key-here-123456` |
| `DATABASE_URL` | الصق رابط Neon الذي نسخته (يبدأ بـ `postgresql://...`) |

#### د. النشر:

- اضغط **Create Web Service**
- انتظر اكتمال البناء (Build)
- سيعطيك رابطاً مثل: `https://sanad-pro.onrender.com`

### 3. إنشاء المستخدم الأول

بعد نجاح النشر، قم بتشغيل الأمر التالي عبر **Shell** في Render:

```bash
node seed.js
```

أو أنشئ المستخدم مباشرة عبر لوحة قاعدة البيانات في Neon.

الحساب الافتراضي:
- **اسم المستخدم**: `admin`
- **كلمة المرور**: `123456` (غيّرها فوراً!)

---

## ملاحظات مهمة:

✅ **النسخ الاحتياطي**: تقوم Neon تلقائياً بعمل نسخ احتياطية يومية.  
✅ **الأمان**: غيّر كلمة مرور المدير فوراً بعد أول دخول.  
✅ **التحديثات**: في كل مرة تعمل `git push`، ستتم إعادة نشر التطبيق تلقائياً على Render.

---

## استكشاف الأخطاء:

- **خطأ قاعدة البيانات**: تأكد أن `DATABASE_URL` صحيح ويبدأ بـ `postgresql://`
- **خطأ Prisma**: تأكد من تشغيل `npx prisma db push` في Build Command
- **البيانات لا تظهر**: تحقق من Logs في لوحة Render

---

**رابط التطبيق الحالي**: سيتم توفيره بعد النشر

