---
title: Unlocking / Locking the Bootloader
description: How to unlock or lock the bootloader on the OnePlus Nord CE 3 5G (ziti) — requirements, fastboot commands and the warnings that matter.
order: 10
---

> **Warning**
>
> I) **DO NOT downgrade to OxygenOS 13 after unlocking the bootloader.**
> II) **Before locking the bootloader, make sure the device is unrooted.**

## Items required

- A working brain
- PC/laptop with [Platform tools](https://developer.android.com/tools/releases/platform-tools) and [ADB & Fastboot drivers](https://github.com/fawazahmed0/Latest-adb-fastboot-installer-for-windows)
- Device on OOS 14 or above (bootloader is only available on these updates)

## Steps

1. **Back up your files** (PC / SD card / Google backup / Swift Backup — whatever you prefer). Unlocking **or** locking will erase the internal storage.
2. Enable **USB debugging** and **OEM unlocking** (Allow bootloader unlock) from Developer options, then connect the device to the PC.

   > To enable Developer options: Settings → About device → Version → tap the version number 7–8 times.

3. Download the latest [SDK Platform tools](https://developer.android.com/tools/releases/platform-tools) and extract them. Open a terminal in the extracted folder (Shift + right-click → Open in Terminal).
4. Verify the connection:

   ```bash
   adb devices
   ```

   Allow the pop-up on the phone if it appears. Run it again — you should see your device serial number.

5. Reboot to the bootloader:

   ```bash
   adb reboot bootloader
   ```

   > You can also enter Bootloader/Fastboot Mode by holding **Volume + , Volume − and Power** together.

   Check the fastboot connection:

   ```bash
   fastboot devices
   ```

6. Unlock **or** lock:

   ```bash
   fastboot flashing unlock
   ```

   or

   ```bash
   fastboot flashing lock
   ```

   > Two options appear on the phone. Use the volume keys to select **Unlock/Lock** and press the power button to confirm. This erases the device.

7. Reboot:

   ```bash
   fastboot reboot
   ```

Done — the bootloader is now unlocked (or locked).

## Extras

Things you may need while relocking:

- Check the current slot: `fastboot getvar current-slot`
- Switch slots: `fastboot --set-active=a` (write `b` instead of `a` to target the other slot)

---

> Credit: [NordCE3 Community](https://t.me/OnePlusNordCE35G) · Pranish
>
