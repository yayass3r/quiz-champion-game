#!/usr/bin/env python3
"""
Huawei AppGallery Connect - Publishing Automation v5.0
======================================================

Supports: Android + HarmonyOS compatibility

This script handles:
1. Authentication with Huawei AppGallery Connect API
2. App deletion (if needed for re-creation)
3. App creation and configuration
4. Upload of APK and app icon
5. Setting distribution countries (Arab countries)
6. Submitting for review

IMPORTANT PREREQUISITE:
The "Harmony Category" MUST be set manually through the Huawei Developer 
Console website BEFORE submitting for review. This cannot be done via API.

Steps to set Harmony Category:
1. Open: https://developer.huawei.com/consumer/en/service/josp/agc/index.html
2. Sign in with your Huawei Developer account
3. Go to "My Apps" → Select "بطل الأسئلة"
4. Go to "Distribute" → "Release app" → "App Information"
5. Set "Harmony Category" to "Android" (NOT HarmonyOS)
6. Save

Usage:
    python3 huawei_publish_v5.py              # Full publish workflow
    python3 huawei_publish_v5.py --check      # Check app status only
    python3 huawei_publish_v5.py --delete     # Delete the app (CAUTION!)
    python3 huawei_publish_v5.py --setup      # Set up app info only
    python3 huawei_publish_v5.py --upload     # Upload APK only
    python3 huawei_publish_v5.py --submit     # Submit for review only
"""

import json, sys, os, time, urllib.request, urllib.parse, ssl, subprocess, argparse

ssl_ctx = ssl.create_default_context()
ssl_ctx.check_hostname = False
ssl_ctx.verify_mode = ssl.CERT_NONE

BASE_URL = "https://connect-api.cloud.huawei.com/api"
OAUTH_URL = f"{BASE_URL}/oauth2/v1/token"

# Configuration
CLIENT_ID = "1952658469957942464"
CLIENT_SECRET = "79597EAFA84F5B65F3ECA6A0DC9E9E550091DF4FB379117C08F41F3EC959024B"
APP_ID = "6917605804441958013"
APK_URL = "https://github.com/yayass3r/quiz-champion-game/releases/latest/download/app-release.apk"
APK_PATH = "/home/z/my-project/download/app-release.apk"
ICON_PATH = "/home/z/my-project/download/app_icon_512.png"

ARABIC_COUNTRIES = ["SA","AE","KW","BH","QA","OM","EG","JO","IQ","LB","MA","DZ","TN","SD","YE","PS"]

# Arabic and English descriptions - Updated for v4.0.0
ARABIC_DESC = """بطل الأسئلة - تحدّى عقلك واربح العملات! 🏆

لعبة ألغاز ممتعة وتفاعلية تضم آلاف الأسئلة في مختلف المجالات! اختبر معلوماتك في التاريخ والعلوم والرياضة والجغرافيا والدين والمزيد.

المميزات الجديدة في الإصدار 4.0:
- 🎯 نظام مستويات الصعوبة: سهل، متوسط، صعب، خبير
- 🪙 خصم عملات عند دخول اللعبة حسب الصعوبة
- 💰 مكافآت مضاعفة: كلما زادت الصعوبة زاد الربح!
- 📉 خصم عملات عند الخسارة (كل مخاطرة لها ثمن!)
- 🎰 عجلة الحظ بـ 50 عملة - جرب حظك!
- 📱 يعمل على Android و HarmonyOS

المميزات الرئيسية:
- آلاف الأسئلة المتنوعة في 17 تصنيف
- أوضاع لعب متعددة: كلاسيكي، سرعة، بقاء، ماراثون
- نظام مكافآت بالعملات والجواهر
- أدوات مساعدة: تلميحات، إزالة إجابات، تخطي
- واجهة عربية سهلة الاستخدام
- تحديثات مستمرة بأسئلة جديدة
- إعلانات بمكافآت لكسب العملات مجاناً
- متجر لشراء الأدوات والأفاتارات
- لوحة متصدرين تنافسية

اصبح بطل الأسئلة الآن واختبر معلوماتك!"""

ENGLISH_DESC = """Quiz Champion - Challenge Your Brain & Win Coins! 🏆

An exciting interactive trivia game with thousands of questions across various categories! Test your knowledge in History, Science, Sports, Geography, Religion and more.

New in v4.0:
- 🎯 Difficulty Levels: Easy, Medium, Hard, Expert
- 🪙 Coin entry fee based on difficulty
- 💰 Multiplied rewards: Higher difficulty = Bigger rewards!
- 📉 Loss penalty: Risk vs Reward!
- 🎰 Lucky Wheel for 50 coins - Try your luck!
- 📱 Works on Android & HarmonyOS

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

class Publisher:
    def __init__(self):
        self.access_token = None
        self.token_expires = 0

    def _log(self, icon, msg): print(f"  {icon} {msg}")

    def get_token(self):
        self._log("[KEY]", "Getting access token...")
        data = json.dumps({"grant_type":"client_credentials","client_id":CLIENT_ID,"client_secret":CLIENT_SECRET}).encode()
        req = urllib.request.Request(OAUTH_URL, data=data, method='POST')
        req.add_header('Content-Type', 'application/json')
        try:
            with urllib.request.urlopen(req, context=ssl_ctx) as resp:
                r = json.loads(resp.read().decode())
                self.access_token = r['access_token']
                self.token_expires = time.time() + r.get('expires_in', 3600) - 60
                self._log("[OK]", f"Token obtained (expires in {r.get('expires_in',3600)}s)")
                return True
        except Exception as e:
            self._log("[FAIL]", f"Failed: {e}")
            return False

    def _api(self, method, endpoint, body=None, headers=None, params=None):
        if not self.access_token or time.time() > self.token_expires:
            if not self.get_token(): return None
        url = f"{BASE_URL}{endpoint}"
        if params: url += "?" + urllib.parse.urlencode(params)
        data = json.dumps(body).encode() if body else None
        req = urllib.request.Request(url, data=data, method=method)
        req.add_header('Authorization', f'Bearer {self.access_token}')
        req.add_header('client_id', CLIENT_ID)
        if data: req.add_header('Content-Type', 'application/json')
        if headers:
            for k,v in headers.items(): req.add_header(k, str(v))
        try:
            with urllib.request.urlopen(req, context=ssl_ctx) as resp:
                return json.loads(resp.read().decode())
        except urllib.error.HTTPError as e:
            try: return json.loads(e.read().decode())
            except: return {"ret":{"code":-1,"msg":f"HTTP {e.code}"}}
        except Exception as e:
            return {"ret":{"code":-1,"msg":str(e)}}

    def delete_app(self):
        """Attempt to delete the app - WARNING: This may not work via API"""
        self._log("[WARN]", "⚠️ Attempting to delete app...")
        self._log("[INFO]", "Note: App deletion typically requires the web console")
        
        # Try the delete endpoint
        r = self._api('DELETE', f'/publish/v2/app/{APP_ID}')
        if r:
            code = r.get('ret',{}).get('code', -1)
            if code == 0:
                self._log("[OK]", "App deleted successfully!")
                return True
            else:
                msg = r.get('ret',{}).get('msg','Unknown error')
                self._log("[FAIL]", f"API delete failed: {msg}")
        
        self._print_delete_instructions()
        return False

    def _print_delete_instructions(self):
        print("\n" + "=" * 70)
        print("  APP DELETION - MANUAL STEPS REQUIRED")
        print("=" * 70)
        print("""
App deletion via API is not supported by Huawei. You must delete it manually:

1. Open: https://developer.huawei.com/consumer/en/service/josp/agc/index.html
2. Sign in with your Huawei Developer account
3. Click "My Apps" → Find "بطل الأسئلة"
4. Go to "Distribute" → "Release app" → "App Information"
5. Scroll to the bottom → Click "Delete app"
   (Only works if the app is NOT under review or released)
6. Confirm deletion

After deletion, create a new app:
1. Click "Create" on the My Apps page
2. Select "Android" as the platform (NOT HarmonyOS)
3. Fill in the app name: بطل الأسئلة
4. Package name: com.quizchampion.game
5. Get the NEW App ID
6. Update the APP_ID in this script

IMPORTANT: If you cannot delete the app:
- Contact Huawei support: https://developer.huawei.com/consumer/en/forum/
- Or simply update the existing app with the new APK (recommended)
""")

    def check_harmony_category(self):
        """Check if the Harmony Category is set by trying to update app info"""
        self._log("[CHECK]", "Checking Harmony Category status...")
        r = self._api('PUT', '/publish/v2/app-info', 
            body={"parentType": 13, "isFree": 1}, 
            params={'appId': APP_ID})
        if r and r.get('ret',{}).get('code') == 0:
            self._log("[OK]", "Harmony Category is set! Proceeding...")
            return True
        elif r and 'harmony category' in str(r.get('ret',{}).get('msg','')).lower():
            self._log("[FAIL]", "Harmony Category is NOT set!")
            self._print_harmony_category_instructions()
            return False
        else:
            msg = r.get('ret',{}).get('msg','?') if r else '?'
            self._log("[WARN]", f"Unknown response: {msg}")
            return True

    def _print_harmony_category_instructions(self):
        print("\n" + "=" * 70)
        print("  HARMONY CATEGORY NOT SET - ACTION REQUIRED")
        print("=" * 70)
        print("""
You need to set the Harmony Category manually via the Huawei Developer Console.

1. Open: https://developer.huawei.com/consumer/en/service/josp/agc/index.html
2. Sign in → "My Apps" → "بطل الأسئلة"
3. "Distribute" → "Release app" → "App Information"
4. Set "Harmony Category" to "Android"
5. Set distribution countries to Arab countries
6. Save

After setting, re-run: python3 huawei_publish_v5.py
""")

    def get_app_info(self):
        self._log("[INFO]", "Getting app info...")
        r = self._api('GET', '/publish/v2/app-info', params={'appid':APP_ID,'lang':'en-US'})
        if r and r.get('ret',{}).get('code')==0:
            info = r.get('appInfo',{})
            langs = r.get('languages',[])
            app_name = langs[0].get('appName','?') if langs else '?'
            self._log("[APP]", f"Name: {app_name}")
            self._log("[STATE]", f"Release State: {info.get('releaseState','?')}")
            self._log("[TYPE]", f"Parent Type: {info.get('parentType','?')}")
            self._log("[FREE]", f"Is Free: {info.get('isFree','?')}")
            return r
        else:
            msg = r.get('ret',{}).get('msg','?') if r else '?'
            self._log("[FAIL]", f"Failed: {msg}")
            return r

    def update_description(self):
        self._log("[DESC]", "Updating English description...")
        r = self._api('PUT', '/publish/v2/app-language-info', body={
            "lang":"en-US",
            "appName":"بطل الأسئلة",
            "briefInfo":"اختبر معلوماتك مع آلاف الأسئلة المتنوعة! نظام صعوبة ومكافآت مضاعفة!",
            "appDesc": ARABIC_DESC + "\n\n" + ENGLISH_DESC
        }, params={'appId':APP_ID})
        if r and r.get('ret',{}).get('code')==0: 
            self._log("[OK]","English description updated")
        else: 
            msg = r.get('ret',{}).get('msg','?') if r else '?'
            self._log("[FAIL]",f"Failed: {msg}")
        
        self._log("[DESC]", "Updating Arabic description...")
        r2 = self._api('PUT', '/publish/v2/app-language-info', body={
            "lang":"ar",
            "appName":"بطل الأسئلة",
            "briefInfo":"اختبر معلوماتك مع آلاف الأسئلة المتنوعة! نظام صعوبة ومكافآت مضاعفة!",
            "appDesc": ARABIC_DESC + "\n\n" + ENGLISH_DESC
        }, params={'appId':APP_ID})
        if r2 and r2.get('ret',{}).get('code')==0: 
            self._log("[OK]","Arabic description updated")
        else: 
            msg = r2.get('ret',{}).get('msg','?') if r2 else '?'
            self._log("[FAIL]",f"Failed: {msg}")

    def set_countries(self):
        self._log("[GLOBE]", f"Setting distribution countries: {', '.join(ARABIC_COUNTRIES)}")
        r = self._api('PUT', '/publish/v2/app-info', body={
            "parentType":13,
            "isFree":1,
            "distCountryCodes":ARABIC_COUNTRIES
        }, params={'appId':APP_ID})
        if r and r.get('ret',{}).get('code')==0: 
            self._log("[OK]","Countries set successfully")
        else:
            msg = r.get('ret',{}).get('msg','?') if r else '?'
            self._log("[FAIL]",f"Failed: {msg}")
            if 'harmony category' in msg.lower():
                self._log("[WARN]","HARMONY CATEGORY NOT SET!")
                self._print_harmony_category_instructions()
        return r

    def upload_icon(self):
        if not os.path.exists(ICON_PATH): 
            self._log("[WARN]","Icon not found, skipping")
            return True
        icon_size = os.path.getsize(ICON_PATH)
        self._log("[ICON]",f"Uploading icon ({icon_size} bytes)...")
        
        obs = self._api('GET','/publish/v2/upload-url/for-obs',
            params={'appId':APP_ID,'fileName':'icon.png','contentLength':str(icon_size),'suffix':'png'})
        if not obs or obs.get('ret',{}).get('code')!=0:
            msg = obs.get('ret',{}).get('msg','?') if obs else '?'
            self._log("[FAIL]",f"OBS URL failed: {msg}")
            return False
        
        url_info = obs.get('urlInfo',{})
        with open(ICON_PATH,'rb') as f: file_data = f.read()
        req = urllib.request.Request(url_info['url'], data=file_data, method='PUT')
        for k,v in url_info.get('headers',{}).items(): req.add_header(k,v)
        try:
            with urllib.request.urlopen(req, context=ssl_ctx) as resp: pass
            self._log("[OK]","Icon uploaded to OBS")
        except Exception as e: 
            self._log("[FAIL]",f"Upload failed: {e}")
            return False
        
        r = self._api('PUT','/publish/v2/app-language-info',
            body={"lang":"en-US","appName":"بطل الأسئلة","icon":url_info['objectId']},
            params={'appId':APP_ID})
        if r and r.get('ret',{}).get('code')==0: 
            self._log("[OK]","Icon linked to app")
        else:
            msg = r.get('ret',{}).get('msg','?') if r else '?'
            self._log("[FAIL]",f"Icon link failed: {msg}")
        return True

    def upload_apk(self):
        # Download latest APK
        self._log("[APK]",f"Downloading APK from: {APK_URL}")
        if not os.path.exists(APK_PATH) or os.path.getsize(APK_PATH) < 100000:
            subprocess.run(['curl','-L','-s','-o',APK_PATH,APK_URL], check=True)
        apk_size = os.path.getsize(APK_PATH)
        self._log("[APK]",f"Uploading APK ({apk_size} bytes)...")
        
        obs = self._api('GET','/publish/v2/upload-url/for-obs',
            params={'appId':APP_ID,'fileName':'app-release.apk','contentLength':str(apk_size),'suffix':'apk'})
        if not obs or obs.get('ret',{}).get('code')!=0:
            msg = obs.get('ret',{}).get('msg','?') if obs else '?'
            self._log("[FAIL]",f"OBS URL failed: {msg}")
            return None, 0
        
        url_info = obs.get('urlInfo',{})
        object_id = url_info.get('objectId')
        self._log("[UP]","Uploading to OBS storage...")
        with open(APK_PATH,'rb') as f: file_data = f.read()
        req = urllib.request.Request(url_info['url'], data=file_data, method='PUT')
        for k,v in url_info.get('headers',{}).items(): req.add_header(k,v)
        try:
            with urllib.request.urlopen(req, context=ssl_ctx) as resp: pass
            self._log("[OK]","APK uploaded via OBS")
            return object_id, apk_size
        except Exception as e: 
            self._log("[FAIL]",f"OBS upload failed: {e}")
            return None, 0

    def update_file_info(self, object_id, size):
        self._log("[FILE]","Updating file info...")
        r = self._api('PUT','/publish/v2/app-file-info',
            body={"fileType":5,"files":[{"fileName":"app-release.apk","fileDestUrl":object_id,"size":size}]},
            params={'appId':APP_ID},
            headers={'releaseType':'1'})
        if r and r.get('ret',{}).get('code')==0: 
            self._log("[OK]","File info updated")
        else:
            msg = r.get('ret',{}).get('msg','?') if r else '?'
            self._log("[FAIL]",f"Failed: {msg}")
        return r

    def update_release_notes(self):
        """Update release notes for the new version"""
        self._log("[NOTES]", "Updating release notes...")
        r = self._api('PUT', '/publish/v2/app-language-info', body={
            "lang": "ar",
            "newFeatures": "🆕 نظام مستويات الصعوبة الجديد!\n🪙 خصم عملات عند دخول اللعبة\n💰 مكافآت مضاعفة حسب الصعوبة\n📉 خصم عند الخسارة\n🎰 عجلة الحظ بـ 50 عملة\n📱 توافق مع HarmonyOS\n\nمستويات الصعوبة:\n🟢 سهل: 10 عملات - مكافأة ×1\n🟡 متوسط: 25 عملة - مكافأة ×1.8\n🔴 صعب: 50 عملة - مكافأة ×3\n💎 خبير: 100 عملة - مكافأة ×5"
        }, params={'appId': APP_ID})
        if r and r.get('ret',{}).get('code') == 0:
            self._log("[OK]", "Release notes updated")
        else:
            msg = r.get('ret',{}).get('msg','?') if r else '?'
            self._log("[FAIL]", f"Failed: {msg}")

    def submit(self):
        self._log("[SEND]","Submitting for review...")
        r = self._api('POST','/publish/v2/app-submit',params={'appid':APP_ID})
        if r and r.get('ret',{}).get('code')==0: 
            self._log("[OK]","Submitted for review!")
        else: 
            msg = r.get('ret',{}).get('msg','?') if r else '?'
            self._log("[FAIL]",f"Failed: {msg}")
        return r

    def check_status(self):
        print("\n" + "="*60)
        print("  Huawei AppGallery - App Status Check v5.0")
        print("  Android + HarmonyOS Compatible")
        print("="*60)
        
        if not self.get_token(): return
        self.get_app_info()
        self.check_harmony_category()
        print("="*60)

    def delete_only(self):
        print("\n" + "="*60)
        print("  Huawei AppGallery - Delete App")
        print("="*60)
        
        if not self.get_token(): return
        self.delete_app()

    def setup_only(self):
        print("\n" + "="*60)
        print("  Huawei AppGallery - App Setup v5.0")
        print("="*60)
        
        if not self.get_token(): return
        
        print("\n--- Step 1: App Info ---")
        self.get_app_info()
        
        print("\n--- Step 2: Harmony Category Check ---")
        if not self.check_harmony_category(): return
        
        print("\n--- Step 3: Description ---")
        self.update_description()
        
        print("\n--- Step 4: Release Notes ---")
        self.update_release_notes()
        
        print("\n--- Step 5: Icon ---")
        self.upload_icon()
        
        print("\n--- Step 6: Countries ---")
        self.set_countries()
        
        print("\n" + "="*60)
        print("  Setup complete! Run with --upload to upload APK")
        print("="*60)

    def upload_only(self):
        print("\n" + "="*60)
        print("  Huawei AppGallery - APK Upload v5.0")
        print("="*60)
        
        if not self.get_token(): return
        
        print("\n--- Uploading APK ---")
        obj_id, size = self.upload_apk()
        if not obj_id:
            print("APK upload failed!")
            return
        
        self.update_file_info(obj_id, size)
        print("\n" + "="*60)
        print("  APK uploaded! Run with --submit to submit for review")
        print("="*60)

    def submit_only(self):
        print("\n" + "="*60)
        print("  Huawei AppGallery - Submit for Review")
        print("="*60)
        if not self.get_token(): return
        self.submit()

    def publish(self):
        print("\n" + "="*60)
        print("  Huawei AppGallery - Publishing v5.0")
        print("  🎮 بطل الأسئلة v4.0.0")
        print("  Android + HarmonyOS Compatible")
        print("="*60)
        
        print("\n--- Step 1: Authentication ---")
        if not self.get_token(): return False
        
        print("\n--- Step 2: App Info ---")
        self.get_app_info()
        
        print("\n--- Step 3: Harmony Category Check ---")
        if not self.check_harmony_category(): return False
        
        print("\n--- Step 4: Description ---")
        self.update_description()
        
        print("\n--- Step 5: Release Notes ---")
        self.update_release_notes()
        
        print("\n--- Step 6: Icon ---")
        self.upload_icon()
        
        print("\n--- Step 7: Countries ---")
        cr = self.set_countries()
        if not cr or cr.get('ret',{}).get('code')!=0:
            print("\n[FAIL] Cannot proceed without setting distribution countries.")
            print("Please set Harmony Category first (see instructions above)")
            return False
        
        print("\n--- Step 8: Upload APK ---")
        obj_id, size = self.upload_apk()
        if not obj_id: return False
        fr = self.update_file_info(obj_id, size)
        if not fr or fr.get('ret',{}).get('code')!=0: return False
        
        print("\n--- Step 9: Submit ---")
        sr = self.submit()
        
        print("\n" + "="*60)
        if sr and sr.get('ret',{}).get('code')==0:
            print("  ✅ APP SUBMITTED FOR REVIEW ON HUAWEI APPGALLERY!")
            print("  Review typically takes 1-3 business days.")
            print("  The app supports both Android and HarmonyOS devices.")
        else:
            print("  ❌ Publishing incomplete - see errors above")
        print("="*60)
        return sr and sr.get('ret',{}).get('code')==0


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Huawei AppGallery Publishing Tool v5.0')
    parser.add_argument('--check', action='store_true', help='Check app status only')
    parser.add_argument('--delete', action='store_true', help='Delete the app (CAUTION!)')
    parser.add_argument('--setup', action='store_true', help='Set up app info only')
    parser.add_argument('--upload', action='store_true', help='Upload APK only')
    parser.add_argument('--submit', action='store_true', help='Submit for review only')
    args = parser.parse_args()
    
    pub = Publisher()
    
    if args.check:
        pub.check_status()
    elif args.delete:
        pub.delete_only()
    elif args.setup:
        pub.setup_only()
    elif args.upload:
        pub.upload_only()
    elif args.submit:
        pub.submit_only()
    else:
        pub.publish()
