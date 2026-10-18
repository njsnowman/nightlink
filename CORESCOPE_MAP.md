# Network map sources

Tracked in [#35](https://github.com/njsnowman/nightlink/issues/35).

Overview and Network open OKI Mesh CoreScope by default. Network uses radio-reported coordinates at zoom9 (two levels wider than before); Overview and echo retain zoom11. Without valid radio coordinates, the regional fallback remains zoom9. The CoreScope / Radio map switch remembers the selected source on this computer. Message-path maps continue to use connected/saved radio contacts and street tiles. The Overview preview uses the same sandboxed frame at half scale so CoreScope’s controls fit its smaller panel.

CoreScope is the remote service at https://map.okimesh.org/#/live and displays observer-collected network data. It requires internet and service availability; it is not a complete representation of everything received by the attached radio. The remote site may change independently of Nightlink.

CoreScope is embedded without copying its application source. Branding and attribution remain visible. The frame permits its own scripts and origin storage, but cannot access Nightlink’s origin, Node APIs or privileged Electron bridges. Frame navigation is limited by the parent’s frame-src policy to https://map.okimesh.org. No remote preload, native APIs, popup permission, top-navigation permission or Bluetooth permission is granted.

The frame is created only for the active CoreScope Overview or Network view and removed on source/view change. On browser-reported offline state it is removed and the radio-map option remains available. Street tiles in the radio map also require internet; saved coordinates remain available. Windows checks the fixed public CoreScope /api/health endpoint with a six-second timeout and JSON status validation, then checks every 30 seconds while a CoreScope view is active. HTTP errors, network errors, invalid responses and timeouts automatically switch to the local Radio map; an iframe load event alone does not establish service availability. Checks stop when the view/frame is removed. This verifies endpoint reachability, not complete observer coverage or functioning map tiles/WebSocket data. Reload can retry; Windows online events retry the preferred remote source. Offline map detail requires an installed pack covering the area.

Validation: isolated browser tests cover default/persisted source selection, origin isolation, frame lifecycle, offline/online recovery and compact dimensions. Real CoreScope browser render verified. Packaged Windows validation is recorded with the candidate source and checksum before distribution.
