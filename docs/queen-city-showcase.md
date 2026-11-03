# Queen City Con ANSI showcase candidate

Tracks [#138](https://github.com/njsnowman/nightlink/issues/138). This event variant is separate from the production release line.

## Operation

Open Chat, select the public event radio channel, then choose **Start big-screen display**. The selected channel stays pinned; new messages follow at the bottom. The display hides the composer, conversation list and CoreScope map. Private DM popups and alerts are suppressed during presentation. Press Escape or choose **Exit big-screen display** to return to normal chat. Keep the operator desktop and unrelated applications off the projector.

The event logo uses 240 x 91 VGA16 block data rendered with the existing terminal pixel-art component. Credit below the logo is right aligned: `By: Nightlink / Sysop SN0WMAN`. The public display uses monospace text, blue bars and ANSI block graphics. Standalone CP437 and UTF-8 ANSI exports at 80 and 240 columns are in `art/ansi/`.

## Source and isolation

The source artwork is the [official 2026 Queen City Conference image](https://queencitycon.org/images/0x4_assets/qcc_logo-white_text-2026_0x4.png), retained in `art/ansi/source/queen-city-con-2026.png` for reproducible conversion. Run `art/ansi/make-qcc-art.py` with Python and Pillow to regenerate the block data and ANSI exports. The source PNG and preview are not packaged as runtime branding.

The executable has a separate application identity (`local.nightlink.queencitycon`), shortcut and data directory (`%APPDATA%/Nightlink-QueenCityCon`). It does not migrate production credentials or settings. Production update checks are disabled in this variant; its source link opens the showcase branch. Connect the intended radio in this separate profile. Do not assume the normal Nightlink profile is shared.

## Evidence and limitations

Automated tests use synthetic messages and blocked radio commands. They check pinned-channel privacy, disabled public display for DMs, automatic following, exit behavior and fit at 1920x1080, 1280x720 and 760x560. No physical-radio or venue-projector validation has been performed. The installer is an unsigned local candidate; it has not been installed during development. Inspect the source commit and SHA-256 values in the matching release record before sharing.
