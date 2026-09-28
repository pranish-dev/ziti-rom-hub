---
version: "12.2"
release_date: "2026-09-28"
android: "Android 17"
qpr: "QPR0"
build_type:
  - GMS
  - Vanilla
maintainer: "loid_ok"
maintainer_telegram: "https://t.me/loid_ok"
downloads:
  primary: "https://sourceforge.net/projects/evox-unofficial-ziti/files/Release/"
  mirror: "https://pixeldrain.com/u/kJown53Z"
  changelog: "https://raw.githubusercontent.com/anchalsehrawat/Evox_OTA/refs/heads/cnb/changelogs/ziti.txt"
  recovery: "https://sourceforge.net/projects/evox-unofficial-ziti/files/Recovery/evox_ziti_recovery-unofficialA17-20260920.zip/download"
requirements:
  arb: "Installing Custom rom for first time ? Read warnings before proceeding"
warnings:
  - "Users on stock 1301+ builds must follow the migration notes before flashing."
  - "Clean flash is mandatory when coming from OxygenOS or another ROM."
clean_flash: true
backup_required: true
features:
  - "Signed build"
  - "Source Side Changes"
  - "Dolby included"
  - "OPcam with 2x zoom fixes"
  - "Gcam fix for A17, Powerhint optimised by okkotsu"
  - "IR Remote"
credits:
  - "@pigowtham — base trees"
  - "@okkotsu — all this work"
  - "@Arka - For Server"
---
## Installation notes

1. Boot into recovery .
2. Format data if coming from OxygenOS, another ROM, or a previous major version.
3. Flash the ROM zip, then flash GApps **only if you downloaded the Vanilla build.
4. Reboot, and let the first boot settle for a few minutes.

> Root users: For KSUN and SUSFS flash [Ampere Kernel](/kernels/ampere)

## Known issues

- Widevine L1 certification may drop to L3.
- OPlus Cam might crash in portrait mode with human subject.

