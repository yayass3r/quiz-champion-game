# Huawei AppGallery Deployment Guide
# دليل رفع التطبيق على متجر هواوي

## المتطلبات الأساسية

### 1. حساب المطور في هواوي
- سجّل في [Huawei Developer](https://developer.huawei.com/)
- أكمل التحقق من الهوية
- ادفع رسوم التسجيل (مجاني للأفراد)

### 2. إنشاء التطبيق في AppGallery Connect
1. اذهب إلى [AppGallery Connect](https://developer.huawei.com/consumer/cn/service/josp/agc/index.html)
2. انقر على "My Apps" → "Create"
3. اختر نوع التطبيق: "Game"
4. أدخل اسم التطبيق: **بطل الأسئلة**
5. اختر الفئة: **Trivia / Educational**

## إعداد المشتريات داخل التطبيق (IAP)

### المنتجات المطلوبة في AppGallery Connect:

| المنتج | Product ID | النوع | السعر المقترح |
|--------|-----------|-------|-------------|
| باقة المبتدئ | `com.quizchampion.starter_pack` | Consumable | 4.99 ر.س |
| باقة المغامر | `com.quizchampion.adventurer_pack` | Consumable | 9.99 ر.س |
| باقة البطل | `com.quizchampion.hero_pack` | Consumable | 19.99 ر.س |
| باقة الأسطورة | `com.quizchampion.legend_pack` | Consumable | 39.99 ر.س |
| إزالة الإعلانات | `com.quizchampion.remove_ads` | Non-Consumable | 2.99 ر.س |
| عضوية VIP شهرية | `com.quizchampion.vip_monthly` | Subscription | 4.99 ر.س/شهر |

### خطوات إعداد IAP:
1. في AppGallery Connect → اختر تطبيقك
2. اذهب إلى **In-App Purchases** → **Product Management**
3. أنشئ كل منتج من الجدول أعلاه
4. حدد الأسعار حسب كل دولة
5. فعّل حالة كل منتج

## إعداد ملف agconnect-services.json

1. من AppGallery Connect → **Project Settings**
2. انسخ قيم التالي:
   - App ID
   - CP ID
   - Product ID
   - Client ID
   - Client Secret
3. حمّل ملف `agconnect-services.json`
4. ضعه في: `android/app/agconnect-services.json`
5. حدث `YOUR_HUAWEI_APP_ID` في `AndroidManifest.xml`

## إعداد توقيع التطبيق

### إنشاء Keystore (إذا لم يكن موجوداً):
```bash
keytool -genkey -v -keystore quiz-champion-release.keystore \
  -alias quiz-champion \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -storepass quizchampion123 -keypass quizchampion123
```

### الحصول على SHA256 Fingerprint:
```bash
keytool -list -v -keystore quiz-champion-release.keystore \
  -alias quiz-champion -storepass quizchampion123
```
أضف الـ fingerprint في AppGallery Connect → Project Settings

## بناء ورفع APK

### بناء محلي:
```bash
# بناء الويب
npm run build

# مزامنة Capacitor
npx cap sync android

# بناء Release APK
cd android && ./gradlew assembleRelease
```

### ملف APK الناتج:
`android/app/build/outputs/apk/release/app-release.apk`

### رفع على AppGallery:
1. اذهب إلى **AppGallery Connect** → تطبيقك
2. انقر على **Version Information** → **New Version**
3. رفع ملف APK
4. املأ معلومات الإصدار:
   - الإصدار: 3.2.0
   - ملاحظات التحديث: دعم المشتريات من متجر هواوي + تحسينات
5. أضف لقطات الشاشة (مطلوب 3-8 لقطات)
6. أضف أيقونة التطبيق (512×512)
7. أضف صورة العرض (1024×500)
8. قدّم للمراجعة

## متطلبات المحتوى

### لقطات الشاشة المطلوبة:
- الدقة: 320px-3840px
- الصيغة: JPG/PNG
- العدد: 3-8 صور
- المقاسات المطلوبة: هاتف + تابلت

### الوصف:
- قصير: حتى 100 حرف
- كامل: حتى 8000 حرف
- اللغة: العربية + الإنجليزية

### معلومات الخصوصية:
- نوع البيانات المجمعة: لا شيء
- رابط سياسة الخصوصية: مطلوب

## اختبار IAP

### قبل الرفع:
1. استخدم حساب اختبار IAP من AppGallery Connect
2. اختبر كل منتج شراء
3. اختبر استرداد المشتريات
4. اختبر إلغاء الشراء
5. اختبر الشراء على أجهزة هواوي مختلفة

### أوامر ADB للتصحيح:
```bash
# تثبيت APK
adb install app-release.apk

# عرض سجلات HMS
adb logcat -s HuaweiIAP HMS_SDK

# مسح بيانات التطبيق
adb shell pm clear com.quizchampion.game
```

## ملاحظات مهمة

1. **مراجعة التطبيق**: قد تستغرق 1-3 أيام عمل
2. **أسعار IAP**: يجب تعيين سعر لكل دولة تدعمها
3. **الاشتراكات**: تتطلب موافقة إضافية من هواوي
4. **تحديثات**: نفس عملية رفع الإصدار الأول مع زيادة versionCode
5. **التوقيع**: يجب استخدام نفس الـ keystore لكل تحديث
