---
version: "23.2"
release_date: "2026-06-24"
android: "Android 16"
qpr: "QPR1"
build_type:
  - Vanilla
maintainer: "pjgowtham"
downloads:
  primary: "https://github.com/pjgowtham/android_device_oneplus_ziti/releases/download/lineage-23.2-20260624-UNOFFICIAL-ziti/lineage-23.2-20260624-UNOFFICIAL-ziti.zip/"
  mirror: 
  changelog: 
requirements:
  arb: "Do not downgrade firmware below the level required by this build. Read the warnings first."
warnings:
  - "Users on stock 1301+ builds must follow the migration notes before flashing."
  - "Clean flash is mandatory when coming from OxygenOS or another ROM."
clean_flash: true
backup_required: true
credits:
  - "@pigowtham — base trees"
---

## Highlights
- [Recovery](https://github.com/pjgowtham/android_device_oneplus_ziti/releases/tag/lineage-23.2-20260624-UNOFFICIAL-ziti)
- [Recommended Gapps](https://github.com/MindTheGapps/16.0.0-arm64/releases/tag/MindTheGapps-16.0.0-arm64-20250709_200551)

## Installation notes

1. Boot into recovery .
2. Format data if coming from OxygenOS, another ROM, or a previous major version.
3. Flash the ROM zip, then flash GApps **only if you downloaded the Vanilla build.
4. Reboot, and let the first boot settle for a few minutes.


## Known issues

- Widevine L1 certification may drop to L3.

