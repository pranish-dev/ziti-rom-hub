---
version: "11.10"
release_date: "2026-08-10"
android: "Android 16"
qpr: "QPR2"
build_type:
  - GMS
  - Vanilla
maintainer: "loid_ok"
downloads:
  primary: "https://sourceforge.net/projects/evox-unofficial-ziti/files/Release/"
  mirror: 
  changelog: "https://raw.githubusercontent.com/anchalsehrawat/Evox_OTA/refs/heads/bka/changelogs/ziti.txt"
requirements:
  arb: "Do not downgrade firmware below the level required by this build. Read the warnings first."
warnings:
  - "Users on stock 1301+ builds must follow the migration notes before flashing."
  - "Clean flash is mandatory when coming from OxygenOS or another ROM."
clean_flash: true
backup_required: true
features:
  - "Signed build"
  - "Source Side Changes"
  - "KernelSU Next v3.3.0 with SusFS v2.1.0"
  - "OPlus Cam"
  - "Dolby"
  - "IR Remote"
credits:
  - "@pigowtham — base trees"
  - "@okkotsu — all this work"
  - "@Arka - For Server"
---

## Highlights
- [Recovery](https://sourceforge.net/projects/evox-unofficial-ziti/files/Recovery/evox_ziti_recovery-unofficial-withPTools-20260321.zip/download)
- KernelSU Next updated to **v3.3.0**, paired with **SusFS v2.1.0**.

## Installation notes

1. Boot into recovery .
2. Format data if coming from OxygenOS, another ROM, or a previous major version.
3. Flash the ROM zip, then flash GApps **only if you downloaded the Vanilla build.
4. Reboot, and let the first boot settle for a few minutes.

> Root users: KernelSU Next is already integrated.

## Known issues

- Widevine L1 certification may drop to L3.
- OPlus Cam might crash in portrait mode with human subject.

