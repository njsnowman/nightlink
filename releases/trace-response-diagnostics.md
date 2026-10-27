# Trace response diagnosis follow-up — 2026-10-27

Tracking: [#89](https://github.com/njsnowman/nightlink/issues/89).

Reviewed current official [companion trace command/response](https://github.com/meshcore-dev/MeshCore/blob/main/examples/companion_radio/MyMesh.cpp) and [trace routing](https://github.com/meshcore-dev/MeshCore/blob/main/src/Mesh.cpp). Command 36 zero-auth/one-byte path and 0x89 reply framing remain consistent with Nightlink's supported format. This source comparison does not identify the cause of the previous physical timeout; that capture had no raw trace or 0x89 return.

Added trace-session counters for received 0x89 frames, unrelated request tags and invalid/unsupported matching frames. Timeout UI distinguishes no returned trace data from discarded replies. Counts remain separate from companion acceptance and are not proof of RF transmission or remote receipt. No packet contents or tag values are retained in these counters, and no retries, polling, radio settings or firmware changes are introduced.

Validation: 14 workbench unit tests passed, including no-data and malformed/unrelated response counters, one-send behavior, tag matching, disconnect/cleanup and acceptance deadlines. Workbench browser passed success/result retention, both timeout-detail states, no duplicate send, other radio tools and compact layouts. Synthetic fixtures only; no physical radio, production profile or installed app was accessed. Physical returned-trace acceptance remains open. Source change only; rc.42 executable remains unchanged and does not include this follow-up.
