---
version: "6.0 Official"
release_date: "2026-08-30"
android: "Android 17"
qpr: "Initial"
build_type:
  - Vanilla
maintainer: "okkotsu"
maintainer_telegram: "https://t.me/okkotsu66"
downloads:
  primary: "https://sourceforge.net/projects/voltage-os/files/ziti"
  mirror: "https://gofile.io/d/NzTx3e0K"
  changelog: "https://raw.githubusercontent.com/VoltageOS/android_vendor_voltageota/e4d2e4cbc0040c74d25fd856c092da27a45d1376/changelog_ziti.txt"
  recovery: "https://gofile.io/d/aO4deUFP"
requirements:
  arb: "Installing Custom rom for first time ? Read warnings before proceeding"
warnings:
  - "Users on stock 1301+ builds must follow the migration notes before flashing."
  - "Clean flash is mandatory when coming from OxygenOS or another ROM."
clean_flash: true
backup_required: true
features:
  - "OTA pushed"
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

1. Boot into recovery(used linked recovery) and take a full backup .
2. Format data if coming from OxygenOS, another ROM, or a previous major version.
3. Flash the ROM zip, then flash GApps **only if you downloaded the Vanilla build.
4. Reboot, and let the first boot settle for a few minutes.


## Known issues

- Widevine L1 certification may drop to L3.
- OPlus Cam might crash in portrait mode with human subject.

