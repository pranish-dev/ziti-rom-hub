#!/usr/bin/env bash
# -----------------------------------------------------------------------------
# Generates the sample banner/screenshot artwork shipped with the demo content.
#
# These are clearly placeholders — replace them with real screenshots and
# banners whenever you publish actual releases. The script is idempotent:
# re-running it simply regenerates the same files.
#
# Usage: npm run generate-sample-media   (requires ImageMagick + DejaVu fonts)
# -----------------------------------------------------------------------------
set -euo pipefail

cd "$(dirname "$0")/.."
CONTENT="content/roms"
PUBLIC="public"
mkdir -p "$CONTENT" "$PUBLIC"

BOLD_FONT="DejaVu-Sans-Bold"
REG_FONT="DejaVu-Sans"

ACCENT="#F50514"
BG_DARK="#0D0D0D"
PANEL="#151515"

# ---------------------------------------------------------------- banners ----
make_banner() { # $1 out file, $2 name, $3 version, $4 subtitle
  local out="$1" name="$2" version="$3" subtitle="$4"
  magick -size 1600x640 gradient:"#161616-#0A0A0A" \
    \( -size 1600x640 xc:none \
       -fill "rgba(245,5,20,0.85)"  -draw "polygon 1120,640 1290,0 1350,0 1180,640" \
       -fill "rgba(245,5,20,0.45)"  -draw "polygon 1230,640 1400,0 1436,0 1266,640" \
       -fill "rgba(245,5,20,0.18)"  -draw "polygon 1320,640 1490,0 1520,0 1350,640" \) \
    -composite \
    -font "$BOLD_FONT" -pointsize 96 -fill "#FFFFFF" -gravity northwest -annotate +84+212 "$name" \
    -font "$BOLD_FONT" -pointsize 34 -fill "$ACCENT"  -gravity northwest -annotate +88+340 "v$version" \
    -font "$REG_FONT"  -pointsize 30 -fill "#A0A0A0" -gravity northwest -annotate +210+344 "$subtitle" \
    -fill "#242424" -draw "rectangle 86,412 480,414" \
    -font "$BOLD_FONT" -pointsize 22 -fill "#707070" -gravity northwest -annotate +86+556 "ZITI ROM HUB · ONEPLUS NORD CE 3 5G (ZITI)" \
    "$out"
}

# ------------------------------------------------------------ screenshots ----
make_screenshot() { # $1 out, $2 layout(home|settings|about), $3 title, $4 subtitle
  local out="$1" layout="$2" title="$3" subtitle="$4"

  case "$layout" in
    home)
      magick -size 720x1560 radial-gradient:"#26060A-#0D0D0D" \
        -font "$BOLD_FONT" -pointsize 26 -fill "#FFFFFF" -gravity northwest -annotate +36+46 "17:32" \
        -fill "#E5E5E5" -draw "rectangle 600,52 616,68" \
        -fill "#E5E5E5" -draw "roundrectangle 628,50 668,70 6,6" \
        -font "$BOLD_FONT" -pointsize 76 -fill "#FFFFFF" -gravity north -annotate +0+150 "17:32" \
        -font "$REG_FONT" -pointsize 27 -fill "#B9B9B9" -gravity north -annotate +0+250 "Wednesday, 26 August" \
        -fill "rgba(255,255,255,0.10)" \
        -draw "roundrectangle 72,430 168,526 22,22" -draw "roundrectangle 228,430 324,526 22,22" \
        -draw "roundrectangle 384,430 480,526 22,22"  -draw "roundrectangle 540,430 636,526 22,22" \
        -draw "roundrectangle 72,606 168,702 22,22"   -draw "roundrectangle 228,606 324,702 22,22" \
        -draw "roundrectangle 384,606 480,702 22,22"  -draw "roundrectangle 540,606 636,702 22,22" \
        -draw "roundrectangle 72,782 168,878 22,22"   -draw "roundrectangle 228,782 324,878 22,22" \
        -draw "roundrectangle 384,782 480,878 22,22"  -draw "roundrectangle 540,782 636,878 22,22" \
        -draw "roundrectangle 72,958 168,1054 22,22"  -draw "roundrectangle 228,958 324,1054 22,22" \
        -fill "rgba(255,255,255,0.07)" -draw "roundrectangle 48,1330 672,1470 34,34" \
        -fill "rgba(255,255,255,0.12)" \
        -draw "roundrectangle 92,1362 164,1438 20,20" -draw "roundrectangle 238,1362 310,1438 20,20" \
        -draw "roundrectangle 384,1362 456,1438 20,20" -draw "roundrectangle 530,1362 602,1438 20,20" \
        "$out"
      ;;
    settings)
      magick -size 720x1560 xc:"$BG_DARK" \
        -font "$BOLD_FONT" -pointsize 26 -fill "#FFFFFF" -gravity northwest -annotate +36+46 "17:32" \
        -fill "#E5E5E5" -draw "rectangle 600,52 616,68" \
        -fill "#E5E5E5" -draw "roundrectangle 628,50 668,70 6,6" \
        -font "$BOLD_FONT" -pointsize 44 -fill "#FFFFFF" -gravity northwest -annotate +40+120 "Settings" \
        -font "$REG_FONT" -pointsize 25 -fill "#8C8C8C" -gravity northwest -annotate +40+206 "Search settings" \
        -fill "$PANEL" -draw "roundrectangle 40,196 680,252 14,14" \
        -fill "#333333" -draw "circle 66,224 66,208" \
        -font "$BOLD_FONT" -pointsize 21 -fill "$ACCENT" -gravity northwest -annotate +42+300 "NETWORK & INTERNET" \
        -font "$REG_FONT" -pointsize 29 -fill "#EDEDED" -gravity northwest -annotate +44+350 "Wi-Fi" \
        -font "$REG_FONT" -pointsize 24 -fill "#8C8C8C" -gravity northwest -annotate +44+396 "Redacted-5G" \
        -fill "#2A2A2A" -draw "rectangle 40,432 680,434" \
        -font "$REG_FONT" -pointsize 29 -fill "#EDEDED" -gravity northwest -annotate +44+462 "Bluetooth" \
        -fill "#2A2A2A" -draw "rectangle 40,512 680,514" \
        -font "$BOLD_FONT" -pointsize 21 -fill "$ACCENT" -gravity northwest -annotate +42+556 "SYSTEM" \
        -font "$REG_FONT" -pointsize 29 -fill "#EDEDED" -gravity northwest -annotate +44+606 "Display" \
        -fill "$ACCENT" -draw "roundrectangle 540,606 656,646 20,20" \
        -fill "#FFFFFF" -draw "circle 630,626 630,612" \
        -fill "#2A2A2A" -draw "rectangle 40,680 680,682" \
        -font "$REG_FONT" -pointsize 29 -fill "#EDEDED" -gravity northwest -annotate +44+712 "Sound & vibration" \
        -fill "#3A3A3A" -draw "roundrectangle 540,712 656,752 20,20" \
        -fill "#101010" -draw "circle 566,732 566,718" \
        -fill "#2A2A2A" -draw "rectangle 40,786 680,788" \
        -font "$REG_FONT" -pointsize 29 -fill "#EDEDED" -gravity northwest -annotate +44+818 "Battery" \
        -fill "$ACCENT" -draw "roundrectangle 540,812 656,852 20,20" \
        -fill "#FFFFFF" -draw "circle 630,832 630,818" \
        -fill "#2A2A2A" -draw "rectangle 40,892 680,894" \
        -font "$REG_FONT" -pointsize 29 -fill "#EDEDED" -gravity northwest -annotate +44+924 "About phone" \
        -fill "#4A4A4A" -font "$REG_FONT" -pointsize 30 -gravity east -annotate +56+924 ">" \
        -fill "#2A2A2A" -draw "rectangle 40,998 680,1000" \
        "$out"
      ;;
    about)
      magick -size 720x1560 xc:"$BG_DARK" \
        -font "$BOLD_FONT" -pointsize 26 -fill "#FFFFFF" -gravity northwest -annotate +36+46 "17:32" \
        -fill "#E5E5E5" -draw "rectangle 600,52 616,68" \
        -fill "#E5E5E5" -draw "roundrectangle 628,50 668,70 6,6" \
        -font "$BOLD_FONT" -pointsize 40 -fill "#FFFFFF" -gravity northwest -annotate +40+120 "About phone" \
        -fill "$ACCENT" -draw "roundrectangle 288,240 432,384 30,30" \
        -font "$BOLD_FONT" -pointsize 64 -fill "#080808" -gravity center -annotate +0-492 "Z" \
        -font "$BOLD_FONT" -pointsize 46 -fill "#FFFFFF" -gravity north -annotate +0+430 "$title" \
        -font "$REG_FONT" -pointsize 27 -fill "#9A9A9A" -gravity north -annotate +0+500 "$subtitle" \
        -fill "#242424" -draw "rectangle 60,590 660,592" \
        -font "$REG_FONT" -pointsize 26 -fill "#8C8C8C" -gravity northwest -annotate +64+640 "Device" \
        -font "$REG_FONT" -pointsize 26 -fill "#EDEDED" -gravity northeast -annotate -64+640 "OnePlus Nord CE 3 5G" \
        -font "$REG_FONT" -pointsize 26 -fill "#8C8C8C" -gravity northwest -annotate +64+700 "Android" \
        -font "$REG_FONT" -pointsize 26 -fill "#EDEDED" -gravity northeast -annotate -64+700 "$(echo "$subtitle" | cut -d' ' -f1)" \
        -font "$REG_FONT" -pointsize 26 -fill "#8C8C8C" -gravity northwest -annotate +64+760 "Build type" \
        -font "$REG_FONT" -pointsize 26 -fill "#EDEDED" -gravity northeast -annotate -64+760 "Signed · GMS" \
        -font "$REG_FONT" -pointsize 26 -fill "#8C8C8C" -gravity northwest -annotate +64+820 "Kernel" \
        -font "$REG_FONT" -pointsize 26 -fill "#EDEDED" -gravity northeast -annotate -64+820 "6.1.90-android13" \
        -fill "#2BB673" -draw "circle 74,894 74,880" \
        -font "$REG_FONT" -pointsize 26 -fill "#EDEDED" -gravity northwest -annotate +94+880 "SELinux: Enforcing" \
        -fill "#242424" -draw "rectangle 60,950 660,952" \
        "$out"
      ;;
  esac
}

# --------------------------------------------------------------- og image ----
make_og() {
  magick -size 1200x630 gradient:"#161616-#0A0A0A" \
    \( -size 1200x630 xc:none \
       -fill "rgba(245,5,20,0.8)"  -draw "polygon 850,630 1030,0 1090,0 910,630" \
       -fill "rgba(245,5,20,0.35)" -draw "polygon 960,630 1140,0 1176,0 996,630" \) \
    -composite \
    -font "$BOLD_FONT" -pointsize 108 -fill "#FFFFFF" -gravity northwest -annotate +80+180 "Ziti ROM Hub" \
    -font "$REG_FONT" -pointsize 34 -fill "#A0A0A0" -gravity northwest -annotate +84+320 "Custom ROMs · releases · guides" \
    -font "$REG_FONT" -pointsize 34 -fill "#A0A0A0" -gravity northwest -annotate +84+372 "OnePlus Nord CE 3 5G (ziti)" \
    -fill "$ACCENT" -draw "rectangle 84,440 200,446" \
    -font "$BOLD_FONT" -pointsize 24 -fill "#707070" -gravity northwest -annotate +84+500 "COMMUNITY MAINTAINED · BUILT FROM GIT" \
    "$PUBLIC/og.png"
}

echo "Generating sample media..."

make_banner "$CONTENT/lunaris-aosp/releases/3.12/banner.webp" "LunarisAOSP" "3.12" "for OnePlus Nord CE 3 5G · ziti"
make_banner "$CONTENT/crdroid/releases/12.1/banner.webp" "crDroid" "12.1" "for OnePlus Nord CE 3 5G · ziti"
make_banner "$CONTENT/lineageos/releases/23.0/banner.webp" "LineageOS" "23.0" "for OnePlus Nord CE 3 5G · ziti"

S_LUNAR="$CONTENT/lunaris-aosp/releases/3.12/screenshots"
S_CRD="$CONTENT/crdroid/releases/12.1/screenshots"
S_LOS="$CONTENT/lineageos/releases/23.0/screenshots"
mkdir -p "$S_LUNAR" "$S_CRD" "$S_LOS"

make_screenshot "$S_LUNAR/01.webp" home     "" ""
make_screenshot "$S_LUNAR/02.webp" settings "" ""
make_screenshot "$S_LUNAR/03.webp" about    "LunarisAOSP" "3.12 · Android 16"
make_screenshot "$S_CRD/01.webp"   home     "" ""
make_screenshot "$S_CRD/02.webp"   about    "crDroid" "12.1 · Android 16"
make_screenshot "$S_CRD/03.webp"   settings "" ""
make_screenshot "$S_LOS/01.webp"   about    "LineageOS" "23.0 · Android 16"
make_screenshot "$S_LOS/02.webp"   settings "" ""

make_og

echo "Done."
