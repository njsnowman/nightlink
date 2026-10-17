# Network map sources

Tracked in [#35](https://github.com/njsnowman/nightlink/issues/35).

Overview and Network open OKI Mesh CoreScope by default. The CoreScope / Radio map switch remembers the selected source on this computer. Message-path maps continue to use connected/saved radio contacts and street tiles. The Overview preview uses the same sandboxed frame at half scale so CoreScope’s controls fit its smaller panel.

CoreScope is the remote service at https://map.okimesh.org/#/live and displays observer-collected network data. It requires internet and service availability; it is not a complete representation of everything received by the attached radio. The remote site may change independently of Nightlink.

CoreScope is embedded without copying its application source. Branding and attribution remain visible. The frame permits its own scripts and origin storage, but cannot access Nightlink’s origin, Node APIs or privileged Electron bridges. Frame navigation is limited by the parent’s frame-src policy to https://map.okimesh.org. No remote preload, native APIs, popup permission, top-navigation permission or Bluetooth permission is granted.

The frame is created only for the active CoreScope Overview or Network view and removed on source/view change. On browser-reported offline state it is removed and the radio-map option remains available. Street tiles in the radio map also require internet; saved coordinates remain available. Cross-origin browser restrictions prevent reliable inspection of remote HTTP error pages, so the footer always offers reload and radio-map recovery rather than claiming verified service availability.

Validation: isolated browser tests cover default/persisted source selection, origin isolation, frame lifecycle, offline/online recovery and compact dimensions. Real CoreScope browser render verified. Packaged Windows validation is recorded with the candidate source and checksum before distribution.
