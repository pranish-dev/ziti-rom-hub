---
title: Flashing a Custom ROM
description: Step-by-step guide to flashing a custom ROM on the OnePlus Nord CE 3 5G (ziti) — recovery, format data and adb sideload.
order: 20
---

> **Warning**
>
> Do this at your own risk. No one is responsible if anything happens to your device.

## Files required

1. Custom ROM `.zip`
2. ADB platform tools and drivers installed on the PC, with a **bootloader-unlocked** device connected via USB cable
3. Recovery `.zip` (provided in the ROM's post)

## Steps

1. Extract `recovery.zip` and copy its contents **inside the Platform Tools folder**.
2. Reboot the device to the bootloader:

   ```bash
   adb reboot bootloader
   ```

3. Double-click the `flash.bat` script inside Platform Tools — the recovery is flashed automatically and the device boots into recovery. **If it does not:**

   ```bash
   fastboot reboot recovery
   ```

4. After booting into recovery: **Format / reset data (mandatory)**.
5. Back in the recovery menu: **Apply update → Apply from ADB**, then:

   ```bash
   adb sideload "drag and drop the custom rom zip here"
   ```

6. When asked whether to reboot to recovery for additional files:
   - **Yes** — if you want to flash GApps yourself.
   - **No** — if it is already a GApps build.
7. Format data (optional but recommended) from the recovery menu.
8. Reboot to system.

---

> Credit: [NordCE3 Community](https://t.me/OnePlusNordCE35G) · Pranish
>
