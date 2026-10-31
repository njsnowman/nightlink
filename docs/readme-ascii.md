# Nightlink README ASCII graphics

Ready-to-paste blocks for README.md. Pure 7-bit ASCII, at most 80 columns. Labels come from the 0.8.26 source; middle dots in source labels are shown as hyphens.

Nightlink banner.

```text
##   ##  ####   #####   ##   ##  ######  ##      ####  ##   ##  ##  ##
###  ##   ##   ##       ##   ##    ##    ##       ##   ###  ##  ## ##
## # ##   ##   ## ####  #######    ##    ##       ##   ## # ##  ####
##  ###   ##   ##   ##  ##   ##    ##    ##       ##   ##  ###  ## ##
##   ##  ####   #####   ##   ##    ##    ######  ####  ##   ##  ##  ##

        (( o ))          o-----o-----o
          |              |    / \    |
         [=]   ~~~~~~~   o---o   o---o

  Windows desktop client for MeshCore companion radios
  Bluetooth LE or USB serial | local message history
```

Overview layout: messages, splitter and map, with the Signal Rail above the conversation.

```text
+------------------------------------------------------------------------+
| Overview  Messages  Network  Contacts  Radio          [ Connect radio v]|
+------------------------------------------------------------------------+
| Network overview.                                                      |
+-----------------------------------+--+---------------------------------+
| #channel                          |  |  [CoreScope] [Radio map]        |
| [o LINK] [o RX] [o TX] [o ACK]    |::|                                 |
| [o FAULT]  Ready - standing by    |::|          o                      |
|-----------------------------------|::|      o       o---o              |
| peer-a:  message text             |::|        \    /                   |
|                  you: reply  ACK  |::|         o--o                    |
|                                   |::|                                 |
| [ composer .................. ]   |  |                                 |
+-----------------------------------+--+---------------------------------+
  messages pane                splitter            map pane
  (drag, Left/Right arrows, Home/End, Enter or double-click restores)
```

Signal Rail cells and the state labels defined in chat-signals.js.

```text
Rail cells:  LINK  RX  TX  ACK  FAULT

  state          label shown
  -------------  ---------------------------------------
  offline        Radio disconnected
  syncing        Synchronizing radio
  standby        Ready - standing by
  receive        Incoming message
  queued         Queued - waiting for radio
  sending        Sending to radio
  retrying       Retrying transmission
  awaiting       Awaiting recipient ACK
  acknowledged   Recipient acknowledged
  broadcast      Broadcast accepted by radio
  unconfirmed    No recipient ACK - delivery unconfirmed
  error          Send error - delivery unconfirmed
  not-sent       Not sent - radio rejected request
  cancelled      Cancelled - delivery unconfirmed
  interrupted    Interrupted - delivery unconfirmed
```

Device Center flow, using the button labels in device-management-ui.js.

```text
 Radio > Device Center
   |
   v
 [Inspect settings] ---> current values read from the target
   |                     (remote: [Log in] first; USB: [Connect USB])
   v
 Stage edits in the form   (or "Stage settings file"; a file from a
   |                        different device shows a warning)
   v
 [Review staged changes] ---> "Review changes": before -> after table
   |                          [Back to editing] returns to the form
   v
 [Apply reviewed changes] ---> pre-check: values unchanged since Inspect
   |
   v
 Readback per setting ---> verified | sent / unverified | not sent
```

Radio contact removal: single and bulk, each verified by exact public key.

```text
 Single contact
   Contact card > More > [Remove from radio]
     -> confirm -> radio removes full key
     -> exact-key lookup must return "not found"
     -> removed; saved messages and personal details kept

 Bulk (Nodes or Radio Tools)
   [Remove all except favorites]
     -> preview:  "Review contacts to remove" | "Favorites to keep"
     -> tick acknowledgement -> [Remove non-favorites]
     -> for each contact, one at a time:
          remove -> exact-key verify -> next
     -> [Stop after current contact] stops cleanly
     -> favorites, saved messages and cards stay on this computer
```

Connection path: PC to companion radio to the MeshCore mesh.

```text
   +-----------+   Bluetooth LE    +-----------+
   | Windows   |<=================>| companion |
   | PC        |   or USB serial   | radio     |
   | Nightlink |                   +-----+-----+
   +-----------+                         | LoRa
                                         v
              +----------+        +----------+        +----------+
   peer o ----| repeater |--------| repeater |--------| room     |
              +----------+        +----------+        +----------+
                   |                                       |
                peer o                                  peer o
```
