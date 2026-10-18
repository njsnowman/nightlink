# Post-login vault transition

Tracked in [#69](https://github.com/njsnowman/nightlink/issues/69).

After successful app-lock password plus authenticator/recovery verification, the lock page shows the approved ice-blue vault: ring rotation, six retracting bolts, then door opening. The 2.55-second sequence continues into Overview. Credentials are cleared before verification. Failed login and ordinary startup without app lock do not show it.

Skip animation and Escape continue immediately after verification. System reduced-motion skips the sequence. The lock document retains its restricted preload; workspace/radio bridges are absent during the transition. Native entry requires a successfully verified pending login. A four-second native fallback opens Overview if the presentation script stalls. The animation is decorative and adds no security guarantee. No sound or external resources are loaded.
