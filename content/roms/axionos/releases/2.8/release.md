---
version: "2.8"
release_date: "2026-08-29"
android: "Android 16"
qpr: "QPR2"
build_type:
  - GMS
maintainer: Arka
maintainer_telegram: "https://t.me/Desplicableguy"
downloads:
  primary: 
  mirror: "https://gofile.io/d/t2Ep5n5E"
  recovery: "https://gofile.io/d/XFdCw66r"
  changelog: 
requirements:
  arb: "Installing Custom rom for first time ? Read warnings before proceeding"
warnings:
  - "Users on stock 1301+ builds must follow the migration notes before flashing."
  - "Clean flash is mandatory when coming from OxygenOS or another ROM."
clean_flash: true
backup_required: true
features:
  - "SELinux Enforcing"
  - "Signed build"
  - "OPlus Cam"
  - "Sony Dolby"
  - "IR Remote"
  - "flashlight strength"
credits:
  - "@pigowtham — base trees"
---


## Installation notes

1. Boot into recovery .
2. Format data if coming from OxygenOS, another ROM, or a previous major version.
3. Flash the ROM zip, then flash GApps **only if you downloaded the Vanilla build.
4. Reboot, and let the first boot settle for a few minutes.

## Known issues

- Widevine L1 certification may drop to L3.
- OPlus Cam might crash in portrait mode with human subject.

