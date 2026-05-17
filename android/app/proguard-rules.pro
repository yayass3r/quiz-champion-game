# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Preserve line number information for debugging stack traces.
-keepattributes SourceFile,LineNumberTable

# Hide the original source file name.
-renamesourcefileattribute SourceFile

# Capacitor WebView - keep JavaScript interface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep Capacitor classes
-keep class com.getcapacitor.** { *; }
-keep class com.quizchampion.game.** { *; }

# WebView related
-keepclassmembers class * extends android.webkit.WebViewClient {
    <methods>;
}
-keepclassmembers class * extends android.webkit.WebView {
    public *;
}

# Suppress warnings for WebView
-dontwarn android.webkit.WebView
-dontwarn android.webkit.WebViewClient

# ============================================================
# Huawei HMS Core - IAP
# ============================================================
-keep class com.huawei.hms.iap.** { *; }
-keep class com.huawei.hms.iap.entity.** { *; }
-keep class com.huawei.hms.support.api.client.** { *; }
-keep class com.huawei.hms.support.api.entity.** { *; }

# Huawei HMS Core - Base
-keep class com.huawei.hms.base.** { *; }
-keep class com.huawei.hms.core.** { *; }

# Huawei HMS Core - HWID (Huawei ID)
-keep class com.huawei.hms.hwid.** { *; }
-keep class com.huawei.hms.support.hwid.** { *; }

# Huawei Analytics
-keep class com.huawei.hianalytics.** { *; }
-keep class com.huawei.hms.analytics.** { *; }

# Huawei Push
-keep class com.huawei.hms.push.** { *; }

# Huawei AGConnect
-keep class com.huawei.agconnect.** { *; }
-keep class com.huawei.agconnect.core.** { *; }

# Suppress warnings for Huawei HMS
-dontwarn com.huawei.hms.**
-dontwarn com.huawei.hianalytics.**
-dontwarn com.huawei.android.os.**
-dontwarn android.telephony.HwTelephonyManager
-dontwarn org.bouncycastle.**

# Keep plugin classes
-keep class com.quizchampion.game.plugins.** { *; }

# Keep JSON classes used in IAP
-keepclassmembers class * {
    public static *** valueOf(java.lang.String);
    public static *** values();
}

# Keep IAP product data classes
-keepclassmembers class com.huawei.hms.iap.entity.ProductInfo {
    *;
}
-keepclassmembers class com.huawei.hms.iap.entity.PurchaseResultInfo {
    *;
}

# ============================================================
# Huawei HMS Core - Ads Kit (Petal Ads)
# ============================================================
-keep class com.huawei.hms.ads.** { *; }
-keep class com.huawei.openalliance.ad.** { *; }
-keep class com.huawei.hms.ads.consent.** { *; }
-keep class com.huawei.hms.ads.identifier.** { *; }
-keep class com.huawei.hms.ads.installreferrer.** { *; }

# Keep ad view classes
-keep public class com.huawei.hms.ads.BannerAd {
    public *;
}
-keep public class com.huawei.hms.ads.InterstitialAd {
    public *;
}
-keep public class com.huawei.hms.ads.RewardAd {
    public *;
}
-keep public class com.huawei.hms.ads.NativeAd {
    public *;
}

# Keep ad listener interfaces
-keepclassmembers class * implements com.huawei.hms.ads.rewarded.RewardAdStatusListener {
    *;
}
-keepclassmembers class * implements com.huawei.hms.ads.rewarded.RewardAdLoadListener {
    *;
}
-keepclassmembers class * implements com.huawei.hms.ads.interstitial.InterstitialAdLoadListener {
    *;
}
-keepclassmembers class * implements com.huawei.hms.ads.AdListener {
    *;
}

# Suppress warnings for Huawei Ads
-dontwarn com.huawei.hms.ads.**
-dontwarn com.huawei.openalliance.ad.**
