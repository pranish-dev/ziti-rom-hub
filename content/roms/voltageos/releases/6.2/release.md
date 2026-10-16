---
version: "6.1 Official"
release_date: "2026-10-15"
android: "Android 17"
qpr: "Initial"
build_type:
  - Vanilla
maintainer: "okkotsu"
maintainer_telegram: "https://t.me/okkotsu66"
downloads:
  primary: "https://sourceforge.net/projects/voltage-os/files/ziti/voltage-6.2-ziti-20261015-1642-OFFICIAL.zip/download"
  mirror: "https://gofile.io/d/d4xE17Fa"
  changelog: "https://raw.githubusercontent.com/VoltageOS/android_vendor_voltageota/7fcea2f70e2fb03aab25217b5d4057b07e357edc/changelog_ziti.txt"
  recovery: "https://sourceforge.net/projects/voltage-os/files/ziti/recovery/recovery_voltage-ziti-20260917-0844.zip/download"
requirements:
  arb: "Installing Custom rom for first time ? Read warnings before proceeding"
warnings:
  - "Users on stock 1301+ builds must follow the migration notes before flashing."
  - "Clean flash is mandatory when coming from OxygenOS or another ROM."
clean_flash: false
backup_required: true
features:
  - "OTA pushed"
  - "SELinux Enforcing"
  - "Signed build"
  - "OPlus Cam"
  - "Sony Dolby"
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

> Root users: KernelSU Next is not availabe by default flash [ampere kernel](/kernels/ampere) for ksu.

## Known issues

- Widevine L1 certification may drop to L3.
- OPlus Cam might crash in portrait mode with human subject.

