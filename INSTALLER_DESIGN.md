# Windows installer design

Tracked in [#39](https://github.com/njsnowman/nightlink/issues/39).

The assisted NSIS wizard uses true black backgrounds, cyan highlights, ice blue accents, and a radio-network diagram. Welcome and completion pages carry a three-stage installation sequence; directory, shortcut, and progress pages retain native Windows controls and keyboard behavior. Installation remains per-user, the desktop shortcut is optional, and upgrades preserve the application profile.

`installer.nsh` contains the theme and shortcut callbacks. `installer-assets/` contains 24-bit BMP artwork at three times the standard NSIS dimensions for scaling. Regenerate the artwork on Windows with Python and Pillow using `python generate-installer-art.py`; Pillow is an authoring dependency and is not bundled or needed by the installer.

Validation is recorded in the matching release record.
