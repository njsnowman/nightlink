# Optional startup app lock

Settings → Security → Set up app lock enables a local password plus authenticator-code gate. It is off by default. Enrollment requires a password/passphrase of 12–256 characters, a verified six-digit authenticator code, and acknowledgement that eight one-time recovery codes have been saved. The QR code is generated locally; no authentication service or Internet connection is used. Phone and computer clocks must agree. A recovery code replaces the authenticator factor, never the password. A code used during enrollment cannot immediately be reused for unlocking; wait for a fresh code.

## Protection boundary

The lock gates normal application startup before index.html, message history and automatic connection code load. A separate lock document exposes only security status/unlock/verified-entry/quit methods; workspace and radio bridges are not exposed there. Successful verification opens the Overview workspace. Disabling the feature requires both factors. It does not lock an already open session on idle, tray close, or renderer reload, and does not replace Windows sign-in/lock-screen protection.

This is **application access control, not an encrypted history vault**. Existing message/contact files and exported backups are not encrypted by this feature. It does not protect against malware running as the same Windows user, local administrators, a modified client, debugging, or deletion/replacement of the settings file. An absent settings file means the opt-in lock has not been configured. Protect the Windows account and disk separately. Restoring a normal Nightlink JSON backup on another computer does not enroll its startup lock.

## Credential handling

Native security verification uses Node crypto scrypt (N32768, r8, p1, 32-byte key, 16-byte random salt). A fresh12-byte nonce and AES-256-GCM protect the TOTP seed, last accepted step and SHA-256 hashes of random128-bit recovery codes using the password-derived key. The settings envelope is additionally encrypted using Electron safeStorage/Windows DPAPI and stored atomically as security-settings.bin in the existing Meshline profile. There is no plaintext-storage fallback. A protected file that cannot be read/decrypted/schema-validated fails closed. Windows-account changes can make DPAPI material unavailable.

Passwords are not stored. Raw seeds/recovery codes are shown only during enrollment, cleared from the setup DOM on close, and not included by this feature in diagnostic logs or JSON history backups. Copying codes to the clipboard is an explicit user action; the clipboard and authenticator app have their own storage behavior. JavaScript strings cannot be guaranteed to be wiped from process memory. Enrollment expires after five minutes.

TOTP uses RFC6238 SHA1, six digits, 30-second steps with a ±one-step clock window. A step at or below the last accepted step is rejected. Recovery codes are consumed before access is granted, with persistence required for success. Failed verification counts persist across restarts: after five failures, delay starts at30seconds and doubles up to15minutes. Only one verification operation is processed at a time. These limits are application controls and can be circumvented by someone able to tamper with the profile/client. No claim of resistance to a compromised Windows account is made.

Security IPC validates the main window and exact main frame. Remote map frames have no security bridge. The main workspace's existing native action handlers additionally require an unlocked session. The security file and user profile identity are not changed automatically by updating the application.

## Recovery and validation

Save recovery codes outside this computer. They cannot recover a forgotten password. Do not enable the feature without retaining the password and recovery codes. There is no automatic account-recovery service. Unreadable protected settings intentionally keep the application gate closed; data is not erased.

See the matching candidate record for evidence and limitations. Automated validation uses ephemeral profiles and test credentials, not the user's profile or radio. Enrollment, restart and unlock on a normal installed profile are not verified for 0.8.26; the release notes disclose this. This feature has not received an independent security audit.

References:
- https://www.rfc-editor.org/rfc/rfc6238
- https://www.electronjs.org/docs/latest/api/safe-storage/

# Verifying downloads

Nightlink executables are not code-signed. Windows SmartScreen may warn before the first launch. Each GitHub release attaches `SHA256SUMS.txt` with one `<sha256>  <filename>` line for the Setup and Portable executables. The in-app update check does not verify downloads; compare the checksum yourself before running a downloaded file.

In PowerShell, in the download folder:

```powershell
Get-FileHash .\Nightlink-Setup-<version>.exe -Algorithm SHA256
```

The hash must match the `SHA256SUMS.txt` line and the SHA-256 listed in the release notes. Do not run a file whose hash differs.
