# Network map sources

Tracked in [#35](https://github.com/njsnowman/nightlink/issues/35).

Overview and Network open OKI Mesh CoreScope by default. Network uses radio-reported coordinates at zoom9 (two levels wider than before); Overview and echo retain zoom11. Without valid radio coordinates, the regional fallback remains zoom9. The CoreScope / Radio map switch remembers the selected source on this computer. Message-path maps continue to use connected/saved radio contacts and street tiles. The Overview preview uses the same sandboxed frame at half scale so CoreScope’s controls fit its smaller panel.

CoreScope is the remote service at https://map.okimesh.org/#/live and displays observer-collected network data. It requires internet and service availability; it is not a complete representation of everything received by the attached radio. The remote site may change independently of Nightlink.

CoreScope is embedded without copying its application source. Branding and attribution remain visible. The frame permits its own scripts and origin storage, but cannot access Nightlink’s origin, Node APIs or privileged Electron bridges. Frame navigation is limited by the parent’s frame-src policy to https://map.okimesh.org. No remote preload, native APIs, popup permission, top-navigation permission or Bluetooth permission is granted.

The frame is created only for the active CoreScope Overview or Network view and removed on source/view change. On browser-reported offline state it is removed and the radio-map option remains available. Street tiles in the radio map also require internet; saved coordinates remain available. Windows checks the fixed public CoreScope /api/health endpoint with a six-second timeout and JSON status validation, then checks every 30 seconds while a CoreScope view is active. HTTP errors, network errors, invalid responses and timeouts automatically switch to the local Radio map; an iframe load event alone does not establish service availability. Checks stop when the view/frame is removed. This verifies endpoint reachability, not complete observer coverage or functioning map tiles/WebSocket data. Reload can retry; Windows online events retry the preferred remote source. Offline map detail requires an installed pack covering the area.

Validation: isolated browser tests cover default/persisted source selection, origin isolation, frame lifecycle, offline/online recovery and compact dimensions. Real CoreScope browser render verified. Packaged Windows validation is recorded with the candidate source and checksum before distribution.


## Radio map location and MeshMapper CVG

Radio map prefers valid radio-reported coordinates at zoom12. Contact updates do not fit the map to distant nodes or override user panning. Opening the local source or Recenter restores the radio view; without valid radio coordinates the saved viewport is used, then the regional fallback. Coordinates can be configured/stale and are not described as a fresh GPS fix.

Network offers MeshMapper CVG using the documented read-only https://cvg.meshmapper.net/embed.php endpoint. Valid radio coordinates set the center at zoom12; otherwise the embed uses its region center. geofence=0 retains regional coverage rather than limiting data to the embed default radius. Branding/attribution remain visible; Open full map opens the fixed CVG site. The Network-only source is remembered; Overview uses CoreScope or Radio map. Both remote origins are explicitly allowed by frame-src and receive no native preload/bridges. Source-specific endpoint checks and offline events fall back locally. A working embed endpoint does not prove complete coverage or successful WebGL/tile rendering. See https://wiki.meshmapper.net/embedding/.

## Saved MeshMapper region

Network → Region or Settings → MeshMapper region accepts a three-letter code (case-insensitive). CVG is the default; IND selects https://ind.meshmapper.net/embed.php. The uppercase code is stored in localStorage under nightlink.meshmapper-region and reused after restart. Embed labels, full-map links and native health checks follow the selected code. A syntactically valid code does not establish an active region; unavailable service falls back locally without replacing the choice. Health results are cached per region. Native IPC validates the same code format before constructing HTTPS MeshMapper URLs; arbitrary hosts/paths cannot be supplied. Remote frames have no native bridge. Radio-reported centering remains independent of the regional data source.
