# Local client tools

Tracked in [#54](https://github.com/njsnowman/nightlink/issues/54).

## Contact identity comparison

Open a contact card, choose its options menu, then Compare public key. Compare the full fingerprint or QR with the person in person or through an independent trusted channel. A matching key and explicit comparison confirmation create a record on this computer. Familiar compared names with different keys produce a warning. A comparison is not a certificate or proof of who sent a channel message. Channel sender names are not individually authenticated. Comparison records remain local and are intentionally excluded from backups.

## RF Trends

Open Tools → Diagnostics → RF Trends. Hour, day and week windows summarize existing received-packet observations with bucket medians/ranges, counts and gaps. Half-window change requires at least five samples in each half. The recorder retains a bounded set for up to seven days; a week selector does not guarantee a full week of data. These are mixed-transmitter last-link observations, not network-wide health, packet-loss estimates or individual hop measurements. No probes are sent.

## Private map points

Open Network → Radio map → Local points. Save a location, coverage note or measurement with coordinates and notes. Points are stored on this computer, appear only on the local Radio map and are not sent over RF or uploaded to CoreScope. Edit/delete requires local action. Backup/restore includes points, preserves existing IDs and reports skipped points when its 500-point limit is reached. Downloaded street-map coverage must be installed separately for offline use.

## Console display and echo workspace

Settings → Display accent selects ice blue, amber, emerald or violet. Ice blue is the default. Message text and semantic delivery/error states retain independent colors. Selecting #echo opens a resizable chat/observer split with Chat/Map/Split controls; other channels retain normal messaging. CoreScope uses radio-reported coordinates when valid and a labeled regional fallback otherwise. A visible observer burst is not a message acknowledgment.
