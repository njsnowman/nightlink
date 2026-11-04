# Queen City Con ASCII showcase

Tracks [#138](https://github.com/njsnowman/nightlink/issues/138). The event build has its own app identity and profile, separate from production Nightlink.

## Branding

The wordmark follows the five-line ASCII lettering at [ConHam Queen City Con](https://conham.radio/qcc). That reference reads QUEEN CITY; this build explicitly appends CON to read **QUEEN CITY CON**. Canonical text is `art/ansi/source/queen-city-con-wordmark.txt`. Run `art/ansi/make-qcc-art.py` with Python/Pillow to regenerate VGA16 row data, CP437/UTF-8 ANSI exports, installer bitmaps and event icons. `generate-installer-art.py` delegates to the same generator so installer art cannot drift back to the old brand. Prior illustrated source art is historical and unused.

Shared event branding appears on startup, the main menu, Chat and the terminal lock logo. App/favicons and installer graphics use QCC/CON branding; alternate-interface brand labels also name Queen City Con. The right-aligned credit remains `By: Nightlink / Sysop SN0WMAN`, with queencitycon.org below. All three words remain in the wide wordmark, including fullscreen Chat.

## Operation

Open Chat, select the intended public event channel, then choose **Start big-screen display**. The main menu also offers **[F] Start big-screen display**. If no public channel is selected, it opens Chat with selection instructions. Presentation pins that channel, follows new messages, hides the composer/list/map and suppresses private DM popups/alerts. Escape exits. The startup logo appears immediately and remains while startup audio plays; explicit audio-off/quiet-hour preferences remain respected.

Application ID: `local.nightlink.queencitycon`; profile: `%APPDATA%/Nightlink-QueenCityCon`. Production credentials/settings are not migrated and production update checks are disabled. The source link opens the event branch. Connect the intended radio in this separate profile.

## Validation limits

Browser tests use synthetic messages and blocked radio commands. They check branding, pinned-channel privacy, display entry/exit, following and multiple screen sizes. Native frontend/installer evidence and exact source/artifact checksums are recorded per candidate under releases/. No physical radio or venue projector evidence is implied. Installers are unsigned local candidates unless a release record states otherwise.
