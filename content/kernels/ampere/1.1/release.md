---
version: "v1.1"
release_date: "2026-09-17"
android: "Android 16 & 17"
linux: "5.4.302"
kernel_su: "Supported"
susfs: "SUSFS v2.2.0"
supported_roms:
  - "VoltageOS v6.x"
  - "LunarisAOSP 3.12 sep patch"
downloads:
  primary: "https://github.com/ziti-resources/kernel_oneplus_sm8350/releases/tag/ampere-v1.1"
source: "https://github.com/ziti-resources/kernel_oneplus_sm8350"
ksu: true
---
## Changelog
- Fixed WiFi startup delay
- Merge upstream changes

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
