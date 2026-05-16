# Huawei AppGallery Deployment Guide
# دليل رفع التطبيق على متجر هواوي

## روابط التحميل المباشر

| النوع | الرابط |
|-------|--------|
| **نسخة الإنتاج (Release APK)** | https://github.com/yayass3r/quiz-champion-game/releases/latest/download/app-release.apk |
| **نسخة الاختبار (Debug APK)** | https://github.com/yayass3r/quiz-champion-game/releases/latest/download/app-debug.apk |
| **صفحة جميع الإصدارات** | https://github.com/yayass3r/quiz-champion-game/releases/latest |

---

## معلومات التطبيق

- **اسم التطبيق:** بطل الأسئلة / Quiz Champion
- **اسم الحزمة:** com.quizchampion.game
- **الإصدار:** 3.4.0
- **الفئة:** ألعاب / أسئلة وترفيه (Trivia / Educational)
- **التقييم العمري:** 3+ (مناسب لجميع الأعمار)

### وصف قصير (عربي):
تحدَّ نفسك في ألغاز متنوعة وأسئلة ثقافية مشوقة! لعبة بطل الأسئلة

### وصف قصير (إنجليزي):
Challenge yourself with diverse puzzles and trivia! Quiz Champion Game

### وصف كامل (عربي):
بطل الأسئلة هي لعبة ألزان وأسئلة ثقافية ممتعة تجمع بين الترفيه والتعلم. اختر من بين 6 أنماط لعب مختلفة: الكلاسيكي، السريع، البقاء، الماراثون، التحدي اليومي، ومعارك الفرق. تنافس مع أصدقائك وتسلق قائمة المتصدرين!

اكتشف أكثر من 17 تصنيفاً للأسئلة شاملة: العلوم، التاريخ، الجغرافيا، الرياضة، الفنون، الثقافة الإسلامية، التقنية، الطب، الأدب، السينما، الموسيقى، الطبيعة، الفلسفة، الاقتصاد، القانون، الفضاء، واللغات. حقق الإنجازات واحصل على المكافآت اليومية واشترِ من المتجر أدوات مساعدة قوية.

مميزات اللعبة:
• 6 أنماط لعب فريدة لتناسب جميع المستويات
• أكثر من 17 تصنيف للأسئلة الثقافية
• نظام إنجازات ومكافآت يومية
• متجر أدوات مساعدة: حذف نصف الإجابات، تجميد الوقت، تلميحات
• عجلة حظ يومية لربح جوائز مجانية
• نظام محفظة وتحويل عملات بين اللاعبين
• لوحة متصدرين عالمية
• معارك فرق جماعية
• باقات شراء عملات وجواهر عبر متجر هواوي
• إمكانية إضافة أسئلة مخصصة

حمّل الآن واصبح بطل الأسئلة!

### وصف كامل (إنجليزي):
Quiz Champion is an exciting trivia and puzzle game that combines entertainment with learning. Choose from 6 different game modes: Classic, Speed, Survival, Marathon, Daily Challenge, and Team Battles. Compete with friends and climb the leaderboard!

Discover over 17 question categories including: Science, History, Geography, Sports, Arts, Islamic Culture, Technology, Medicine, Literature, Cinema, Music, Nature, Philosophy, Economics, Law, Space, and Languages. Earn achievements, collect daily rewards, and purchase powerful power-ups from the shop.

Game Features:
• 6 unique game modes for all skill levels
• Over 17 trivia question categories
• Achievement system and daily rewards
• Power-up shop: 50/50, freeze time, hints, and more
• Daily lucky wheel for free prizes
• Wallet system with player-to-player transfers
• Global leaderboard
• Team battles
• Coin and gem purchase packs via Huawei AppGallery
• Custom question submission

Download now and become the Quiz Champion!

---

## الملفات المطلوبة للمتجر

### أيقونة التطبيق:
- **الملف:** `public/icon-512.png` (512×512 PNG)
- **ملف إضافي:** `public/icon-1024.png` (1024×1024 PNG)

### صورة العرض (Feature Graphic):
- **الملف:** `public/feature-graphic.png` (1024×500 PNG)

### سياسة الخصوصية:
- **الملف:** `PRIVACY_POLICY.md`
- **الرابط:** https://github.com/yayass3r/quiz-champion-game/blob/main/PRIVACY_POLICY.md

### وصف التطبيق الكامل:
- **الملف:** `app-store-listing.json` (يحتوي على كل الأوصاف والمنتجات)

---

## المتطلبات الأساسية

### 1. حساب المطور في هواوي
- سجّل في [Huawei Developer](https://developer.huawei.com/)
- أكمل التحقق من الهوية
- التسجيل مجاني للأفراد

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
2. حمّل ملف `agconnect-services.json`
3. ضعه في: `android/app/agconnect-services.json`
4. حدث `%HUAWEI_APP_ID%` في `AndroidManifest.xml` بمعرف تطبيقك من AppGallery Connect

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

### بناء تلقائي عبر GitHub Actions:
```bash
git tag v3.4.0
git push origin v3.4.0
```
سيتم بناء APK تلقائياً ورفعه كـ Release على GitHub.

### ملف APK الناتج:
`android/app/build/outputs/apk/release/app-release.apk`

### رفع على AppGallery:
1. اذهب إلى **AppGallery Connect** → تطبيقك
2. انقر على **Version Information** → **New Version**
3. رفع ملف APK الموقع
4. املأ معلومات الإصدار:
   - الإصدار: 3.4.0
   - ملاحظات التحديث: إصلاح شامل + تحسينات الأداء + تهيئة Huawei IAP تلقائية
5. أضف أيقونة التطبيق: `public/icon-512.png` (512×512)
6. أضف صورة العرض: `public/feature-graphic.png` (1024×500)
7. أضف لقطات الشاشة (مطلوب 3-8 لقطات)
8. أضف الوصف بالعربية والإنجليزية (من ملف `app-store-listing.json`)
9. أضف رابط سياسة الخصوصية
10. قدّم للمراجعة

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
- رابط سياسة الخصوصية: مطلوب (PRIVACY_POLICY.md)

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
6. **الأيقونة**: تم تحديث أيقونة التطبيق في جميع الأحجام (mipmap)
