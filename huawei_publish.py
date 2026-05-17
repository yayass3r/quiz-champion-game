#!/usr/bin/env python3
"""
Huawei AppGallery Connect - Publishing Automation Script
=========================================================
This script automates the process of uploading and publishing
an app to Huawei AppGallery Connect.

IMPORTANT: Before using this script, you must:
1. Have a Huawei Developer Account (verified)
2. Create an app in AppGallery Connect console
3. Obtain Publishing API credentials from:
   AppGallery Connect > User and Permissions > Connect API > Team API Key
   (NOT the project-level API client used for IAP/Analytics)
4. Enable the Publishing API for your team

Usage:
  python3 huawei_publish.py --client-id YOUR_PUBLISHING_CLIENT_ID \
                             --client-secret YOUR_PUBLISHING_CLIENT_SECRET \
                             --apk-path /path/to/app-release.apk \
                             --icon-path /path/to/icon-512.png \
                             --action upload

Actions:
  upload     - Upload APK and app information
  submit     - Submit app for review
  status     - Check submission status
  full       - Complete workflow (upload + submit)
"""

import argparse
import hashlib
import json
import os
import sys
import time
from urllib.parse import quote

try:
    import requests
except ImportError:
    print("Installing requests library...")
    os.system(f"{sys.executable} -m pip install requests")
    import requests


# ============================================================
# Configuration
# ============================================================

API_BASE = "https://connect-api.cloud.huawei.com"
OAUTH_URL = "https://oauth-login.cloud.huawei.com/oauth2/v3/token"

APP_CONFIG = {
    "package_name": "com.quizchampion.game",
    "app_name_ar": "بطل الأسئلة",
    "app_name_en": "Quiz Champion",
    "version_name": "3.5.0",
    "version_code": 10,
    "category_id": 401,  # Games > Trivia
    "description_ar": """بطل الأسئلة هي لعبة ألغاز وأسئلة ثقافية ممتعة تجمع بين الترفيه والتعلم. اختر من بين 6 أنماط لعب مختلفة: الكلاسيكي، السريع، البقاء، الماراثون، التحدي اليومي، ومعارك الفرق.

مميزات اللعبة:
• 6 أنماط لعب فريدة لتناسب جميع المستويات
• أكثر من 17 تصنيف للأسئلة الثقافية
• نظام إنجازات ومكافآت يومية
• متجر أدوات مساعدة: حذف نصف الإجابات، تجميد الوقت، تلميحات
• عجلة حظ يومية لربح جوائز مجانية
• نظام محفظة وتحويل عملات بين اللاعبين
• لوحة متصدرين عالمية
• باقات شراء عملات وجواهر عبر متجر هواوي""",
    "description_en": """Quiz Champion is an exciting trivia and puzzle game that combines entertainment with learning. Choose from 6 different game modes: Classic, Speed, Survival, Marathon, Daily Challenge, and Team Battles.

Game Features:
• 6 unique game modes for all skill levels
• Over 17 trivia question categories
• Achievement system and daily rewards
• Power-up shop: 50/50, freeze time, hints, and more
• Daily lucky wheel for free prizes
• Wallet system with player-to-player transfers
• Global leaderboard
• Coin and gem purchase packs via Huawei AppGallery""",
    "short_description_ar": "تحدَّ نفسك في ألغاز متنوعة وأسئلة ثقافية مشوقة! لعبة بطل الأسئلة",
    "short_description_en": "Challenge yourself with diverse puzzles and trivia! Quiz Champion Game",
    "privacy_policy_url": "https://github.com/yayass3r/quiz-champion-game/blob/main/PRIVACY_POLICY.md",
    "age_rating": "3+",
}

# IAP Products Configuration
IAP_PRODUCTS = [
    {
        "productId": "com.quizchampion.starter_pack",
        "name_ar": "باقة المبتدئ",
        "name_en": "Starter Pack",
        "type": 0,  # consumable
        "price_sar": 4.99,
        "description_ar": "500 عملة ذهبية",
        "description_en": "500 Gold Coins",
    },
    {
        "productId": "com.quizchampion.adventurer_pack",
        "name_ar": "باقة المغامر",
        "name_en": "Adventurer Pack",
        "type": 0,
        "price_sar": 9.99,
        "description_ar": "1500 عملة + 5 جواهر",
        "description_en": "1500 Coins + 5 Gems",
    },
    {
        "productId": "com.quizchampion.hero_pack",
        "name_ar": "باقة البطل",
        "name_en": "Hero Pack",
        "type": 0,
        "price_sar": 19.99,
        "description_ar": "3500 عملة + 15 جوهرة",
        "description_en": "3500 Coins + 15 Gems",
    },
    {
        "productId": "com.quizchampion.legend_pack",
        "name_ar": "باقة الأسطورة",
        "name_en": "Legend Pack",
        "type": 0,
        "price_sar": 39.99,
        "description_ar": "8000 عملة + 40 جوهرة",
        "description_en": "8000 Coins + 40 Gems",
    },
    {
        "productId": "com.quizchampion.remove_ads",
        "name_ar": "إزالة الإعلانات",
        "name_en": "Remove Ads",
        "type": 1,  # non-consumable
        "price_sar": 2.99,
        "description_ar": "إزالة دائمة لجميع الإعلانات",
        "description_en": "Permanently remove all ads",
    },
    {
        "productId": "com.quizchampion.vip_monthly",
        "name_ar": "عضوية VIP شهرية",
        "name_en": "VIP Monthly Membership",
        "type": 2,  # subscription
        "price_sar": 4.99,
        "description_ar": "200 عملة + 5 جواهر شهرياً",
        "description_en": "200 Coins + 5 Gems monthly",
    },
]


class HuaweiAppGalleryPublisher:
    """Huawei AppGallery Connect Publishing API Client"""

    def __init__(self, client_id: str, client_secret: str):
        self.client_id = client_id
        self.client_secret = client_secret
        self.access_token = None
        self.token_expires_at = 0

    def _get_token(self) -> str:
        """Get or refresh the access token"""
        if self.access_token and time.time() < self.token_expires_at:
            return self.access_token

        print("[1/7] Getting access token...")
        data = {
            "grant_type": "client_credentials",
            "client_id": self.client_id,
            "client_secret": self.client_secret,
        }
        resp = requests.post(OAUTH_URL, data=data)
        result = resp.json()

        if "access_token" not in result:
            raise Exception(f"Failed to get access token: {result}")

        self.access_token = result["access_token"]
        self.token_expires_at = time.time() + result.get("expires_in", 3600) - 60
        print(f"  ✓ Token obtained (expires in {result.get('expires_in', 3600)}s)")
        return self.access_token

    def _api_headers(self) -> dict:
        """Get API request headers"""
        return {
            "Authorization": f"Bearer {self._get_token()}",
            "client_id": self.client_id,
            "Content-Type": "application/json",
        }

    def _api_request(self, method: str, path: str, **kwargs) -> dict:
        """Make an API request"""
        url = f"{API_BASE}{path}"
        headers = self._api_headers()

        if method == "GET":
            resp = requests.get(url, headers=headers, **kwargs)
        elif method == "POST":
            resp = requests.post(url, headers=headers, **kwargs)
        elif method == "PUT":
            resp = requests.put(url, headers=headers, **kwargs)
        elif method == "DELETE":
            resp = requests.delete(url, headers=headers, **kwargs)
        else:
            raise ValueError(f"Unsupported HTTP method: {method}")

        result = resp.json() if resp.content else {}
        return result

    def get_app_list(self) -> dict:
        """Get list of apps"""
        print("[2/7] Getting app list...")
        result = self._api_request("GET", "/api/publish/v2/app/list", params={"pageNo": 1, "pageSize": 20})
        if result.get("ret", {}).get("code") == 0:
            apps = result.get("appList", [])
            print(f"  ✓ Found {len(apps)} app(s)")
            for app in apps:
                print(f"    - {app.get('key', 'N/A')}: {app.get('title', 'N/A')} ({app.get('pkgName', 'N/A')})")
        else:
            print(f"  ✗ Failed: {result}")
        return result

    def create_app(self) -> dict:
        """Create a new app"""
        print("[3/7] Creating app...")
        data = {
            "pkgName": APP_CONFIG["package_name"],
        }
        result = self._api_request("POST", "/api/publish/v2/app", json=data)
        if result.get("ret", {}).get("code") == 0:
            print(f"  ✓ App created: {result.get('key', 'N/A')}")
        else:
            print(f"  ✗ Failed: {result}")
        return result

    def update_app_info(self, app_id: str) -> dict:
        """Update app information"""
        print("[4/7] Updating app information...")
        data = {
            "lang": "ar-SA",
            "appName": APP_CONFIG["app_name_ar"],
            "appDesc": APP_CONFIG["description_ar"],
            "briefInfo": APP_CONFIG["short_description_ar"],
        }
        result = self._api_request("PUT", f"/api/publish/v2/app/{app_id}/info", json=data)
        if result.get("ret", {}).get("code") == 0:
            print("  ✓ App info updated")
        else:
            print(f"  ✗ Failed: {result}")
        return result

    def upload_file(self, app_id: str, file_path: str, file_type: str = "apk") -> dict:
        """Upload a file (APK or image)"""
        print(f"[5/7] Uploading {file_type.upper()}: {os.path.basename(file_path)}...")

        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")

        # Get upload URL
        result = self._api_request("GET", f"/api/publish/v2/app/{app_id}/release-files/upload-url",
                                   params={"fileType": file_type, "fileName": os.path.basename(file_path)})

        if result.get("ret", {}).get("code") != 0:
            print(f"  ✗ Failed to get upload URL: {result}")
            return result

        upload_url = result.get("uploadUrl", "")
        auth_code = result.get("authCode", "")
        obj_key = result.get("objKey", "")

        # Upload the file
        file_size = os.path.getsize(file_path)
        headers = {
            "Authorization": f"Bearer {self._get_token()}",
            "client_id": self.client_id,
        }

        with open(file_path, "rb") as f:
            files = {"file": (os.path.basename(file_path), f)}
            data = {
                "authCode": auth_code,
                "fileType": file_type,
                "objKey": obj_key,
            }
            resp = requests.post(upload_url, headers=headers, files=files, data=data)
            upload_result = resp.json() if resp.content else {}

        if resp.status_code == 200:
            print(f"  ✓ File uploaded successfully ({file_size / 1024 / 1024:.1f} MB)")
        else:
            print(f"  ✗ Upload failed: {resp.status_code} - {upload_result}")

        return upload_result

    def update_release_info(self, app_id: str, release_id: str) -> dict:
        """Update release information"""
        print("[6/7] Updating release information...")
        data = {
            "releaseId": release_id,
            "releaseType": 1,  # Full update
            "versionName": APP_CONFIG["version_name"],
            "versionCode": APP_CONFIG["version_code"],
        }
        result = self._api_request("PUT", f"/api/publish/v2/app/{app_id}/release/{release_id}",
                                   json=data)
        if result.get("ret", {}).get("code") == 0:
            print("  ✓ Release info updated")
        else:
            print(f"  ✗ Failed: {result}")
        return result

    def submit_for_review(self, app_id: str, release_id: str) -> dict:
        """Submit app for review"""
        print("[7/7] Submitting app for review...")
        data = {
            "releaseId": release_id,
        }
        result = self._api_request("POST", f"/api/publish/v2/app/{app_id}/release/{release_id}/submit",
                                   json=data)
        if result.get("ret", {}).get("code") == 0:
            print("  ✓ App submitted for review!")
            print("  📱 Review typically takes 1-3 business days")
        else:
            print(f"  ✗ Failed: {result}")
        return result

    def check_review_status(self, app_id: str) -> dict:
        """Check app review status"""
        result = self._api_request("GET", f"/api/publish/v2/app/{app_id}/release")
        if result.get("ret", {}).get("code") == 0:
            releases = result.get("releaseList", [])
            for release in releases:
                status = release.get("releaseStatus", "UNKNOWN")
                print(f"  Release {release.get('releaseId')}: {status}")
        else:
            print(f"  ✗ Failed: {result}")
        return result

    def full_publish(self, apk_path: str, icon_path: str = None):
        """Complete publishing workflow"""
        print("=" * 60)
        print("Huawei AppGallery Connect - Publishing Automation")
        print("=" * 60)
        print(f"Package: {APP_CONFIG['package_name']}")
        print(f"Version: {APP_CONFIG['version_name']} ({APP_CONFIG['version_code']})")
        print(f"APK: {apk_path}")
        print("=" * 60)

        try:
            # Step 1: Get token
            self._get_token()

            # Step 2: Get app list
            app_list = self.get_app_list()

            # Step 3: Find or create app
            app_id = None
            for app in app_list.get("appList", []):
                if app.get("pkgName") == APP_CONFIG["package_name"]:
                    app_id = app.get("key")
                    print(f"  Found existing app: {app_id}")
                    break

            if not app_id:
                create_result = self.create_app()
                app_id = create_result.get("key")
                if not app_id:
                    print("ERROR: Could not create or find app")
                    return

            # Step 4: Update app info
            self.update_app_info(app_id)

            # Step 5: Upload APK
            self.upload_file(app_id, apk_path, "apk")

            # Step 6: Upload icon if provided
            if icon_path and os.path.exists(icon_path):
                self.upload_file(app_id, icon_path, "icon")

            print("\n" + "=" * 60)
            print("PUBLISHING COMPLETE!")
            print("=" * 60)
            print(f"App ID: {app_id}")
            print(f"Next steps:")
            print("1. Go to AppGallery Connect console")
            print("2. Complete the app listing (screenshots, feature graphic)")
            print("3. Submit for review")
            print("=" * 60)

        except Exception as e:
            print(f"\nERROR: {e}")
            raise


def main():
    parser = argparse.ArgumentParser(description="Huawei AppGallery Publishing Tool")
    parser.add_argument("--client-id", required=True, help="Publishing API Client ID")
    parser.add_argument("--client-secret", required=True, help="Publishing API Client Secret")
    parser.add_argument("--apk-path", help="Path to APK file")
    parser.add_argument("--icon-path", help="Path to app icon (512x512 PNG)")
    parser.add_argument("--action", choices=["upload", "submit", "status", "full"],
                        default="full", help="Action to perform")
    parser.add_argument("--app-id", help="App ID (for submit/status actions)")

    args = parser.parse_args()

    publisher = HuaweiAppGalleryPublisher(args.client_id, args.client_secret)

    if args.action == "upload":
        if not args.apk_path:
            print("ERROR: --apk-path is required for upload action")
            sys.exit(1)
        publisher.full_publish(args.apk_path, args.icon_path)
    elif args.action == "submit":
        if not args.app_id:
            print("ERROR: --app-id is required for submit action")
            sys.exit(1)
        publisher.submit_for_review(args.app_id, "latest")
    elif args.action == "status":
        if not args.app_id:
            print("ERROR: --app-id is required for status action")
            sys.exit(1)
        publisher.check_review_status(args.app_id)
    elif args.action == "full":
        if not args.apk_path:
            print("ERROR: --apk-path is required for full action")
            sys.exit(1)
        publisher.full_publish(args.apk_path, args.icon_path)


if __name__ == "__main__":
    main()
