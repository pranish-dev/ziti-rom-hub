---
title: Reverting to Stock from a Custom ROM
description: How to go back to stock OxygenOS on the OnePlus Nord CE 3 5G (ziti) from a custom ROM — stock OTA, Lineage recovery and the flash scripts.
order: 30
---

## 1. Download the stock ROM

Use the [realme-ota tool](https://github.com/R0rt1z2/realme-ota) — it gives you
download links for the latest stock images for OPPO/OnePlus/Realme devices.

> **Info** — Skip this step if you already have the OTA zip file.
>
> - **"A"** — initial stock ROM that shipped with the device
>   (not recommended: OOS 13.1 has **no bootloader mode** on ziti)
> - **"C"** — first major Android update
> - **"F"** — second major Android update

Example — stock zip for the OnePlus Nord CE 3 based on Android 14:

```bash
realme-ota -r 2 CPH2569 CPH2569_11.C.01_0000_000000000000 3
```

Direct download links for CPH2569 OTAs (prefer OOS 14 — OOS 13.1 has no
bootloader mode on the CE3):

- [OOS 14.0.0.300 (EX01)](https://gauss-componentotacostmanual-in.allawnofs.com/remove-ea1af2d0b4327991aa0432e5e233e3d1/component-ota/24/01/19/dacf157117234e30adcf8fa4ee619246.zip)
- [OOS 14.0.0.600 (EX01)](https://gauss-componentotacostmanual-in.allawnofs.com/remove-e84786651a5316e777f6fd2bb9fea51c/component-ota/24/04/16/ca0f98671ee340848f0be9b6855814e0.zip)
- [Telebox mirror](https://lbx.to/d/kwtu9Xd) with all the latest CE3 OTAs uploaded

## 2. Flash the Lineage recovery

Download this specific Lineage recovery zip for reverting to stock:
[Lineage recovery for ziti](https://github.com/pjgowtham/android_device_oneplus_ziti/releases/tag/lineage-21.0-20240420-UNOFFICIAL-ziti)

> **Note** — Take the `.bat` script from the [previous lineage recovery
> zip](https://github.com/pjgowtham/android_device_oneplus_ziti/releases/download/lineage-21.0-20240106-UNOFFICIAL-ziti/recovery-lineage-21.0-20240106-UNOFFICIAL-ziti)
> (check the group/post for the latest recovery).

Connect the device via ADB and reboot to fastboot:

```bash
adb reboot bootloader
fastboot devices
```

Extract the recovery zip and copy its contents into the Platform Tools folder,
then run `flash.bat` (`flash.sh` on Linux). The script flashes all files in the
recovery zip and the device boots into recovery.

## 3. Format data

After booting into recovery, **format data (important)**.

## 4. Sideload the stock zip

In recovery: **Apply updates → Apply from ADB**, then:

```bash
adb sideload "drag and drop stockromname.zip here"
```

## 5. Flash the stock script

Download the flash script:
[my_shit.zip](https://github.com/pjgowtham/android_device_oneplus_sm8450-common/releases/download/recovery_resources/my_shit.zip)

While in bootloader mode, extract this zip and copy its contents into the
Platform Tools folder (use a fresh folder, or delete/rename the previous
`flash.bat` from the recovery zip — e.g. rename this one to `flash_stock.bat`
to remember). Double-click the script to execute the commands automatically.

**Do not touch anything until the device reboots into stock OOS.**

## Extra — manual commands

If you forgot to use a fresh platform-tools folder, you can flash manually.
The images are included in the zip:
[my_company.img](https://github.com/pjgowtham/android_device_oneplus_sm8450-common/releases/download/recovery_resources/my_company.img) ·
[my_preload.img](https://github.com/pjgowtham/android_device_oneplus_sm8450-common/releases/download/recovery_resources/my_preload.img)

These are the commands the script executes:

```bash
fastboot reboot fastboot
sleep 5
fastboot create-logical-partition my_company_a 0
fastboot create-logical-partition my_company_b 0
fastboot create-logical-partition my_preload_a 0
fastboot create-logical-partition my_preload_b 0
fastboot flash my_company --slot=all my_company.img
fastboot flash my_preload --slot=all my_preload.img
sleep 5
fastboot reboot bootloader
fastboot -w
fastboot reboot
```

It should boot into stock.

---

> Credit: [NordCE3 Community](https://t.me/OnePlusNordCE35G) · Pranish
>
