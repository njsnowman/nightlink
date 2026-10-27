# Signal Bridge identity

Primary mark: angular N with square connection cutouts, authored in icon.svg. Primary ice blue: #87E3F8. Dark icon tile: #03080C. The mark is used by the sidebar/connection artwork and the Windows icon set.

icon.ico contains 16, 20, 24, 32, 40, 48, 64, 128 and256 pixel PNG-backed32-bit images. branding-assets.cjs regenerates it from the checked-in SVG with Playwright; NIGHTLINK_PLAYWRIGHT and NIGHTLINK_BROWSER can point to local dependencies. generate-installer-art.py regenerates the NSIS RGB24 BMPs with Pillow and Windows fonts. Build-time generators are not executed by the installed app.

Windows executable, main window, DM window, zero-unread tray and notifications use icon.ico. Unread tray counts intentionally replace the mark temporarily. NSIS installer/uninstaller icons are configured explicitly.

The current Switchboard workspace defaults to dark black with an amber accent; ice blue, emerald and violet remain selectable. The Signal Bridge icon retains its ice-blue identity. Current installer artwork uses Switchboard black/amber, a readable wordmark and restrained corner brackets. See INSTALLER_DESIGN.md for the current installer treatment. Native title bar/buttons/fonts remain under Windows/NSIS styling. Preserve appId, package name, Meshline profile location, per-user installation and deleteAppDataOnUninstall=false when updating the identity.
