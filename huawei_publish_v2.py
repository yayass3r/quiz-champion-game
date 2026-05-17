#!/usr/bin/env python3
"""
Huawei AppGallery Connect Publishing Script v2
Complete automation for uploading and publishing apps to Huawei AppGallery

Usage:
    python3 huawei_publish_v2.py --client-id <API_CLIENT_ID> --client-secret <API_CLIENT_KEY> --app-id <APP_ID> --apk <APK_FILE>

Required manual step before running:
    1. Go to https://developer.huawei.com/consumer/en/service/josp/agc/index.html
    2. Select your app → App Information → Set Harmony Category
    3. Select "Android" as the Harmony category
    4. Set distribution countries
"""

import json
import sys
import os
import argparse
import urllib.request
import urllib.parse
import ssl
import hashlib
import time
from pathlib import Path

# Disable SSL verification for debugging
ssl_ctx = ssl.create_default_context()
ssl_ctx.check_hostname = False
ssl_ctx.verify_mode = ssl.CERT_NONE

BASE_URL = "https://connect-api.cloud.huawei.com/api"
OAUTH_URL = "https://connect-api.cloud.huawei.com/api/oauth2/v1/token"


class HuaweiPublisher:
    def __init__(self, client_id, client_secret, app_id):
        self.client_id = client_id
        self.client_secret = client_secret
        self.app_id = app_id
        self.access_token = None
        self.token_expires = 0

    def get_access_token(self):
        """Get OAuth 2.0 access token using client credentials"""
        print("🔑 Getting access token...")
        
        data = json.dumps({
            "grant_type": "client_credentials",
            "client_id": self.client_id,
            "client_secret": self.client_secret
        }).encode('utf-8')
        
        req = urllib.request.Request(OAUTH_URL, data=data, method='POST')
        req.add_header('Content-Type', 'application/json')
        req.add_header('cache-control', 'no-cache')
        
        try:
            with urllib.request.urlopen(req, context=ssl_ctx) as response:
                result = json.loads(response.read().decode('utf-8'))
                self.access_token = result['access_token']
                self.token_expires = time.time() + result.get('expires_in', 3600) - 60
                print(f"✅ Access token obtained (expires in {result.get('expires_in', 3600)}s)")
                return True
        except urllib.error.HTTPError as e:
            error_body = e.read().decode('utf-8')
            print(f"❌ Failed to get access token: HTTP {e.code} - {error_body}")
            return False
        except Exception as e:
            print(f"❌ Failed to get access token: {e}")
            return False

    def _api_request(self, method, endpoint, body=None, extra_headers=None, query_params=None):
        """Make an API request with authentication headers"""
        if not self.access_token or time.time() > self.token_expires:
            if not self.get_access_token():
                return None
        
        url = f"{BASE_URL}{endpoint}"
        if query_params:
            url += "?" + urllib.parse.urlencode(query_params)
        
        data = json.dumps(body).encode('utf-8') if body else None
        
        req = urllib.request.Request(url, data=data, method=method)
        req.add_header('Authorization', f'Bearer {self.access_token}')
        req.add_header('client_id', self.client_id)
        req.add_header('Content-Type', 'application/json')
        
        if extra_headers:
            for key, value in extra_headers.items():
                req.add_header(key, value)
        
        try:
            with urllib.request.urlopen(req, context=ssl_ctx) as response:
                return json.loads(response.read().decode('utf-8'))
        except urllib.error.HTTPError as e:
            error_body = e.read().decode('utf-8')
            print(f"❌ API error: HTTP {e.code} - {error_body}")
            return json.loads(error_body) if error_body else None
        except Exception as e:
            print(f"❌ API error: {e}")
            return None

    def get_app_info(self):
        """Get app information"""
        print("📋 Getting app information...")
        result = self._api_request('GET', '/publish/v2/app-info', 
                                   query_params={'appid': self.app_id, 'lang': 'en-US'})
        if result and result.get('ret', {}).get('code') == 0:
            app_info = result.get('appInfo', {})
            print(f"  App Name: {result.get('languages', [{}])[0].get('appName', 'N/A')}")
            print(f"  Release State: {app_info.get('releaseState', 'N/A')}")
            print(f"  Version ID: {app_info.get('versionId', 'N/A')}")
            print(f"  Is Free: {app_info.get('isFree', 'N/A')}")
            return result
        else:
            print(f"❌ Failed to get app info: {result}")
            return result

    def update_app_info(self, update_data):
        """Update app information"""
        print("📝 Updating app information...")
        result = self._api_request('PUT', '/publish/v2/app-info', 
                                   body=update_data,
                                   query_params={'appId': self.app_id})
        if result and result.get('ret', {}).get('code') == 0:
            print("✅ App info updated successfully")
        else:
            error_msg = result.get('ret', {}).get('msg', 'Unknown error') if result else 'No response'
            print(f"❌ Failed to update app info: {error_msg}")
        return result

    def set_distribution_countries(self, countries):
        """Set distribution countries for the app"""
        print(f"🌍 Setting distribution countries: {countries}")
        return self.update_app_info({
            "parentType": 13,
            "distCountryCodes": countries
        })

    def get_upload_url_obs(self, file_name, content_length, suffix='apk'):
        """Get OBS upload URL (new flow)"""
        print(f"📦 Getting OBS upload URL for {file_name}...")
        result = self._api_request('GET', '/publish/v2/upload-url/for-obs',
                                   query_params={
                                       'appId': self.app_id,
                                       'fileName': file_name,
                                       'contentLength': str(content_length),
                                       'suffix': suffix
                                   })
        if result and result.get('ret', {}).get('code') == 0:
            url_info = result.get('urlInfo', {})
            print(f"✅ OBS upload URL obtained")
            print(f"  ObjectId: {url_info.get('objectId', 'N/A')}")
            return result
        else:
            error_msg = result.get('ret', {}).get('msg', 'Unknown error') if result else 'No response'
            print(f"❌ Failed to get OBS upload URL: {error_msg}")
            if 'distContryList is empty' in error_msg:
                print("\n⚠️  DISTRIBUTION COUNTRIES NOT SET!")
                print("   Please set distribution countries first:")
                print("   1. Go to AppGallery Connect → My Apps → your app")
                print("   2. Set Harmony Category (select 'Android')")
                print("   3. Set distribution countries")
                print("   Then run this script again.")
            return result

    def get_upload_url_legacy(self):
        """Get legacy upload URL"""
        print("📦 Getting legacy upload URL...")
        result = self._api_request('GET', '/publish/v2/upload-url',
                                   query_params={
                                       'appId': self.app_id,
                                       'suffix': 'apk'
                                   })
        if result and result.get('ret', {}).get('code') == 0:
            print(f"✅ Legacy upload URL obtained")
            print(f"  Auth Code: {result.get('authCode', 'N/A')[:20]}...")
            return result
        else:
            error_msg = result.get('ret', {}).get('msg', 'Unknown error') if result else 'No response'
            print(f"❌ Failed to get upload URL: {error_msg}")
            return result

    def upload_file_obs(self, apk_path, url_info):
        """Upload file using OBS (new flow)"""
        upload_url = url_info.get('url')
        headers = url_info.get('headers', {})
        object_id = url_info.get('objectId')
        
        print(f"📤 Uploading APK via OBS...")
        print(f"  URL: {upload_url[:50]}...")
        print(f"  ObjectId: {object_id}")
        
        with open(apk_path, 'rb') as f:
            file_data = f.read()
        
        req = urllib.request.Request(upload_url, data=file_data, method='PUT')
        req.add_header('Content-Type', 'application/octet-stream')
        for key, value in headers.items():
            req.add_header(key, value)
        
        try:
            with urllib.request.urlopen(req, context=ssl_ctx) as response:
                print(f"✅ APK uploaded via OBS (HTTP {response.status})")
                return object_id
        except urllib.error.HTTPError as e:
            error_body = e.read().decode('utf-8')
            print(f"❌ OBS upload failed: HTTP {e.code} - {error_body}")
            return None
        except Exception as e:
            print(f"❌ OBS upload failed: {e}")
            return None

    def upload_file_legacy(self, apk_path, upload_url, auth_code):
        """Upload file using legacy flow"""
        print(f"📤 Uploading APK via legacy flow...")
        
        import subprocess
        result = subprocess.run([
            'curl', '-s', '-X', 'POST', upload_url,
            '-H', 'Accept: application/json',
            '-F', f'authCode={auth_code}',
            '-F', 'fileCount=1',
            '-F', 'parseType=1',
            '-F', f'file=@{apk_path}'
        ], capture_output=True, text=True)
        
        try:
            response = json.loads(result.stdout)
            if response.get('result', {}).get('UploadFileRsp', {}).get('ifSuccess') == 1:
                file_info = response['result']['UploadFileRsp']['fileInfoList'][0]
                print(f"✅ APK uploaded via legacy flow")
                print(f"  File size: {file_info.get('size', 'N/A')} bytes")
                return file_info
            else:
                print(f"❌ Upload failed: {response}")
                return None
        except Exception as e:
            print(f"❌ Upload failed: {e}")
            return None

    def update_file_info(self, file_type, files, release_type=1):
        """Update app file information"""
        print("📝 Updating app file information...")
        result = self._api_request('PUT', '/publish/v2/app-file-info',
                                   body={
                                       "fileType": file_type,
                                       "files": files
                                   },
                                   query_params={'appId': self.app_id},
                                   extra_headers={'releaseType': str(release_type)})
        if result and result.get('ret', {}).get('code') == 0:
            print("✅ App file info updated successfully")
        else:
            error_msg = result.get('ret', {}).get('msg', 'Unknown error') if result else 'No response'
            error_code = result.get('ret', {}).get('code', 0) if result else 0
            print(f"❌ Failed to update file info: {error_msg} (code: {error_code})")
            if error_code == 204144641:
                print("\n⚠️  OBJECTID FORMAT ERROR!")
                print("   This error means the fileDestUrl must be an objectId from the OBS upload flow,")
                print("   not a full URL from the legacy upload flow.")
                print("   Use the OBS upload flow instead (--use-obs flag).")
        return result

    def submit_app(self):
        """Submit app for review"""
        print("🚀 Submitting app for review...")
        result = self._api_request('POST', '/publish/v2/app-submit',
                                   query_params={'appid': self.app_id})
        if result and result.get('ret', {}).get('code') == 0:
            print("✅ App submitted for review successfully!")
        else:
            error_msg = result.get('ret', {}).get('msg', 'Unknown error') if result else 'No response'
            print(f"❌ Failed to submit app: {error_msg}")
        return result

    def publish(self, apk_path, countries=None, use_obs=True):
        """Complete publishing workflow"""
        print("=" * 60)
        print("🚀 Huawei AppGallery Connect Publishing Workflow")
        print("=" * 60)
        
        # Step 1: Authenticate
        if not self.get_access_token():
            return False
        
        # Step 2: Get app info
        print("\n--- Step 2: App Information ---")
        app_info = self.get_app_info()
        if not app_info:
            return False
        
        # Step 3: Set distribution countries if provided
        if countries:
            print("\n--- Step 3: Set Distribution Countries ---")
            country_result = self.set_distribution_countries(countries)
            if country_result and country_result.get('ret', {}).get('code') != 0:
                error_msg = country_result.get('ret', {}).get('msg', '')
                if 'harmony category' in error_msg.lower() or 'category' in error_msg.lower():
                    print("\n⚠️  HARMONY CATEGORY NOT SET - MANUAL STEP REQUIRED!")
                    print("=" * 60)
                    print("Please complete these steps on the Huawei Developer Console:")
                    print()
                    print("1. Open: https://developer.huawei.com/consumer/en/service/josp/agc/index.html")
                    print("2. Sign in with your Huawei Developer account")
                    print("3. Go to 'My Apps' → Select 'بطل الأسئلة' (Quiz Champion)")
                    print("4. In 'App Information', set the Harmony Category:")
                    print("   - Select 'Android' (not HarmonyOS)")
                    print("5. Set distribution countries (e.g., Saudi Arabia, UAE, etc.)")
                    print("6. Save the changes")
                    print()
                    print("After completing these steps, run this script again.")
                    print("=" * 60)
                    return False
        
        # Step 4: Get file size
        apk_size = os.path.getsize(apk_path)
        apk_name = os.path.basename(apk_path)
        
        # Step 5: Upload APK
        print(f"\n--- Step 4: Upload APK ({apk_name}, {apk_size} bytes) ---")
        
        if use_obs:
            # New OBS upload flow
            obs_result = self.get_upload_url_obs(apk_name, apk_size)
            if not obs_result or obs_result.get('ret', {}).get('code') != 0:
                print("\n⚠️  OBS upload failed. Trying legacy upload flow...")
                use_obs = False
            else:
                url_info = obs_result.get('urlInfo', {})
                object_id = self.upload_file_obs(apk_path, url_info)
                if object_id:
                    # Step 6: Update file info with objectId
                    print("\n--- Step 5: Update File Info ---")
                    file_result = self.update_file_info(5, [{
                        "fileName": apk_name,
                        "fileDestUrl": object_id
                    }])
                    if not file_result or file_result.get('ret', {}).get('code') != 0:
                        return False
                else:
                    return False
        
        if not use_obs:
            # Legacy upload flow
            upload_result = self.get_upload_url_legacy()
            if not upload_result or upload_result.get('ret', {}).get('code') != 0:
                return False
            
            upload_url = upload_result.get('uploadUrl')
            auth_code = upload_result.get('authCode')
            
            file_info = self.upload_file_legacy(apk_path, upload_url, auth_code)
            if file_info:
                file_dest_url = file_info.get('fileDestUlr', '')
                print(f"  File URL: {file_dest_url[:50]}...")
                
                print("\n--- Step 5: Update File Info ---")
                file_result = self.update_file_info(5, [{
                    "fileName": apk_name,
                    "fileDestUrl": file_dest_url,
                    "size": file_info.get('size', apk_size)
                }])
                if not file_result or file_result.get('ret', {}).get('code') != 0:
                    print("\n⚠️  Legacy file info update failed.")
                    print("   The legacy upload flow may no longer be supported.")
                    print("   Please set Harmony Category on the Huawei Developer Console first,")
                    print("   then use the OBS upload flow.")
                    return False
            else:
                return False
        
        # Step 7: Submit for review
        print("\n--- Step 6: Submit for Review ---")
        submit_result = self.submit_app()
        
        print("\n" + "=" * 60)
        if submit_result and submit_result.get('ret', {}).get('code') == 0:
            print("🎉 APP PUBLISHED SUCCESSFULLY!")
            print(f"   App ID: {self.app_id}")
            print(f"   Package: com.quizchampion.game")
            print(f"   The app has been submitted for review.")
        else:
            print("⚠️  Publishing incomplete - please check the errors above")
        print("=" * 60)
        
        return submit_result and submit_result.get('ret', {}).get('code') == 0


def main():
    parser = argparse.ArgumentParser(description='Huawei AppGallery Connect Publishing Tool')
    parser.add_argument('--client-id', required=True, help='API Client ID')
    parser.add_argument('--client-secret', required=True, help='API Client Secret (Key)')
    parser.add_argument('--app-id', required=True, help='App ID in Huawei AppGallery')
    parser.add_argument('--apk', required=True, help='Path to APK file')
    parser.add_argument('--countries', nargs='+', default=['SA', 'AE', 'KW', 'BH', 'QA', 'OM'],
                        help='Distribution country codes')
    parser.add_argument('--use-obs', action='store_true', default=True,
                        help='Use OBS upload flow (recommended)')
    parser.add_argument('--submit', action='store_true', default=False,
                        help='Automatically submit for review after upload')
    
    args = parser.parse_args()
    
    if not os.path.exists(args.apk):
        print(f"❌ APK file not found: {args.apk}")
        sys.exit(1)
    
    publisher = HuaweiPublisher(args.client_id, args.client_secret, args.app_id)
    success = publisher.publish(args.apk, args.countries, args.use_obs)
    
    sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()
