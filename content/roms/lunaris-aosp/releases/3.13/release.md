---
version: "3.13"
release_date: "2026-11-12"
android: "Android 16"
qpr: "QPR2"
build_type:
  - GMS
  - Vanilla
maintainer: "okkotsu"
maintainer_telegram: "https://t.me/okkotsu66"
downloads:
  primary: "https://sourceforge.net/projects/ziti-lunaris-aosp-unofficial/"
  mirror: "https://gofile.io/d/Z4iKiIhq"
  changelog: "https://raw.githubusercontent.com/ziti-resources/OTA/refs/heads/16.2/changelogs/ziti.txt"
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
  - "Sony Dolby blobs with LunarisDolby UI"
  - "IR Remote"
credits:
  - "@pigowtham — base trees"
  - "@Loid_ok — fixes and help"
  - "@GhostRX89 and @JNW_SG — Dolby"
---

## Highlights

- Rebased onto the Android 16 QPR2 sources.
- OTA updater is live again — incremental updates should reach devices on 3.11+.
- no more builtin KernelSU-Next
- Dolby reworked: Sony blobs now driven by the LunarisDolby UI toggle in Sound settings.

## Installation notes

1. Boot into provided recovery 
2. Format data if coming from OxygenOS, another ROM, or a previous major version.
3. Flash the ROM zip, then flash GApps **only if you downloaded the Vanilla build.
4. Reboot, and let the first boot settle for a few minutes.

> Root users: KernelSU Next is not availabe by default flash [ampere kernel](/kernels/ampere/1.1) for ksu.

## Known issues

- Widevine L1 certification may drop to L3.
- OPlus Cam might crash in portrait mode with human subject.
