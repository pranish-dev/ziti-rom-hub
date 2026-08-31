---
version: "v1.0"
release_date: "2026-08-30"
android: "Android 17"
linux: "5.4.302"
kernel_su: "Supported"
susfs: "SUSFS v2.2.0"
supported_roms:
  - "VoltageOS v6.0"
  - "More to come in future"
downloads:
  primary: "https://github.com/ziti-resources/kernel_oneplus_sm8350/releases/tag/ampere-v1"
source: "https://github.com/ziti-resources/kernel_oneplus_sm8350"
ksu: true
---
## Changelog
- First release.

## Installation notes

1. Boot into bootloader.
   ```bash
   adb reboot bootloader
   ```
2. flash vendor_boot (recovery)
   ```bash
   fastboot flash vendor_boot vendor_boot.img
   ```
3. Reboot to recovery
   ```bash
   fastboot reboot recovery
   ```
4. Sideload Ampere Kernel
   ```bash
   adb sideload <Amperekernel.zip>
   ```
5. Reboot 
