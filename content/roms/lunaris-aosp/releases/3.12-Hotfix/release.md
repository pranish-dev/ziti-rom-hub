---
version: "3.12-Hotfix"
release_date: "2026-08-24"
android: "Android 16"
qpr: "QPR2"
build: hotfix
build_type:
  - GMS
  - Vanilla
maintainer: "okkotsu"
downloads:
  primary: "https://sourceforge.net/projects/ghosuto/files/ziti/"
  mirror: "https://gofile.io/d/DOGSp2Rn"
  changelog: "https://raw.githubusercontent.com/Lunaris-AOSP/OTA/refs/heads/16.2/changelogs/ziti.txt"
requirements:
  arb: "Do not downgrade firmware below the level required by this build. Read the warnings first."
warnings:
  - "Users on stock 1301+ builds must follow the migration notes before flashing."
  - "Clean flash is mandatory when coming from OxygenOS or another ROM."
clean_flash: true
backup_required: true
features:
  - "OTA updates pushed through the built-in updater"
  - "SELinux Enforcing"
  - "Signed build"
  - "KernelSU Next v3.3.0 with SusFS v2.2.0"
  - "OPlus Cam"
  - "Sony Dolby blobs with LunarisDolby UI"
  - "IR Remote"
credits:
  - "@pigowtham — base trees"
  - "@Loid_ok — fixes and help"
  - "@GhostRX89"
  - "@JNW_SG — Dolby"
  - "@Gwolf2u and crDroid — KernelSU Next"
---

## Highlights

- Rebased onto the Android 16 QPR2 sources.
- OTA updater is live again — incremental updates should reach devices on 3.11+.
- KernelSU Next updated to **v3.3.0**, paired with **SusFS v2.2.0**.
- Dolby reworked: Sony blobs now driven by the LunarisDolby UI toggle in Sound settings.

## Installation notes

1. Boot into recovery and take a full backup .
2. Format data if coming from OxygenOS, another ROM, or a previous major version.
3. Flash the ROM zip, then flash GApps **only if you downloaded the Vanilla build.
4. Reboot, and let the first boot settle for a few minutes.

> Root users: KernelSU Next is already integrated.

## Known issues

- Widevine L1 certification may drop to L3.
- OPlus Cam might crash in portrait mode with human subject.

