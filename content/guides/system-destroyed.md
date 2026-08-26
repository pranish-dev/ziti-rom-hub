---
title: Fixing "System Destroyed" While Relocking
description: You are here because you tried to relock your device after rooting it on stock OOS. Here is how to recover the OnePlus Nord CE 3 5G (ziti).
order: 50
---

You are here because you tried to relock your device **after rooting it on
stock OOS** — and now it says **"System destroyed"**. What to do?

> **Info**
>
> - This happens when you try to relock the device after uninstalling Magisk
>   **without flashing the stock OOS `boot.img`**.
> - If you locked the device, unlock it again (below).
> - If it bootloops without entering fastboot mode while plugged into your PC:
>   unplug it first, then force-reboot to Fastboot Mode with
>   **Volume Up + Volume Down + Power**. Once it boots into Fastboot Mode,
>   plug it back into the PC.

## Recovery steps

Copy and run the following commands:

```bash
fastboot flashing unlock
```

```bash
fastboot flash boot boot.img
```

> **Note** — Use the **same version** of the stock `boot.img` as the OOS
> version you were on. Make sure you are flashing the **stock** `boot.img` if
> you want to unroot — if you flash a patched `boot.img`, the device will boot
> with Magisk still in the system.

```bash
fastboot -w
```

```bash
fastboot reboot
```

This boots you into the system with the device unlocked.

## Now you can relock

After it boots into the system, go back into fastboot mode and:

```bash
fastboot flashing lock
```

---

> Credit: [NordCE3 Community](https://t.me/OnePlusNordCE35G) · Pranish
>
