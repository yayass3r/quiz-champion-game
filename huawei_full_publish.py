#!/usr/bin/env python3
"""
Huawei AppGallery Connect - Complete Publishing Automation
===========================================================

This script automates the complete app publishing workflow to Huawei AppGallery.

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

Then run this script.

Usage:
    python3 huawei_full_publish.py --client-id <ID> --client-secret <KEY> --app-id <APP_ID> --apk <APK_FILE> [--countries SA AE KW ...]
"""

import json
import sys
import os
import time
import argparse
import urllib.request
import urllib.parse
import ssl
import subprocess
from pathlib import Path

ssl_ctx = ssl.create_default_context()
ssl_ctx.check_hostname = False
ssl_ctx.verify_mode = ssl.CERT_NONE

BASE_URL = "https://connect-api.cloud.huawei.com/api"
OAUTH_URL = f"{BASE_URL}/oauth2/v1/token"

# Arabic countries for distribution
ARABIC_COUNTRIES = [
    "SA",  # Saudi Arabia
    "AE",  # United Arab Emirates
    "KW",  # Kuwait
    "BH",  # Bahrain
    "QA",  # Qatar
    "OM",  # Oman
    "EG",  # Egypt
    "JO",  # Jordan
    "IQ",  # Iraq
    "LB",  # Lebanon
    "MA",  # Morocco
    "DZ",  # Algeria
    "TN",  # Tunisia
    "LY",  # Libya
    "SD",  # Sudan
    "YE",  # Yemen
    "PS",  # Palestine
    "SY",  # Syria
    "MR",  # Mauritania
    "DJ",  # Djibouti
    "SO",  # Somalia
    "KM",  # Comoros
]

class HuaweiAppPublisher:
    def __init__(self, client_id, client_secret, app_id):
        self.client_id = client_id
        self.client_secret = client_secret
        self.app_id = app_id
        self.access_token = None
        self.token_expires = 0

    def _log(self, icon, msg):
        print(f"  {icon} {msg}")

    def get_access_token(self):
        """Get OAuth 2.0 access token"""
        self._log("🔑", "Getting access token...")
        data = json.dumps({
            "grant_type": "client_credentials",
            "client_id": self.client_id,
            "client_secret": self.client_secret
        }).encode('utf-8')
        
        req = urllib.request.Request(OAUTH_URL, data=data, method='POST')
        req.add_header('Content-Type', 'application/json')
        req.add_header('cache-control', 'no-cache')
        
        try:
            with urllib.request.urlopen(req, context=ssl_ctx) as resp:
                result = json.loads(resp.read().decode('utf-8'))
                self.access_token = result['access_token']
                self.token_expires = time.time() + result.get('expires_in', 3600) - 60
                self._log("✅", f"Access token obtained (expires in {result.get('expires_in', 3600)}s)")
                return True
        except Exception as e:
            self._log("❌", f"Failed: {e}")
            return False

    def _ensure_token(self):
        if not self.access_token or time.time() > self.token_expires:
            return self.get_access_token()
        return True

    def _api(self, method, endpoint, body=None, extra_headers=None, params=None):
        if not self._ensure_token():
            return None
        url = f"{BASE_URL}{endpoint}"
        if params:
            url += "?" + urllib.parse.urlencode(params)
        data = json.dumps(body).encode('utf-8') if body else None
        req = urllib.request.Request(url, data=data, method=method)
        req.add_header('Authorization', f'Bearer {self.access_token}')
        req.add_header('client_id', self.client_id)
        if data:
            req.add_header('Content-Type', 'application/json')
        if extra_headers:
            for k, v in extra_headers.items():
                req.add_header(k, v)
        try:
            with urllib.request.urlopen(req, context=ssl_ctx) as resp:
                return json.loads(resp.read().decode('utf-8'))
        except urllib.error.HTTPError as e:
            try:
                return json.loads(e.read().decode('utf-8'))
            except:
                return {"ret": {"code": -1, "msg": f"HTTP {e.code}"}}
        except Exception as e:
            return {"ret": {"code": -1, "msg": str(e)}}

    def get_app_info(self):
        self._log("📋", "Getting app information...")
        result = self._api('GET', '/publish/v2/app-info', params={'appid': self.app_id, 'lang': 'en-US'})
        if result and result.get('ret', {}).get('code') == 0:
            info = result.get('appInfo', {})
            langs = result.get('languages', [])
            self._log("📌", f"App Name: {langs[0].get('appName', 'N/A') if langs else 'N/A'}")
            self._log("📌", f"Release State: {info.get('releaseState', 'N/A')}")
            self._log("📌", f"Version ID: {info.get('versionId', 'N/A')}")
        return result

    def set_distribution_countries(self, countries):
        self._log("🌍", f"Setting distribution countries: {', '.join(countries)}")
        result = self._api('PUT', '/publish/v2/app-info', 
                          body={"parentType": 13, "distCountryCodes": countries},
                          params={'appId': self.app_id})
        if result and result.get('ret', {}).get('code') == 0:
            self._log("✅", "Distribution countries set successfully")
        else:
            msg = result.get('ret', {}).get('msg', 'Unknown') if result else 'No response'
            self._log("❌", f"Failed: {msg}")
            if 'harmony category' in msg.lower() or 'category' in msg.lower():
                self._log("⚠️", "HARMONY CATEGORY NOT SET - Manual step required!")
                self._log("📌", "Go to: https://developer.huawei.com/consumer/en/service/josp/agc/index.html")
                self._log("📌", "Select your app → App Information → Set Harmony Category to 'Android'")
        return result

    def update_app_description(self):
        self._log("📝", "Updating app description...")
        result = self._api('PUT', '/publish/v2/app-language-info',
                          body={
                              "lang": "en-US",
                              "appName": "بطل الأسئلة",
                              "briefInfo": "اختبر معلوماتك مع آلاف الأسئلة المتنوعة!",
                              "appDesc": """بطل الأسئلة هو تطبيق ألغاز ممتع وتفاعلي يضم آلاف الأسئلة في مختلف المجالات! اختبر معلوماتك في التاريخ والعلوم والرياضة والجغرافيا والمزيد.

المميزات الرئيسية:
- آلاف الأسئلة المتنوعة في مختلف المجالات
- نظام مكافآت بالعملات والنقاط
- أدوات مساعدة: تلميحات وإزالة إجابات وتخطي الأسئلة
- واجهة عربية سهلة الاستخدام
- تحديثات مستمرة بأسئلة جديدة
- نظام تقدم ومستويات مثير

اصبح بطل الأسئلة الآن واختبر معلوماتك!

Quiz Champion is an exciting interactive trivia game! Test your knowledge in History, Science, Sports, Geography and more.

Key Features:
- Thousands of diverse questions across various categories
- Reward system with coins and points
- Helper tools: hints, remove answers, skip questions
- Easy-to-use Arabic interface
- Continuous updates with new questions
- Exciting progression and level system

Become the Quiz Champion now!"""
                          },
                          params={'appId': self.app_id})
        if result and result.get('ret', {}).get('code') == 0:
            self._log("✅", "App description updated successfully")
        else:
            msg = result.get('ret', {}).get('msg', 'Unknown') if result else 'No response'
            self._log("❌", f"Failed: {msg}")
        return result

    def upload_icon(self, icon_path):
        """Upload app icon via OBS"""
        if not os.path.exists(icon_path):
            self._log("⚠️", f"Icon file not found: {icon_path}, skipping...")
            return True
        
        icon_size = os.path.getsize(icon_path)
        icon_name = os.path.basename(icon_path)
        self._log("🖼️", f"Uploading app icon ({icon_name}, {icon_size} bytes)...")
        
        # Get OBS upload URL for icon
        obs_result = self._api('GET', '/publish/v2/upload-url/for-obs',
                              params={
                                  'appId': self.app_id,
                                  'fileName': icon_name,
                                  'contentLength': str(icon_size),
                                  'suffix': 'png'
                              })
        
        if not obs_result or obs_result.get('ret', {}).get('code') != 0:
            msg = obs_result.get('ret', {}).get('msg', 'Unknown') if obs_result else 'No response'
            self._log("❌", f"Failed to get OBS URL: {msg}")
            return False
        
        url_info = obs_result.get('urlInfo', {})
        object_id = url_info.get('objectId')
        upload_url = url_info.get('url')
        headers = url_info.get('headers', {})
        
        # Upload icon binary data
        with open(icon_path, 'rb') as f:
            file_data = f.read()
        
        req = urllib.request.Request(upload_url, data=file_data, method='PUT')
        for k, v in headers.items():
            req.add_header(k, v)
        
        try:
            with urllib.request.urlopen(req, context=ssl_ctx) as resp:
                self._log("✅", f"Icon uploaded (HTTP {resp.status})")
        except Exception as e:
            self._log("❌", f"Icon upload failed: {e}")
            return False
        
        # Update icon in language info
        self._log("📝", "Updating icon in app information...")
        result = self._api('PUT', '/publish/v2/app-language-info',
                          body={
                              "lang": "en-US",
                              "appName": "بطل الأسئلة",
                              "icon": object_id
                          },
                          params={'appId': self.app_id})
        
        if result and result.get('ret', {}).get('code') == 0:
            self._log("✅", "App icon updated successfully")
        else:
            msg = result.get('ret', {}).get('msg', 'Unknown') if result else 'No response'
            self._log("⚠️", f"Icon update response: {msg}")
        return True

    def upload_apk_obs(self, apk_path):
        """Upload APK via OBS flow (requires distribution countries to be set)"""
        apk_size = os.path.getsize(apk_path)
        apk_name = os.path.basename(apk_path)
        self._log("📦", f"Uploading APK via OBS ({apk_name}, {apk_size} bytes)...")
        
        # Get OBS upload URL for APK
        obs_result = self._api('GET', '/publish/v2/upload-url/for-obs',
                              params={
                                  'appId': self.app_id,
                                  'fileName': apk_name,
                                  'contentLength': str(apk_size),
                                  'suffix': 'apk'
                              })
        
        if not obs_result or obs_result.get('ret', {}).get('code') != 0:
            msg = obs_result.get('ret', {}).get('msg', 'Unknown') if obs_result else 'No response'
            self._log("❌", f"Failed to get OBS URL: {msg}")
            if 'distContryList' in msg:
                self._log("⚠️", "Distribution countries not set! Set them in AppGallery Connect first.")
            return None
        
        url_info = obs_result.get('urlInfo', {})
        object_id = url_info.get('objectId')
        upload_url = url_info.get('url')
        headers = url_info.get('headers', {})
        
        # Upload APK binary data
        self._log("📤", f"Uploading to OBS...")
        with open(apk_path, 'rb') as f:
            file_data = f.read()
        
        req = urllib.request.Request(upload_url, data=file_data, method='PUT')
        for k, v in headers.items():
            req.add_header(k, v)
        
        try:
            with urllib.request.urlopen(req, context=ssl_ctx) as resp:
                self._log("✅", f"APK uploaded via OBS (HTTP {resp.status})")
                return object_id
        except Exception as e:
            self._log("❌", f"APK upload failed: {e}")
            return None

    def upload_apk_legacy(self, apk_path):
        """Upload APK via legacy flow (fallback)"""
        apk_name = os.path.basename(apk_path)
        self._log("📦", f"Uploading APK via legacy flow ({apk_name})...")
        
        # Get legacy upload URL
        upload_result = self._api('GET', '/publish/v2/upload-url',
                                 params={'appId': self.app_id, 'suffix': 'apk'})
        
        if not upload_result or upload_result.get('ret', {}).get('code') != 0:
            msg = upload_result.get('ret', {}).get('msg', 'Unknown') if upload_result else 'No response'
            self._log("❌", f"Failed to get upload URL: {msg}")
            return None
        
        upload_url = upload_result.get('uploadUrl')
        auth_code = upload_result.get('authCode')
        
        # Upload via curl
        result = subprocess.run([
            'curl', '-s', '-X', 'POST', upload_url,
            '-H', 'Accept: application/json',
            '-F', f'authCode={auth_code}',
            '-F', 'fileCount=1',
            '-F', 'parseType=1',
            '-F', f'file=@{apk_path}'
        ], capture_output=True, text=True)
        
        try:
            resp = json.loads(result.stdout)
            if resp.get('result', {}).get('UploadFileRsp', {}).get('ifSuccess') == 1:
                file_info = resp['result']['UploadFileRsp']['fileInfoList'][0]
                self._log("✅", f"APK uploaded via legacy flow")
                return file_info
            else:
                self._log("❌", f"Upload failed: {resp}")
                return None
        except Exception as e:
            self._log("❌", f"Upload failed: {e}")
            return None

    def update_file_info(self, object_id, file_name, file_type=5, release_type=1):
        """Update app file info with objectId"""
        self._log("📝", "Updating app file information...")
        result = self._api('PUT', '/publish/v2/app-file-info',
                          body={
                              "fileType": file_type,
                              "files": [{
                                  "fileName": file_name,
                                  "fileDestUrl": object_id
                              }]
                          },
                          params={'appId': self.app_id},
                          extra_headers={'releaseType': str(release_type)})
        
        if result and result.get('ret', {}).get('code') == 0:
            self._log("✅", "File info updated successfully")
        else:
            code = result.get('ret', {}).get('code', 0) if result else 0
            msg = result.get('ret', {}).get('msg', 'Unknown') if result else 'No response'
            self._log("❌", f"Failed: {msg} (code: {code})")
        return result

    def submit_app(self):
        """Submit app for review"""
        self._log("🚀", "Submitting app for review...")
        result = self._api('POST', '/publish/v2/app-submit',
                          params={'appid': self.app_id})
        if result and result.get('ret', {}).get('code') == 0:
            self._log("✅", "App submitted for review successfully!")
        else:
            msg = result.get('ret', {}).get('msg', 'Unknown') if result else 'No response'
            self._log("❌", f"Failed: {msg}")
        return result

    def publish(self, apk_path, icon_path=None, countries=None):
        """Complete publishing workflow"""
        print("=" * 65)
        print("🚀 Huawei AppGallery Connect - Complete Publishing Workflow")
        print("=" * 65)
        
        # Step 1: Authenticate
        print("\n━━━ Step 1: Authentication ━━━")
        if not self.get_access_token():
            return False
        
        # Step 2: Get app info
        print("\n━━━ Step 2: App Information ━━━")
        self.get_app_info()
        
        # Step 3: Update description
        print("\n━━━ Step 3: Update App Description ━━━")
        self.update_app_description()
        
        # Step 4: Upload icon
        if icon_path:
            print("\n━━━ Step 4: Upload App Icon ━━━")
            self.upload_icon(icon_path)
        
        # Step 5: Set distribution countries
        print("\n━━━ Step 5: Set Distribution Countries ━━━")
        if countries:
            country_result = self.set_distribution_countries(countries)
            if not country_result or country_result.get('ret', {}).get('code') != 0:
                print("\n" + "⚠️" * 30)
                print("MANUAL STEP REQUIRED: Set Harmony Category")
                print("=" * 65)
                print("1. Open: https://developer.huawei.com/consumer/en/service/josp/agc/index.html")
                print("2. Sign in → My Apps → Select 'بطل الأسئلة'")
                print("3. App Information → Harmony Category → Select 'Android'")
                print("4. Set distribution countries")
                print("5. Save and then re-run this script")
                print("=" * 65)
                return False
        
        # Step 6: Upload APK
        print("\n━━━ Step 6: Upload APK ━━━")
        # Try OBS flow first
        object_id = self.upload_apk_obs(apk_path)
        if object_id:
            file_result = self.update_file_info(object_id, os.path.basename(apk_path))
            if not file_result or file_result.get('ret', {}).get('code') != 0:
                return False
        else:
            # Fallback to legacy flow
            self._log("⚠️", "OBS upload failed, trying legacy flow...")
            file_info = self.upload_apk_legacy(apk_path)
            if file_info:
                file_result = self.update_file_info(
                    file_info.get('fileDestUlr', ''),
                    os.path.basename(apk_path),
                    file_type=5
                )
                if not file_result or file_result.get('ret', {}).get('code') != 0:
                    self._log("❌", "Legacy file info update also failed.")
                    self._log("📌", "The legacy upload flow may no longer be supported for app-file-info.")
                    return False
            else:
                return False
        
        # Step 7: Submit for review
        print("\n━━━ Step 7: Submit for Review ━━━")
        submit_result = self.submit_app()
        
        print("\n" + "=" * 65)
        if submit_result and submit_result.get('ret', {}).get('code') == 0:
            print("🎉 APP PUBLISHED SUCCESSFULLY ON HUAWEI APPGALLERY!")
            print(f"   App ID: {self.app_id}")
            print(f"   Package: com.quizchampion.game")
            print(f"   The app has been submitted for review.")
        else:
            print("⚠️  Publishing incomplete - check errors above")
        print("=" * 65)
        
        return submit_result and submit_result.get('ret', {}).get('code') == 0


def main():
    parser = argparse.ArgumentParser(description='Huawei AppGallery Connect - Complete Publishing Tool')
    parser.add_argument('--client-id', required=True, help='API Client ID')
    parser.add_argument('--client-secret', required=True, help='API Client Secret (Key)')
    parser.add_argument('--app-id', required=True, help='App ID')
    parser.add_argument('--apk', required=True, help='Path to APK file')
    parser.add_argument('--icon', default=None, help='Path to app icon PNG (512x512)')
    parser.add_argument('--countries', nargs='+', default=ARABIC_COUNTRIES,
                        help='Distribution country codes (default: all Arabic countries)')
    parser.add_argument('--skip-countries', action='store_true',
                        help='Skip setting distribution countries')
    
    args = parser.parse_args()
    
    if not os.path.exists(args.apk):
        print(f"❌ APK file not found: {args.apk}")
        sys.exit(1)
    
    publisher = HuaweiAppPublisher(args.client_id, args.client_secret, args.app_id)
    countries = None if args.skip_countries else args.countries
    success = publisher.publish(args.apk, args.icon, countries)
    sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()
