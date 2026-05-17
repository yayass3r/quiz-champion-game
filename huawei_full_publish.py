#!/usr/bin/env python3
"""
Huawei AppGallery Connect - Complete Publishing Automation v3.6.0
================================================================

IMPORTANT: The "Harmony Category" MUST be set manually through the Huawei Developer 
Console website before running this script. This is a Huawei requirement that cannot 
be bypassed via the Publishing API.

Steps to set Harmony Category:
1. Open: https://developer.huawei.com/consumer/en/service/josp/agc/index.html
2. Sign in with your Huawei Developer account
3. Go to "My Apps" → Select your app
4. Click "App Information" → Set "Harmony Category" to "Android" (NOT HarmonyOS)
5. Set distribution countries
6. Save

Usage:
    python3 huawei_full_publish.py
"""

import json, sys, os, time, urllib.request, urllib.parse, ssl, subprocess

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

class Publisher:
    def __init__(self):
        self.access_token = None
        self.token_expires = 0

    def _log(self, icon, msg): print(f"  {icon} {msg}")

    def get_token(self):
        self._log("🔑", "Getting access token...")
        data = json.dumps({"grant_type":"client_credentials","client_id":CLIENT_ID,"client_secret":CLIENT_SECRET}).encode()
        req = urllib.request.Request(OAUTH_URL, data=data, method='POST')
        req.add_header('Content-Type', 'application/json')
        try:
            with urllib.request.urlopen(req, context=ssl_ctx) as resp:
                r = json.loads(resp.read().decode())
                self.access_token = r['access_token']
                self.token_expires = time.time() + r.get('expires_in', 3600) - 60
                self._log("✅", f"Token obtained (expires in {r.get('expires_in',3600)}s)")
                return True
        except Exception as e:
            self._log("❌", f"Failed: {e}")
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

    def get_app_info(self):
        self._log("📋", "Getting app info...")
        r = self._api('GET', '/publish/v2/app-info', params={'appid':APP_ID,'lang':'en-US'})
        if r and r.get('ret',{}).get('code')==0:
            info = r.get('appInfo',{})
            langs = r.get('languages',[])
            self._log("📌", f"App: {langs[0].get('appName','?') if langs else '?'}")
            self._log("📌", f"State: {info.get('releaseState','?')}")
        return r

    def update_description(self):
        self._log("📝", "Updating description...")
        r = self._api('PUT', '/publish/v2/app-language-info', body={
            "lang":"en-US","appName":"بطل الأسئلة",
            "briefInfo":"اختبر معلوماتك مع آلاف الأسئلة المتنوعة!",
            "appDesc":"بطل الأسئلة هو تطبيق ألغاز ممتع وتفاعلي يضم آلاف الأسئلة في مختلف المجالات! اختبر معلوماتك في التاريخ والعلوم والرياضة والجغرافيا والمزيد.\n\nالمميزات الرئيسية:\n- آلاف الأسئلة المتنوعة في مختلف المجالات\n- نظام مكافآت بالعملات والنقاط\n- أدوات مساعدة: تلميحات وإزالة إجابات وتخطي الأسئلة\n- واجهة عربية سهلة الاستخدام\n- تحديثات مستمرة بأسئلة جديدة\n- نظام تقدم ومستويات مثير\n- إعلانات بمكافآت لكسب العملات مجاناً\n\nاصبح بطل الأسئلة الآن واختبر معلوماتك!\n\nQuiz Champion is an exciting interactive trivia game! Test your knowledge in History, Science, Sports, Geography and more.\n\nKey Features:\n- Thousands of diverse questions across various categories\n- Reward system with coins and points\n- Helper tools: hints, remove answers, skip questions\n- Easy-to-use Arabic interface\n- Continuous updates with new questions\n- Exciting progression and level system\n- Rewarded ads to earn free coins\n\nBecome the Quiz Champion now!"
        }, params={'appId':APP_ID})
        if r and r.get('ret',{}).get('code')==0: self._log("✅","Description updated")
        else: self._log("❌",f"Failed: {r.get('ret',{}).get('msg','?') if r else '?'}")
        return r

    def set_countries(self, countries):
        self._log("🌍", f"Setting countries: {', '.join(countries)}")
        r = self._api('PUT', '/publish/v2/app-info', body={"parentType":13,"distCountryCodes":countries}, params={'appId':APP_ID})
        if r and r.get('ret',{}).get('code')==0: self._log("✅","Countries set")
        else:
            msg = r.get('ret',{}).get('msg','?') if r else '?'
            self._log("❌",f"Failed: {msg}")
            if 'harmony category' in msg.lower():
                self._log("⚠️","HARMONY CATEGORY NOT SET! Set it at: https://developer.huawei.com/consumer/en/service/josp/agc/index.html")
        return r

    def upload_icon(self):
        if not os.path.exists(ICON_PATH): self._log("⚠️","Icon not found, skipping"); return True
        icon_size = os.path.getsize(ICON_PATH)
        self._log("🖼️",f"Uploading icon ({icon_size} bytes)...")
        obs = self._api('GET','/publish/v2/upload-url/for-obs',params={'appId':APP_ID,'fileName':'icon.png','contentLength':str(icon_size),'suffix':'png'})
        if not obs or obs.get('ret',{}).get('code')!=0:
            self._log("❌",f"OBS URL failed: {obs.get('ret',{}).get('msg','?') if obs else '?'}")
            return False
        url_info = obs.get('urlInfo',{})
        with open(ICON_PATH,'rb') as f: file_data = f.read()
        req = urllib.request.Request(url_info['url'], data=file_data, method='PUT')
        for k,v in url_info.get('headers',{}).items(): req.add_header(k,v)
        try:
            with urllib.request.urlopen(req, context=ssl_ctx) as resp: pass
            self._log("✅","Icon uploaded")
        except Exception as e: self._log("❌",f"Upload failed: {e}"); return False
        r = self._api('PUT','/publish/v2/app-language-info',body={"lang":"en-US","appName":"بطل الأسئلة","icon":url_info['objectId']},params={'appId':APP_ID})
        if r and r.get('ret',{}).get('code')==0: self._log("✅","Icon linked")
        return True

    def upload_apk(self):
        # Download latest APK
        if not os.path.exists(APK_PATH) or os.path.getsize(APK_PATH) < 100000:
            self._log("📦","Downloading APK...")
            subprocess.run(['curl','-L','-s','-o',APK_PATH,APK_URL], check=True)
        apk_size = os.path.getsize(APK_PATH)
        self._log("📦",f"Uploading APK ({apk_size} bytes)...")
        
        # Try OBS flow first
        obs = self._api('GET','/publish/v2/upload-url/for-obs',params={'appId':APP_ID,'fileName':'app-release.apk','contentLength':str(apk_size),'suffix':'apk'})
        if obs and obs.get('ret',{}).get('code')==0:
            url_info = obs.get('urlInfo',{})
            object_id = url_info.get('objectId')
            self._log("📤","Uploading to OBS...")
            with open(APK_PATH,'rb') as f: file_data = f.read()
            req = urllib.request.Request(url_info['url'], data=file_data, method='PUT')
            for k,v in url_info.get('headers',{}).items(): req.add_header(k,v)
            try:
                with urllib.request.urlopen(req, context=ssl_ctx) as resp: pass
                self._log("✅","APK uploaded via OBS")
                return object_id, apk_size
            except Exception as e: self._log("❌",f"OBS upload failed: {e}")
        else:
            msg = obs.get('ret',{}).get('msg','?') if obs else '?'
            self._log("⚠️",f"OBS URL failed: {msg}")
        
        # Fallback to legacy
        self._log("📦","Trying legacy upload...")
        up = self._api('GET','/publish/v2/upload-url',params={'appId':APP_ID,'suffix':'apk'})
        if not up or up.get('ret',{}).get('code')!=0: return None, 0
        result = subprocess.run(['curl','-s','-X','POST',up['uploadUrl'],'-H','Accept: application/json',
            '-F',f'authCode={up["authCode"]}','-F','fileCount=1','-F','parseType=1',
            '-F',f'file=@{APK_PATH}'], capture_output=True, text=True)
        try:
            resp = json.loads(result.stdout)
            fi = resp['result']['UploadFileRsp']['fileInfoList'][0]
            self._log("✅","APK uploaded via legacy")
            return fi.get('fileDestUlr'), fi.get('size',apk_size)
        except: self._log("❌","Legacy upload failed"); return None, 0

    def update_file_info(self, object_id, size):
        self._log("📝","Updating file info...")
        r = self._api('PUT','/publish/v2/app-file-info',body={"fileType":5,"files":[{"fileName":"app-release.apk","fileDestUrl":object_id,"size":size}]},params={'appId':APP_ID},headers={'releaseType':'1'})
        if r and r.get('ret',{}).get('code')==0: self._log("✅","File info updated")
        else:
            msg = r.get('ret',{}).get('msg','?') if r else '?'
            self._log("❌",f"Failed: {msg}")
        return r

    def submit(self):
        self._log("🚀","Submitting for review...")
        r = self._api('POST','/publish/v2/app-submit',params={'appid':APP_ID})
        if r and r.get('ret',{}).get('code')==0: self._log("✅","Submitted for review!")
        else: self._log("❌",f"Failed: {r.get('ret',{}).get('msg','?') if r else '?'}")
        return r

    def publish(self):
        print("="*60)
        print("🚀 Huawei AppGallery - Publishing Workflow v3.6.0")
        print("="*60)
        
        print("\n━━━ Step 1: Auth ━━━")
        if not self.get_token(): return False
        
        print("\n━━━ Step 2: App Info ━━━")
        self.get_app_info()
        
        print("\n━━━ Step 3: Description ━━━")
        self.update_description()
        
        print("\n━━━ Step 4: Icon ━━━")
        self.upload_icon()
        
        print("\n━━━ Step 5: Countries ━━━")
        cr = self.set_countries(ARABIC_COUNTRIES)
        if not cr or cr.get('ret',{}).get('code')!=0:
            print("\n⚠️ HARMONY CATEGORY REQUIRED!")
            print("1. Open: https://developer.huawei.com/consumer/en/service/josp/agc/index.html")
            print("2. Sign in → My Apps → 'بطل الأسئلة'")
            print("3. App Information → Harmony Category → Select 'Android'")
            print("4. Set distribution countries → Save")
            print("5. Re-run this script")
            return False
        
        print("\n━━━ Step 6: Upload APK ━━━")
        obj_id, size = self.upload_apk()
        if not obj_id: return False
        fr = self.update_file_info(obj_id, size)
        if not fr or fr.get('ret',{}).get('code')!=0: return False
        
        print("\n━━━ Step 7: Submit ━━━")
        sr = self.submit()
        
        print("\n" + "="*60)
        if sr and sr.get('ret',{}).get('code')==0:
            print("🎉 APP PUBLISHED ON HUAWEI APPGALLERY!")
        else:
            print("⚠️ Publishing incomplete")
        print("="*60)
        return sr and sr.get('ret',{}).get('code')==0

if __name__ == '__main__':
    Publisher().publish()
