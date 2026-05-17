#!/usr/bin/env python3
"""
Huawei AppGallery Connect - Publishing Automation v4.0
======================================================

This script automates the publishing of the app to Huawei AppGallery.

IMPORTANT PREREQUISITE:
The "Harmony Category" MUST be set manually through the Huawei Developer 
Console website BEFORE running this script. This is a Huawei requirement 
that cannot be bypassed via the Publishing API.

Steps to set Harmony Category:
1. Open: https://developer.huawei.com/consumer/en/service/josp/agc/index.html
2. Sign in with your Huawei Developer account
3. Go to "My Apps" → Select "بطل الأسئلة"
4. Go to "Distribute" → "Release app" → "App Information"
5. Set "Harmony Category" to "Android" (NOT HarmonyOS)
6. Set distribution countries to Arab countries
7. Save

OR to DELETE the app and re-create:
1. Open the app in AppGallery Connect
2. Go to "Distribute" → "Release app" → "App Information"
3. Click "Delete app" at the bottom of the page
   (Note: Apps under review or released cannot be deleted)
4. Create a new app and select "Android" as the platform from the start

Usage:
    python3 huawei_publish_v4.py              # Full publish workflow
    python3 huawei_publish_v4.py --check      # Check app status only
    python3 huawei_publish_v4.py --setup      # Set up app info only
    python3 huawei_publish_v4.py --upload     # Upload APK only
    python3 huawei_publish_v4.py --submit     # Submit for review only
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

# Arabic and English descriptions
ARABIC_DESC = """بطل الأسئلة هو تطبيق ألغاز ممتع وتفاعلي يضم آلاف الأسئلة في مختلف المجالات! اختبر معلوماتك في التاريخ والعلوم والرياضة والجغرافيا والمزيد.

المميزات الرئيسية:
- آلاف الأسئلة المتنوعة في مختلف المجالات
- نظام مكافآت بالعملات والنقاط
- أدوات مساعدة: تلميحات وإزالة إجابات وتخطي الأسئلة
- واجهة عربية سهلة الاستخدام
- تحديثات مستمرة بأسئلة جديدة
- نظام تقدم ومستويات مثير
- إعلانات بمكافآت لكسب العملات مجاناً
- أوضاع لعب متعددة: كلاسيكي، سريع، بقاء، ماراثون
- متجر لشراء الأدوات المساعدة والأفاتارات
- لوحة متصدرين تنافسية

اصبح بطل الأسئلة الآن واختبر معلوماتك!"""

ENGLISH_DESC = """Quiz Champion is an exciting interactive trivia game! Test your knowledge in History, Science, Sports, Geography and more.

Key Features:
- Thousands of diverse questions across various categories
- Reward system with coins and points
- Helper tools: hints, remove answers, skip questions
- Easy-to-use Arabic interface
- Continuous updates with new questions
- Exciting progression and level system
- Rewarded ads to earn free coins
- Multiple game modes: Classic, Speed, Survival, Marathon
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
            # Try to proceed anyway
            return True

    def _print_harmony_category_instructions(self):
        print("\n" + "=" * 70)
        print("  HARMONY CATEGORY NOT SET - ACTION REQUIRED")
        print("=" * 70)
        print("""
You need to set the Harmony Category manually via the Huawei Developer Console.
This CANNOT be done via the API.

OPTION 1 - Set Harmony Category on existing app:
1. Open: https://developer.huawei.com/consumer/en/service/josp/agc/index.html
2. Sign in with your Huawei Developer account
3. Click "My Apps" → Find and click "بطل الأسئلة"
4. Go to "Distribute" tab → "Release app" → "App Information"
5. Look for "Harmony Category" or "Category" dropdown
6. Select "Android" (NOT HarmonyOS/HarmonyOS NEXT)
7. Set distribution countries to Arab countries
8. Click "Save"

OPTION 2 - Delete and re-create the app:
1. Open the app in AppGallery Connect
2. Go to "Distribute" → "Release app" → "App Information"
3. Scroll to the bottom and click "Delete app"
   (Note: Only works if app is not under review or released)
4. Create a new app and select "Android" as the platform
5. Use the new App ID in this script

IMPORTANT NOTES:
- If "Delete app" button is not visible, contact Huawei support:
  https://developer.huawei.com/consumer/en/forum/
- The Harmony Category determines if your app is listed for Android 
  or HarmonyOS devices
- Selecting "Android" ensures your APK works on Huawei Android devices

After setting the Harmony Category, re-run this script:
    python3 huawei_publish_v4.py
""")
        print("=" * 70)

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
        elif r and r.get('ret',{}).get('code') == 204144653:
            self._log("[WARN]", "Language info missing - will be added")
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
            "briefInfo":"اختبر معلوماتك مع آلاف الأسئلة المتنوعة!",
            "appDesc": ARABIC_DESC + "\n\n" + ENGLISH_DESC
        }, params={'appId':APP_ID})
        if r and r.get('ret',{}).get('code')==0: 
            self._log("[OK]","English description updated")
        else: 
            msg = r.get('ret',{}).get('msg','?') if r else '?'
            self._log("[FAIL]",f"Failed: {msg}")
        
        # Also add Arabic language
        self._log("[DESC]", "Updating Arabic description...")
        r2 = self._api('PUT', '/publish/v2/app-language-info', body={
            "lang":"ar",
            "appName":"بطل الأسئلة",
            "briefInfo":"اختبر معلوماتك مع آلاف الأسئلة المتنوعة!",
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
        
        # Get OBS upload URL
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
        
        # Link icon to app language info
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
        if not os.path.exists(APK_PATH) or os.path.getsize(APK_PATH) < 100000:
            self._log("[APK]","Downloading APK...")
            subprocess.run(['curl','-L','-s','-o',APK_PATH,APK_URL], check=True)
        apk_size = os.path.getsize(APK_PATH)
        self._log("[APK]",f"Uploading APK ({apk_size} bytes)...")
        
        # Get OBS upload URL for APK
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
        """Quick status check"""
        print("\n" + "="*60)
        print("  Huawei AppGallery - App Status Check")
        print("="*60)
        
        if not self.get_token(): return
        
        self.get_app_info()
        
        # Check Harmony Category
        self.check_harmony_category()
        
        print("="*60)

    def setup_only(self):
        """Set up app info without uploading APK"""
        print("\n" + "="*60)
        print("  Huawei AppGallery - App Setup")
        print("="*60)
        
        if not self.get_token(): return
        
        print("\n--- Step 1: App Info ---")
        self.get_app_info()
        
        print("\n--- Step 2: Harmony Category Check ---")
        if not self.check_harmony_category():
            return
        
        print("\n--- Step 3: Description ---")
        self.update_description()
        
        print("\n--- Step 4: Icon ---")
        self.upload_icon()
        
        print("\n--- Step 5: Countries ---")
        self.set_countries()
        
        print("\n" + "="*60)
        print("  Setup complete! Run with --upload to upload APK")
        print("="*60)

    def upload_only(self):
        """Upload APK only"""
        print("\n" + "="*60)
        print("  Huawei AppGallery - APK Upload")
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
        """Submit for review only"""
        print("\n" + "="*60)
        print("  Huawei AppGallery - Submit for Review")
        print("="*60)
        
        if not self.get_token(): return
        
        self.submit()
        
        print("="*60)

    def publish(self):
        """Full publishing workflow"""
        print("\n" + "="*60)
        print("  Huawei AppGallery - Publishing Workflow v4.0")
        print("="*60)
        
        print("\n--- Step 1: Authentication ---")
        if not self.get_token(): return False
        
        print("\n--- Step 2: App Info ---")
        self.get_app_info()
        
        print("\n--- Step 3: Harmony Category Check ---")
        if not self.check_harmony_category():
            return False
        
        print("\n--- Step 4: Description ---")
        self.update_description()
        
        print("\n--- Step 5: Icon ---")
        self.upload_icon()
        
        print("\n--- Step 6: Countries ---")
        cr = self.set_countries()
        if not cr or cr.get('ret',{}).get('code')!=0:
            print("\n[FAIL] Cannot proceed without setting distribution countries.")
            print("Please set Harmony Category first (see instructions above)")
            return False
        
        print("\n--- Step 7: Upload APK ---")
        obj_id, size = self.upload_apk()
        if not obj_id: return False
        fr = self.update_file_info(obj_id, size)
        if not fr or fr.get('ret',{}).get('code')!=0: return False
        
        print("\n--- Step 8: Submit ---")
        sr = self.submit()
        
        print("\n" + "="*60)
        if sr and sr.get('ret',{}).get('code')==0:
            print("  APP SUBMITTED FOR REVIEW ON HUAWEI APPGALLERY!")
            print("  Review typically takes 1-3 business days.")
        else:
            print("  Publishing incomplete - see errors above")
        print("="*60)
        return sr and sr.get('ret',{}).get('code')==0


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Huawei AppGallery Publishing Tool v4.0')
    parser.add_argument('--check', action='store_true', help='Check app status only')
    parser.add_argument('--setup', action='store_true', help='Set up app info only')
    parser.add_argument('--upload', action='store_true', help='Upload APK only')
    parser.add_argument('--submit', action='store_true', help='Submit for review only')
    args = parser.parse_args()
    
    pub = Publisher()
    
    if args.check:
        pub.check_status()
    elif args.setup:
        pub.setup_only()
    elif args.upload:
        pub.upload_only()
    elif args.submit:
        pub.submit_only()
    else:
        pub.publish()
