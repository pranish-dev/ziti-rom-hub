---
version: "6.0"
release_date: "2026-08-21"
android: "Android 17"
qpr: "QPR2"
build_type:
  - Vanilla
maintainer: "okkotsu"
maintainer_telegram: "https://t.me/okkotsu66"
downloads:
  primary: "https://sourceforge.net/projects/ziti-voltageos-unofficial/files/"
  mirror: "https://gofile.io/d/pPZHM9bU"
  changelog: "hhttps://raw.githubusercontent.com/ziti-resources/android_vendor_voltageota/refs/heads/16.2/changelog_ziti.txt"
requirements:
  arb: "Installing Custom rom for first time ? Read warnings before proceeding"
warnings:
  - "Users on stock 1301+ builds must follow the migration notes before flashing."
  - "Clean flash is mandatory when coming from OxygenOS or another ROM."
clean_flash: true
backup_required: true
features:
  - "OTA updates pushed through the built-in updater"
  - "SELinux Enforcing"
  - "Signed build"
  - "OPlus Cam"
  - "OnePlus Dolby"
  - "IR Remote"
credits:
  - "@pigowtham — base trees"
  - "@Loid_ok — fixes and help"
  - "Under_Frost — Dolby"
---

## Highlights

- [Sandboxed gapps recommended ](https://t.me/voltageos/93019)

## Installation notes

1. Boot into recovery and take a full backup .
2. Format data if coming from OxygenOS, another ROM, or a previous major version.
3. Flash the ROM zip, then flash GApps **only if you downloaded the Vanilla build.
4. Reboot, and let the first boot settle for a few minutes.


## Known issues

- Widevine L1 certification may drop to L3.
- OPlus Cam might crash in portrait mode with human subject.

