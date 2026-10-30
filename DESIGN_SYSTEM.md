# Nightlink visual standard

Owner-approved reference: the Radio Tools panel in rc.11. This is the default for every existing and future page, dialog, menu and detached window.

Use the existing user-selected accent and black/console palette. Main content uses quiet bordered cards with 14-pixel corners; controls use 9-pixel corners; dialogs use 20-pixel corners. Surfaces have subtle contrast, not decorative console corner brackets or glow. Keep functional primary actions in the accent color and secondary controls visibly bordered. Destructive actions and delivery states retain their semantic colors.

Use a 4/8/12/16/24 spacing rhythm, aligned content edges and vertically centered control contents. Page and section titles use clear weight and restrained negative letter spacing. Supporting copy is readable and subordinate; respect enlarged text. Use matching thin SVG line icons, never a mix of decorative emoji and mismatched symbols for new interface actions. Every icon action needs an accessible name.

Group related actions under meaningful labels. The entire action card is the button. Use short descriptions when they clarify a choice. Put maintenance and destructive operations in a separate section with existing confirmation flows intact. Do not invent connection, signal or progress evidence for decoration.

nightlink-design.css is the final shared presentation layer in index.html, dm.html and security-lock.html. Its tokens are the source for new shared surfaces and controls. Component files own layouts and behavior; extend a shared style before adding one-off overrides. Keep the approved Radio Tools landing panel visually stable.

Validate representative Overview, Messages, Network, Contacts, Radio, Settings, dialogs and menus at desktop and compact sizes with enlarged text. Check keyboard focus, scrolling, long labels and outgoing/incoming distinction. Detached DMs and the startup lock must load the same shared layer. Never initiate radio activity simply to render a view or take a screenshot. Automated fixtures use synthetic radios; separate physical evidence from layout checks.

Submenus are included at every depth: contact options, message actions, sidebar tools, terminal, discovery results, inbox/outbox, identity comparison, import/export, confirmation dialogs and expandable sections. nightlink-design.js adds matching decorative line icons to existing action buttons and dialog headers while preserving their DOM controls, accessible names and event handlers. Do not create a separate appearance for deeper menu levels.
