# Release download counts

GitHub's per-file `download_count` for each published release, read from the releases API. The counts are cumulative: each row records the total on the date read, and earlier rows are kept so the trend shows.

How to read them:
- A count is a download, not a unique user. Repeat downloads count again; copied installers are not counted.
- `SHA256SUMS.txt` is also fetched by the in-app update check (`updates.cjs`), so its count reflects update checks more than people.
- CI test-build artifacts (Actions downloads) have no counts.
- Draft releases and candidate builds are excluded unless published.

Update: at each publication (RELEASE_PROCESS.md step 7), add a dated row for every published release.

## 2026-11-28

| Release | Published | Setup | Portable | SHA256SUMS |
| --- | --- | ---: | ---: | ---: |
| [v0.8.30](https://github.com/njsnowman/nightlink/releases/tag/v0.8.30) (stable) | 2026-11-28 | 0 | 0 | 0 |
| [v0.8.29](https://github.com/njsnowman/nightlink/releases/tag/v0.8.29) (stable) | 2026-11-28 | 3 | 1 | 1 |

## 2026-11-27

| Release | Published | Setup | Portable | SHA256SUMS |
| --- | --- | ---: | ---: | ---: |
| [v0.8.28](https://github.com/njsnowman/nightlink/releases/tag/v0.8.28) (stable) | 2026-11-19 | 15 | 2 | 18 |
| [v0.8.26](https://github.com/njsnowman/nightlink/releases/tag/v0.8.26) (stable) | 2026-10-31 | 47 | 3 | 4 |
| [v0.8.28-rc.51](https://github.com/njsnowman/nightlink/releases/tag/v0.8.28-rc.51) (prerelease) | 2026-11-19 | 3 | 1 | 1 |
| [v0.8.28-rc.54](https://github.com/njsnowman/nightlink/releases/tag/v0.8.28-rc.54) (prerelease) | 2026-11-26 | 3 | 1 | 1 |
| [candidate-0.8.28-rc.57](https://github.com/njsnowman/nightlink/releases/tag/candidate-0.8.28-rc.57-f1ac22d) (prerelease) | 2026-11-27 | 1 | 1 | 1 |

Stable installers to date: 62 Setup and 5 Portable downloads.
