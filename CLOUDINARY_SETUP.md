# إعدادات Cloudinary (للشعار)

## الحصول على API Keys:

1. اذهب إلى: https://cloudinary.com/users/register_free
2. سجل حساب جديد (مجاني)
3. بعد التسجيل، اذهب إلى Dashboard
4. انسخ القيم التالية:
   - Cloud Name
   - API Key
   - API Secret

## إضافة المتغيرات البيئية:

### محلياً (Local):
أضف في ملف `.env` في المجلد الرئيسي:

```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### على Render:
في Environment Variables على Render، أضف:

| Key | Value |
|-----|-------|
| `CLOUDINARY_CLOUD_NAME` | القيمة من Dashboard |
| `CLOUDINARY_API_KEY` | القيمة من Dashboard |
| `CLOUDINARY_API_SECRET` | القيمة من Dashboard |

## المميزات:

✅ الشعار يُحفظ في Cloudinary (دائم)
✅ تحسين تلقائي للصورة
✅ تصغير الحجم إلى 500x500 بكسل
✅ لن يُحذف عند إعادة النشر

## الحصة المجانية:

- 25 GB Storage
- 25 GB Bandwidth شهرياً
- كافية جداً لشعار واحد أو اثنين
