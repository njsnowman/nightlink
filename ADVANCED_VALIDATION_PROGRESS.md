# Advanced feature validation

> Evidence record: dated results below retain their original scope. For current downloads, release status and remaining limitations, use the [documentation index](DOCUMENTATION.md) and [0.8.22 release record](releases/0.8.22.md).


Tracked in [#43](https://github.com/njsnowman/nightlink/issues/43) and [PR #44](https://github.com/njsnowman/nightlink/pull/44).

The advanced batch is packaged as 0.8.19. Connection-flow and scrolling fixes previously shipped independently in 0.8.17 and 0.8.18. Final results, source identity, checksums and limitations are recorded in [releases/0.8.19.md](releases/0.8.19.md).

120 unit tests and relevant browser/packaged checks passed. Real local speech inference used public speech with a simulated microphone; no physical microphone recording was made. Offline maps were validated using a finite attributed 58-tile extract and read-only MBTiles import. Runtime/model and maps are configured separately and are not bundled.

A receive-only Heltec USB session lasted 122 seconds with zero disconnects and one valid received packet, placement sample and path group. This confirms capture plumbing, not statistical accuracy or endurance. The normal app was restored and reconnected with 25 messages retained. Private profiles, packets and backups remain outside GitHub.
