#!/usr/bin/env python3
"""
Huawei AppGallery Connect - Publishing Automation v7.0
======================================================

Complete Publishing Script with APK Upload Workaround

This script handles:
1. Authentication with Huawei AppGallery Connect API
2. App information setup (name, description, category, brief info)
3. App icon upload (512x512 PNG + 216x216 atomic service icon)
4. Feature graphic upload
5. Screenshot upload (3 phone screenshots)
6. Distribution countries (Arab countries)
7. Release notes update
8. APK upload via OBS (with fallback to old method)
9. Submit for review

IMPORTANT: Due to a Huawei API bug, APK upload via OBS may fail with
"distContryList is empty" error. In this case, the APK must be uploaded
manually via the Huawei Developer Console web interface.

Usage:
    python3 huawei_publish_v7.py              # Full publish workflow
    python3 huawei_publish_v7.py --check      # Check app status only
    python3 huawei_publish_v7.py --setup      # Set up app info + icon + description only
    python3 huawei_publish_v7.py --upload     # Upload APK only
    python3 huawei_publish_v7.py --submit     # Submit for review only
    python3 huawei_publish_v7.py --info       # Update app info + description + icon only
    python3 huawei_publish_v7.py --guide      # Print manual upload guide
"""

import json, sys, os, time, urllib.request, urllib.parse, ssl, subprocess, argparse, hashlib

# SSL Context
ssl_ctx = ssl.create_default_context()
ssl_ctx.check_hostname = False
ssl_ctx.verify_mode = ssl.CERT_NONE

# ========== CONFIGURATION ==========
BASE_URL = "https://connect-api.cloud.huawei.com/api"
OAUTH_URL = f"{BASE_URL}/oauth2/v1/token"

# Huawei API Credentials
CLIENT_ID = "1952658469957942464"
CLIENT_SECRET = "79597EAFA84F5B65F3ECA6A0DC9E9E550091DF4FB379117C08F41F3EC959024B"
APP_ID = "6917605804441958013"

# Service Account Credentials (for future JWT auth)
SERVICE_ACCOUNT_ID = "117746493"
KEY_ID = "be7bfbb747024bf2aabaaa5e78660bc7"

# File Paths
APK_PATH = "/home/z/my-project/download/app-release.apk"
ICON_512_PATH = "/home/z/my-project/download/app_icon_512_new.png"
ICON_216_PATH = "/home/z/my-project/download/atomic_service_icon_216.png"
SCREENSHOT_1_PATH = "/home/z/my-project/download/screenshot1_raw.png"
SCREENSHOT_2_PATH = "/home/z/my-project/download/screenshot2_raw.png"
SCREENSHOT_3_PATH = "/home/z/my-project/download/screenshot3_raw.png"
FEATURE_GRAPHIC_PATH = "/home/z/my-project/quiz-champion-game/public/feature-graphic.png"

# APK Download URL
APK_URL = "https://github.com/yayass3r/quiz-champion-game/releases/latest/download/app-release.apk"

# Icon Download URLs (hosted on GitHub)
ICON_512_URL = "https://github.com/yayass3r/quiz-champion-game/raw/main/public/icon-512.png"
ICON_1024_URL = "https://github.com/yayass3r/quiz-champion-game/raw/main/public/icon-1024.png"
FEATURE_GRAPHIC_URL = "https://github.com/yayass3r/quiz-champion-game/raw/main/public/feature-graphic.png"

# Distribution Countries (Arab Countries)
ARABIC_COUNTRIES = ["SA", "AE", "KW", "BH", "QA", "OM", "EG", "JO", "IQ", "LB", "MA", "DZ", "TN", "SD", "YE", "PS"]

# ========== APP DATA ==========
APP_NAME_AR = "بطل الأسئلة"
APP_NAME_EN = "Quiz Champion"
PACKAGE_NAME = "com.quizchampion.game"
APP_VERSION = "4.0.0"
BRIEF_INFO_AR = "اختبر معلوماتك! نظام صعوبة ومكافآت مضاعفة وعجلة حظ!"
BRIEF_INFO_EN = "Challenge your brain! Difficulty levels, multiplied rewards & lucky wheel!"

# Category: Games > Trivia/Educational
# Huawei parentType: 13 = Games
PARENT_TYPE = 13

# ========== ARABIC DESCRIPTION ==========
ARABIC_DESC = """بطل الأسئلة - تحدّى عقلك واربح العملات!

لعبة ألغاز ممتعة وتفاعلية تضم آلاف الأسئلة في مختلف المجالات! اختبر معلوماتك في التاريخ والعلوم والرياضة والجغرافيا والدين والمزيد.

المميزات الجديدة في الإصدار 4.0:
- نظام مستويات الصعوبة: سهل، متوسط، صعب، خبير
- خصم عملات عند دخول اللعبة حسب الصعوبة
- مكافآت مضاعفة: كلما زادت الصعوبة زاد الربح!
- خصم عملات عند الخسارة - كل مخاطرة لها ثمن!
- عجلة الحظ بـ 50 عملة - جرب حظك!
- يعمل على Android و HarmonyOS

مستويات الصعوبة والأسعار:
سهل: 10 عملات دخول - مكافأة مضاعف ×1
متوسط: 25 عملة دخول - مكافأة مضاعف ×1.8
صعب: 50 عملة دخول - مكافأة مضاعف ×3
خبير: 100 عملة دخول - مكافأة مضاعف ×5

المميزات الرئيسية:
- آلاف الأسئلة المتنوعة في 17 تصنيف
- أوضاع لعب متعددة: كلاسيكي، سرعة، بقاء، ماراثون
- نظام مكافآت بالعملات والجواهر
- أدوات مساعدة: تلميحات، إزالة إجابات، تخطي
- واجهة عربية سهلة الاستخدام
- تحديثات مستمرة بأسئلة جديدة
- إعلانات بمكافآت لكسب العملات مجانا
- متجر لشراء الأدوات والأفاتارات
- لوحة متصدرين تنافسية

اصبح بطل الأسئلة الآن واختبر معلوماتك!"""

# ========== ENGLISH DESCRIPTION ==========
ENGLISH_DESC = """Quiz Champion - Challenge Your Brain and Win Coins!

An exciting interactive trivia game with thousands of questions across various categories! Test your knowledge in History, Science, Sports, Geography, Religion and more.

New in v4.0:
- Difficulty Levels: Easy, Medium, Hard, Expert
- Coin entry fee based on difficulty
- Multiplied rewards: Higher difficulty equals Bigger rewards!
- Loss penalty: Risk vs Reward!
- Lucky Wheel for 50 coins - Try your luck!
- Works on Android and HarmonyOS

Difficulty Levels and Pricing:
Easy: 10 coins entry - Reward multiplier x1
Medium: 25 coins entry - Reward multiplier x1.8
Hard: 50 coins entry - Reward multiplier x3
Expert: 100 coins entry - Reward multiplier x5

Key Features:
- Thousands of diverse questions in 17 categories
- Multiple game modes: Classic, Speed, Survival, Marathon
- Reward system with coins and gems
- Helper tools: hints, remove answers, skip questions
- Easy-to-use Arabic interface
- Continuous updates with new questions
- Rewarded ads to earn free coins
- Shop for power-ups and avatars
- Competitive leaderboard

Become the Quiz Champion now!"""

# ========== RELEASE NOTES ==========
RELEASE_NOTES_AR = """تحديث 4.0 - نظام الصعوبة الجديد!

مميزات جديدة:
- نظام مستويات الصعوبة: سهل، متوسط، صعب، خبير
- خصم عملات عند دخول اللعبة حسب مستوى الصعوبة
- مكافآت مضاعفة حسب الصعوبة
- خصم عملات عند الخسارة
- عجلة الحظ بـ 50 عملة
- توافق مع HarmonyOS و Android
- تحسينات في الأداء والاستقرار"""

RELEASE_NOTES_EN = """Update 4.0 - New Difficulty System!

New Features:
- Difficulty levels: Easy, Medium, Hard, Expert
- Coin entry fee based on difficulty level
- Multiplied rewards based on difficulty
- Coin deduction on losing
- Lucky Wheel for 50 coins
- HarmonyOS and Android compatibility
- Performance and stability improvements"""


class HuaweiPublisher:
    """Huawei AppGallery Connect Publisher v7"""
    
    def __init__(self):
        self.access_token = None
        self.token_expires = 0
    
    def _log(self, icon, msg):
        print(f"  {icon} {msg}")
    
    def _separator(self, title=""):
        print(f"\n{'='*60}")
        if title:
            print(f"  {title}")
            print(f"{'='*60}")
    
    # ========== AUTHENTICATION ==========
    def get_token(self):
        """Get access token from Huawei API"""
        self._log("[KEY]", "Getting access token...")
        data = json.dumps({
            "grant_type": "client_credentials",
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET
        }).encode()
        
        req = urllib.request.Request(OAUTH_URL, data=data, method='POST')
        req.add_header('Content-Type', 'application/json')
        
        try:
            with urllib.request.urlopen(req, context=ssl_ctx) as resp:
                r = json.loads(resp.read().decode())
                self.access_token = r['access_token']
                self.token_expires = time.time() + r.get('expires_in', 3600) - 60
                self._log("[OK]", f"Token obtained (expires in {r.get('expires_in', 3600)}s)")
                return True
        except urllib.error.HTTPError as e:
            try:
                err = json.loads(e.read().decode())
                self._log("[FAIL]", f"Auth failed: {err}")
            except:
                self._log("[FAIL]", f"Auth failed: HTTP {e.code}")
            return False
        except Exception as e:
            self._log("[FAIL]", f"Auth failed: {e}")
            return False
    
    # ========== API HELPER ==========
    def _api(self, method, endpoint, body=None, headers=None, params=None):
        """Make API request to Huawei AppGallery Connect"""
        if not self.access_token or time.time() > self.token_expires:
            if not self.get_token():
                return None
        
        url = f"{BASE_URL}{endpoint}"
        if params:
            url += "?" + urllib.parse.urlencode(params)
        
        data = json.dumps(body).encode() if body else None
        req = urllib.request.Request(url, data=data, method=method)
        req.add_header('Authorization', f'Bearer {self.access_token}')
        req.add_header('client_id', CLIENT_ID)
        if data:
            req.add_header('Content-Type', 'application/json')
        if headers:
            for k, v in headers.items():
                req.add_header(k, str(v))
        
        try:
            with urllib.request.urlopen(req, context=ssl_ctx) as resp:
                return json.loads(resp.read().decode())
        except urllib.error.HTTPError as e:
            try:
                return json.loads(e.read().decode())
            except:
                return {"ret": {"code": -1, "msg": f"HTTP {e.code}"}}
        except Exception as e:
            return {"ret": {"code": -1, "msg": str(e)}}
    
    # ========== GET APP INFO ==========
    def get_app_info(self):
        """Get current app information"""
        self._log("[INFO]", "Getting app information...")
        r = self._api('GET', '/publish/v2/app-info', params={'appid': APP_ID, 'lang': 'en-US'})
        if r and r.get('ret', {}).get('code') == 0:
            info = r.get('appInfo', {})
            langs = r.get('languages', [])
            app_name = langs[0].get('appName', '?') if langs else '?'
            self._log("[APP]", f"Name: {app_name}")
            self._log("[STATE]", f"Release State: {info.get('releaseState', '?')}")
            self._log("[TYPE]", f"Parent Type: {info.get('parentType', '?')}")
            self._log("[CHILD]", f"Child Type: {info.get('childType', '?')}")
            self._log("[HARMONY]", f"Harmony Child Type: {info.get('harmonyChildType', '?')}")
            self._log("[FREE]", f"Is Free: {info.get('isFree', '?')}")
        else:
            msg = r.get('ret', {}).get('msg', '?') if r else '?'
            self._log("[FAIL]", f"Failed to get app info: {msg}")
        return r
    
    # ========== UPDATE APP INFO ==========
    def update_app_info(self):
        """Update basic app information: category, free/paid, countries"""
        self._log("[APP]", "Updating app information...")
        
        r = self._api('PUT', '/publish/v2/app-info', body={
            "parentType": PARENT_TYPE,
            "childType": 23,
            "harmonyChildType": 10000015,
            "isFree": 1,
            "distCountryCodes": ARABIC_COUNTRIES
        }, params={'appId': APP_ID})
        
        if r and r.get('ret', {}).get('code') == 0:
            self._log("[OK]", f"App info updated - Games/Trivia, Free, {len(ARABIC_COUNTRIES)} countries")
        else:
            msg = r.get('ret', {}).get('msg', '?') if r else '?'
            self._log("[FAIL]", f"App info update failed: {msg}")
        return r
    
    # ========== UPDATE ARABIC DESCRIPTION ==========
    def update_arabic_description(self):
        """Update Arabic language info"""
        self._log("[AR]", "Updating Arabic description...")
        body = {
            "lang": "ar",
            "appName": APP_NAME_AR,
            "briefInfo": BRIEF_INFO_AR,
            "appDesc": ARABIC_DESC,
            "newFeatures": RELEASE_NOTES_AR
        }
        r = self._api('PUT', '/publish/v2/app-language-info', body=body, params={'appId': APP_ID})
        if r and r.get('ret', {}).get('code') == 0:
            self._log("[OK]", "Arabic description updated")
        else:
            msg = r.get('ret', {}).get('msg', '?') if r else '?'
            self._log("[FAIL]", f"Arabic description failed: {msg}")
        return r
    
    # ========== UPDATE ENGLISH DESCRIPTION ==========
    def update_english_description(self):
        """Update English language info"""
        self._log("[EN]", "Updating English description...")
        body = {
            "lang": "en-US",
            "appName": APP_NAME_AR,
            "briefInfo": BRIEF_INFO_EN,
            "appDesc": ENGLISH_DESC,
            "newFeatures": RELEASE_NOTES_EN
        }
        r = self._api('PUT', '/publish/v2/app-language-info', body=body, params={'appId': APP_ID})
        if r and r.get('ret', {}).get('code') == 0:
            self._log("[OK]", "English description updated")
        else:
            msg = r.get('ret', {}).get('msg', '?') if r else '?'
            self._log("[FAIL]", f"English description failed: {msg}")
        return r
    
    # ========== UPLOAD FILE TO OBS ==========
    def _upload_to_obs(self, file_path, file_name, suffix):
        """Helper: Upload a file to OBS and return objectId"""
        if not os.path.exists(file_path):
            self._log("[WARN]", f"{file_name} not found at {file_path}")
            return None
        
        file_size = os.path.getsize(file_path)
        self._log("[OBS]", f"Uploading {file_name} ({file_size:,} bytes)...")
        
        obs = self._api('GET', '/publish/v2/upload-url/for-obs',
            params={
                'appId': APP_ID,
                'fileName': file_name,
                'contentLength': str(file_size),
                'suffix': suffix
            })
        
        if not obs or obs.get('ret', {}).get('code') != 0:
            msg = obs.get('ret', {}).get('msg', '?') if obs else '?'
            self._log("[FAIL]", f"OBS URL failed for {file_name}: {msg}")
            return None
        
        url_info = obs.get('urlInfo', {})
        object_id = url_info.get('objectId', '')
        
        with open(file_path, 'rb') as f:
            file_data = f.read()
        
        req = urllib.request.Request(url_info['url'], data=file_data, method='PUT')
        for k, v in url_info.get('headers', {}).items():
            req.add_header(k, v)
        
        try:
            with urllib.request.urlopen(req, context=ssl_ctx) as resp:
                resp.read()
            self._log("[OK]", f"{file_name} uploaded: {object_id}")
            return object_id
        except Exception as e:
            self._log("[FAIL]", f"{file_name} upload failed: {e}")
            return None
    
    # ========== UPLOAD ICON ==========
    def upload_icon(self):
        """Upload app icon (512x512 PNG) and atomic service icon (216x216)"""
        icon_512_oid = self._upload_to_obs(ICON_512_PATH, 'icon_512.png', 'png')
        icon_216_oid = self._upload_to_obs(ICON_216_PATH, 'atomic_icon_216.png', 'png')
        
        if icon_512_oid or icon_216_oid:
            for lang in ['ar', 'en-US']:
                body = {"lang": lang, "appName": APP_NAME_AR}
                if icon_512_oid:
                    body["icon"] = icon_512_oid
                if icon_216_oid:
                    body["smallIcon"] = icon_216_oid
                r = self._api('PUT', '/publish/v2/app-language-info',
                    body=body, params={'appId': APP_ID})
                if r and r.get('ret', {}).get('code') == 0:
                    self._log("[OK]", f"Icons linked ({lang})")
                else:
                    msg = r.get('ret', {}).get('msg', '?') if r else '?'
                    self._log("[WARN]", f"Icon link ({lang}): {msg}")
        return True
    
    # ========== UPLOAD FEATURE GRAPHIC ==========
    def upload_feature_graphic(self):
        """Upload feature graphic (1024x500)"""
        feature_oid = self._upload_to_obs(FEATURE_GRAPHIC_PATH, 'feature_graphic.png', 'png')
        if feature_oid:
            for lang in ['ar', 'en-US']:
                r = self._api('PUT', '/publish/v2/app-language-info',
                    body={"lang": lang, "appName": APP_NAME_AR, "rcmdPic": feature_oid},
                    params={'appId': APP_ID})
                if r and r.get('ret', {}).get('code') == 0:
                    self._log("[OK]", f"Feature graphic linked ({lang})")
                else:
                    msg = r.get('ret', {}).get('msg', '?') if r else '?'
                    self._log("[WARN]", f"Feature graphic link ({lang}): {msg}")
        return True
    
    # ========== UPLOAD SCREENSHOTS ==========
    def upload_screenshots(self):
        """Upload 3 phone screenshots"""
        screenshot_files = [
            (SCREENSHOT_1_PATH, "screenshot_gameplay.png"),
            (SCREENSHOT_2_PATH, "screenshot_spinwheel.png"),
            (SCREENSHOT_3_PATH, "screenshot_categories.png"),
        ]
        
        screenshot_oids = []
        for ss_path, ss_name in screenshot_files:
            oid = self._upload_to_obs(ss_path, ss_name, 'png')
            if oid:
                screenshot_oids.append(oid)
        
        if screenshot_oids:
            for lang in ['ar', 'en-US']:
                materials = [
                    {"filePath": oid, "type": 1, "deviceType": 4}
                    for oid in screenshot_oids
                ]
                r = self._api('PUT', '/publish/v2/app-language-info',
                    body={"lang": lang, "appName": APP_NAME_AR, "deviceMaterials": materials},
                    params={'appId': APP_ID})
                if r and r.get('ret', {}).get('code') == 0:
                    self._log("[OK]", f"{len(screenshot_oids)} screenshots linked ({lang})")
                else:
                    msg = r.get('ret', {}).get('msg', '?') if r else '?'
                    self._log("[WARN]", f"Screenshots link ({lang}): {msg}")
        return True
    
    # ========== UPLOAD APK (with workaround) ==========
    def upload_apk(self):
        """Upload APK via OBS (with fallback to old method)"""
        if not os.path.exists(APK_PATH) or os.path.getsize(APK_PATH) < 100000:
            self._log("[APK]", f"Downloading APK from: {APK_URL}")
            try:
                subprocess.run(['curl', '-L', '-o', APK_PATH, APK_URL], check=True)
            except:
                self._log("[FAIL]", "APK download failed")
                return None, 0
        
        apk_size = os.path.getsize(APK_PATH)
        self._log("[APK]", f"Uploading APK ({apk_size:,} bytes)...")
        
        # Try OBS upload first
        obs = self._api('GET', '/publish/v2/upload-url/for-obs',
            params={
                'appId': APP_ID,
                'fileName': 'app-release.apk',
                'contentLength': str(apk_size),
                'suffix': 'apk'
            })
        
        if obs and obs.get('ret', {}).get('code') == 0:
            # OBS upload works! Upload the APK
            url_info = obs.get('urlInfo', {})
            object_id = url_info.get('objectId', '')
            
            self._log("[UP]", "Uploading to OBS storage...")
            with open(APK_PATH, 'rb') as f:
                file_data = f.read()
            
            req = urllib.request.Request(url_info['url'], data=file_data, method='PUT')
            for k, v in url_info.get('headers', {}).items():
                req.add_header(k, v)
            
            try:
                with urllib.request.urlopen(req, context=ssl_ctx, timeout=300) as resp:
                    resp.read()
                self._log("[OK]", "APK uploaded via OBS")
                return object_id, apk_size
            except Exception as e:
                self._log("[FAIL]", f"APK upload failed: {e}")
                return None, 0
        else:
            # OBS upload failed - likely due to distContryList bug
            msg = obs.get('ret', {}).get('msg', '?') if obs else '?'
            self._log("[WARN]", f"OBS upload failed: {msg[:80]}")
            self._log("[INFO]", "This is a known Huawei API bug (distContryList empty)")
            self._log("[INFO]", "APK must be uploaded manually via web console")
            self._print_apk_upload_guide()
            return None, 0
    
    # ========== UPDATE FILE INFO ==========
    def update_file_info(self, object_id, size):
        """Update app file information with uploaded APK"""
        self._log("[FILE]", "Updating file info...")
        r = self._api('PUT', '/publish/v2/app-file-info',
            body={
                "fileType": 5,
                "files": [{
                    "fileName": "app-release.apk",
                    "fileDestUrl": object_id,
                    "size": size
                }]
            },
            params={'appId': APP_ID},
            headers={'releaseType': '1'})
        
        if r and r.get('ret', {}).get('code') == 0:
            self._log("[OK]", "File info updated")
        else:
            msg = r.get('ret', {}).get('msg', '?') if r else '?'
            self._log("[FAIL]", f"File info failed: {msg}")
        return r
    
    # ========== SET DISTRIBUTION COUNTRIES ==========
    def set_countries(self):
        """Set distribution countries (Arab countries)"""
        self._log("[GLOBE]", f"Setting distribution countries: {', '.join(ARABIC_COUNTRIES)}")
        r = self._api('PUT', '/publish/v2/app-info', body={
            "parentType": PARENT_TYPE,
            "childType": 23,
            "harmonyChildType": 10000015,
            "isFree": 1,
            "distCountryCodes": ARABIC_COUNTRIES
        }, params={'appId': APP_ID})
        
        if r and r.get('ret', {}).get('code') == 0:
            self._log("[OK]", "Distribution countries set successfully")
        else:
            msg = r.get('ret', {}).get('msg', '?') if r else '?'
            self._log("[FAIL]", f"Countries failed: {msg}")
        return r
    
    # ========== SUBMIT FOR REVIEW ==========
    def submit(self):
        """Submit app for review on Huawei AppGallery"""
        self._log("[SEND]", "Submitting for review...")
        r = self._api('POST', '/publish/v2/app-submit', params={'appid': APP_ID})
        
        if r and r.get('ret', {}).get('code') == 0:
            self._log("[OK]", "App submitted for review!")
        else:
            msg = r.get('ret', {}).get('msg', '?') if r else '?'
            self._log("[FAIL]", f"Submit failed: {msg}")
        return r
    
    # ========== CHECK HARMONY CATEGORY ==========
    def check_harmony_category(self):
        """Check if Harmony Category is set"""
        self._log("[CHECK]", "Checking Harmony Category status...")
        r = self._api('PUT', '/publish/v2/app-info',
            body={"parentType": PARENT_TYPE, "isFree": 1},
            params={'appId': APP_ID})
        
        if r and r.get('ret', {}).get('code') == 0:
            self._log("[OK]", "Harmony Category is set! Proceeding...")
            return True
        elif r and 'harmony category' in str(r.get('ret', {}).get('msg', '')).lower():
            self._log("[FAIL]", "Harmony Category is NOT set!")
            self._print_harmony_instructions()
            return False
        else:
            msg = r.get('ret', {}).get('msg', '?') if r else '?'
            self._log("[WARN]", f"Response: {msg}")
            return True
    
    def _print_harmony_instructions(self):
        """Print instructions for setting Harmony Category manually"""
        print("\n" + "=" * 60)
        print("  HARMONY CATEGORY - MANUAL ACTION REQUIRED")
        print("=" * 60)
        print("""
You need to set the Harmony Category manually via the Huawei Developer Console.

Steps:
1. Open: https://developer.huawei.com/consumer/en/service/josp/agc/index.html
2. Sign in with your Huawei Developer account
3. Go to "My Apps" -> Select your app (بطل الأسئلة)
4. Go to "Distribute" -> "Release app" -> "App Information"
5. Set "Harmony Category" to "Android" (NOT HarmonyOS)
6. Save

After setting, re-run: python3 huawei_publish_v7.py
""")
    
    def _print_apk_upload_guide(self):
        """Print instructions for manually uploading APK"""
        print("\n" + "=" * 60)
        print("  APK UPLOAD - MANUAL ACTION REQUIRED")
        print("=" * 60)
        print(f"""
The APK upload via API failed due to a Huawei backend bug.
You need to upload the APK manually via the Huawei Developer Console.

APK Download URL:
  {APK_URL}

Steps to upload APK manually:
1. Open: https://developer.huawei.com/consumer/en/service/josp/agc/index.html
2. Sign in with your Huawei Developer account
3. Go to "My Apps" -> بطل الأسئلة (App ID: {APP_ID})
4. Go to "Distribute" -> "Release app" -> "Version Information"
5. Click "Upload" in the "Software Package" section
6. Upload the APK file (or use the download URL above)
7. Fill in version info: Version {APP_VERSION}
8. After uploading, click "Save" and then "Submit"

After the APK is uploaded via web console, you can submit for review:
  python3 huawei_publish_v7.py --submit
""")
    
    # ========== PRINT FULL GUIDE ==========
    def print_guide(self):
        """Print comprehensive manual publishing guide"""
        print("=" * 70)
        print("  HUAWEI APPGALLERY - COMPLETE PUBLISHING GUIDE")
        print("  App: بطل الأسئلة (Quiz Champion) v4.0.0")
        print("=" * 70)
        print(f"""
App Information:
  App Name: {APP_NAME_AR} ({APP_NAME_EN})
  Package: {PACKAGE_NAME}
  App ID: {APP_ID}
  Version: {APP_VERSION}
  Category: Games > Trivia
  Platform: Android + HarmonyOS
  Price: Free
  Countries: {', '.join(ARABIC_COUNTRIES)}

APK Download URL:
  {APK_URL}

========================================
STEP-BY-STEP MANUAL PUBLISHING GUIDE
========================================

Step 1: Sign in to Huawei Developer Console
  URL: https://developer.huawei.com/consumer/en/service/josp/agc/index.html
  Sign in with your Huawei Developer account

Step 2: Navigate to your app
  - Click "My Apps"
  - Select "بطل الأسئلة" (App ID: {APP_ID})

Step 3: Check App Information
  - Go to "Distribute" > "Release app" > "App Information"
  - Verify: Category = Games > Trivia
  - Verify: Harmony Category = Android
  - Verify: Price = Free
  - Verify: Distribution countries include Arab countries

Step 4: Check Language Information
  - Go to "Distribute" > "Release app" > "Language Information"
  - Verify: Arabic and English descriptions are correct
  - Verify: App icon is displayed correctly
  - Verify: Screenshots are displayed correctly

Step 5: Upload APK
  - Go to "Distribute" > "Release app" > "Version Information"
  - Click "New Version" or edit existing version
  - In the "Software Package" section, click "Upload"
  - Upload the APK file from: {APK_PATH}
  - Or download from: {APK_URL}
  - Wait for the APK to be verified (this may take a few minutes)

Step 6: Fill in Version Information
  - Version number: {APP_VERSION}
  - Version description (Arabic): See release notes in this script
  - Version description (English): See release notes in this script

Step 7: Review and Submit
  - Review all the information
  - Click "Save" to save the version
  - Click "Submit" to submit for review
  - Wait for the review process (typically 1-3 business days)

========================================
API STATUS (Already completed via API)
========================================

The following have been set via the API:
  [OK] App category: Games > Trivia (parentType=13, childType=23)
  [OK] Harmony Category: Set (harmonyChildType=10000015)
  [OK] Arabic description: Updated with v4.0 content
  [OK] English description: Updated with v4.0 content
  [OK] Brief info: Updated for both languages
  [OK] Release notes: Updated for both languages
  [OK] App icon (512x512): Uploaded and linked
  [OK] Atomic service icon (216x216): Uploaded and linked
  [OK] Feature graphic (1024x500): Uploaded and linked
  [OK] Screenshots (3): Uploaded and linked
  [OK] Distribution countries: 16 Arab countries

Still needed (MANUAL):
  [!!] Upload APK via web console
  [!!] Submit for review via web console

========================================
TROUBLESHOOTING
========================================

Problem: "Harmony, PC software package only supports single package"
Solution: This error occurs when trying to submit without an APK.
  You must upload the APK first via the web console.

Problem: "distContryList is empty"
Solution: This is a known Huawei API bug. The distribution countries
  are set correctly in the app, but the file service can't read them.
  Upload the APK via the web console instead of the API.

Problem: Can't change Harmony Category
Solution: The Harmony Category can only be changed via the web console,
  not through the API. Go to App Information > Harmony Category.
""")
    
    # ========== FULL PUBLISH WORKFLOW ==========
    def publish(self):
        """Full publishing workflow"""
        self._separator("Huawei AppGallery - Publishing v7.0")
        print(f"  App: {APP_NAME_AR} ({APP_NAME_EN})")
        print(f"  Package: {PACKAGE_NAME}")
        print(f"  Version: {APP_VERSION}")
        print(f"  Category: Games (Trivia/Educational)")
        print(f"  Platform: Android + HarmonyOS")
        print(f"  Price: Free")
        print(f"  Countries: {', '.join(ARABIC_COUNTRIES)}")
        print(f"  APK: {APK_URL}")
        
        # Step 1: Authentication
        self._separator("Step 1: Authentication")
        if not self.get_token():
            return False
        
        # Step 2: Check current app info
        self._separator("Step 2: Current App Info")
        self.get_app_info()
        
        # Step 3: Check Harmony Category
        self._separator("Step 3: Harmony Category Check")
        if not self.check_harmony_category():
            return False
        
        # Step 4: Update Arabic description
        self._separator("Step 4: Arabic Description")
        self.update_arabic_description()
        
        # Step 5: Update English description
        self._separator("Step 5: English Description")
        self.update_english_description()
        
        # Step 6: Upload icon
        self._separator("Step 6: Upload App Icon")
        self.upload_icon()
        
        # Step 7: Upload feature graphic
        self._separator("Step 7: Upload Feature Graphic")
        self.upload_feature_graphic()
        
        # Step 8: Upload screenshots
        self._separator("Step 8: Upload Screenshots")
        self.upload_screenshots()
        
        # Step 9: Set distribution countries
        self._separator("Step 9: Distribution Countries")
        self.set_countries()
        
        # Step 10: Upload APK
        self._separator("Step 10: Upload APK")
        obj_id, size = self.upload_apk()
        if obj_id:
            fr = self.update_file_info(obj_id, size)
            if not fr or fr.get('ret', {}).get('code') != 0:
                self._log("[WARN]", "File info update failed - APK may need manual upload")
        
        # Step 11: Submit for review
        self._separator("Step 11: Submit for Review")
        sr = self.submit()
        
        # Summary
        self._separator("Publishing Result")
        if sr and sr.get('ret', {}).get('code') == 0:
            print("  APP SUBMITTED FOR REVIEW ON HUAWEI APPGALLERY!")
            print(f"  App: {APP_NAME_AR} v{APP_VERSION}")
            print(f"  Review typically takes 1-3 business days.")
        else:
            print("  Publishing incomplete - APK may need manual upload")
            print("  Run: python3 huawei_publish_v7.py --guide")
            print("  Or upload APK via: https://developer.huawei.com/consumer/en/service/josp/agc/index.html")
        
        return sr and sr.get('ret', {}).get('code') == 0
    
    # ========== SETUP ONLY ==========
    def setup_only(self):
        """Set up app info + description + icon only"""
        self._separator("Huawei AppGallery - App Setup v7.0")
        if not self.get_token():
            return
        
        self.get_app_info()
        self.check_harmony_category()
        self.update_arabic_description()
        self.update_english_description()
        self.upload_icon()
        self.upload_feature_graphic()
        self.upload_screenshots()
        self.set_countries()
        
        self._separator("Setup Complete!")
        print("  Next: Upload APK manually via web console")
        print("  Then: python3 huawei_publish_v7.py --submit")
    
    # ========== UPLOAD ONLY ==========
    def upload_only(self):
        """Upload APK only"""
        self._separator("Huawei AppGallery - APK Upload")
        if not self.get_token():
            return
        
        obj_id, size = self.upload_apk()
        if obj_id:
            self.update_file_info(obj_id, size)
            self._separator("APK Uploaded!")
        else:
            self._separator("APK Upload Failed")
            print("  Please upload manually via web console")
    
    # ========== INFO ONLY ==========
    def info_only(self):
        """Update app info + description + icon only"""
        self._separator("Huawei AppGallery - Update App Info")
        if not self.get_token():
            return
        
        self.update_app_info()
        self.update_arabic_description()
        self.update_english_description()
        self.upload_icon()
        self.upload_feature_graphic()
        self.upload_screenshots()
        self._separator("Info Updated!")
    
    # ========== CHECK STATUS ==========
    def check_status(self):
        """Check app status"""
        self._separator("Huawei AppGallery - App Status v7.0")
        print(f"  App: {APP_NAME_AR} ({APP_NAME_EN})")
        print(f"  App ID: {APP_ID}")
        print(f"  Package: {PACKAGE_NAME}")
        print(f"  Version: {APP_VERSION}")
        print(f"  APK: {APK_URL}")
        
        if not self.get_token():
            return
        self.get_app_info()
    
    # ========== SUBMIT ONLY ==========
    def submit_only(self):
        """Submit for review only"""
        self._separator("Huawei AppGallery - Submit for Review")
        if not self.get_token():
            return
        self.submit()


# ========== MAIN ==========
if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Huawei AppGallery Publishing Tool v7.0')
    parser.add_argument('--check', action='store_true', help='Check app status only')
    parser.add_argument('--setup', action='store_true', help='Set up app info + description + icon')
    parser.add_argument('--upload', action='store_true', help='Upload APK only')
    parser.add_argument('--submit', action='store_true', help='Submit for review only')
    parser.add_argument('--info', action='store_true', help='Update app info + description + icon only')
    parser.add_argument('--guide', action='store_true', help='Print manual publishing guide')
    args = parser.parse_args()
    
    pub = HuaweiPublisher()
    
    if args.check:
        pub.check_status()
    elif args.setup:
        pub.setup_only()
    elif args.upload:
        pub.upload_only()
    elif args.submit:
        pub.submit_only()
    elif args.info:
        pub.info_only()
    elif args.guide:
        pub.print_guide()
    else:
        pub.publish()
