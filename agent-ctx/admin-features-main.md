# Task: Add Admin Features for Production Launch

## Summary
Successfully added 5 new admin features to the quiz champion game app for production Google Play launch.

## Changes Made

### 1. `src/lib/game-store.ts`
- Added new fields to `AdminSettings` interface: `minAppVersion`, `forceUpdate`, `maintenanceMode`, `maintenanceMessage`
- Updated default `adminSettings` object with: `minAppVersion: '3.0.0'`, `forceUpdate: false`, `maintenanceMode: false`, `maintenanceMessage: 'صيانة المؤقتة، نعود قريباً!'`

### 2. `src/lib/auth-local.ts`
- Added `resetUserPassword` method to `AuthState` interface
- Implemented `resetUserPassword` function that:
  - Validates user exists and is not admin
  - Validates password length (min 6 chars)
  - Hashes new password using `simpleHash`
  - Updates user in the store

### 3. `src/app/page.tsx`
- **Active Announcements in MainMenu**: Added dismissible announcement cards that show active announcements to all users (not just admin) at the top of the main menu
- **Reset Password in Users Tab**: Added "🔑 كلمة المرور" button for non-admin users with a modal to set a new password
- **App Management in Settings Tab**: Added "📱 إدارة التطبيق" section with:
  - Min App Version input field
  - Force Update toggle
  - Maintenance Mode toggle
  - Maintenance Message text input (visible when maintenance mode is on)
- **Data Import**: Added import button in admin header and bulk tab that accepts .json files and auto-detects whether it contains users or questions data, merging with existing data
- **MaintenanceScreen**: Added full-screen maintenance overlay with wrench animation, maintenance message, and "نعتذر عن الإزعاج" text
- **Maintenance Mode Check**: In Home component, if maintenance mode is on AND user is NOT admin, shows MaintenanceScreen instead of normal content
- Updated announcement info text to indicate announcements are now visible to all users
- Updated settings reset to include new fields
- Added questions export button in bulk tab

## Build Status
✅ Build passed successfully - no errors or warnings (except the inferred workspace root warning which is unrelated)
