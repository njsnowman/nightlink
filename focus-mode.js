/* Layout preference shared by Cards and Terminal in the main window. */
(function () {
  const key = 'nightlink.focus-mode';
  const root = document.documentElement;
  let focused = false;
  try { focused = localStorage.getItem(key) === 'true'; } catch {}
  root.toggleAttribute('data-focus-mode', focused);

  document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('focus-mode-toggle');
    const sidebar = document.getElementById('workspace-sidebar');
    const menu = document.getElementById('term-menubar');
    const keyLabel = toggle.querySelector('.focus-mode-key');

    function updateToggle() {
      const terminal = window.NightlinkInterface.isTerminal();
      const navigation = terminal ? menu : sidebar;
      toggle.setAttribute('aria-controls', navigation.id);
      toggle.setAttribute('aria-expanded', String(!focused));
      const label = (focused ? 'Show ' : 'Hide ') + (terminal ? 'menu bar' : 'sidebar');
      toggle.setAttribute('aria-label', label);
      toggle.title = label + ' (Ctrl+B)';
      keyLabel.textContent = focused ? 'Menu' : 'Focus';
    }

    function switchMode() {
      const navigationHadFocus = sidebar.contains(document.activeElement) || menu.contains(document.activeElement);
      const log = [...document.querySelectorAll('#mrc-log, #chat-log')].find(el => el.clientHeight);
      const bottom = log && log.scrollHeight - log.clientHeight - log.scrollTop <= 1;
      const top = log?.getBoundingClientRect().top;
      const anchor = log?.scrollTop > 0 && !bottom
        ? Array.from(log.children).find(row => row.getBoundingClientRect().bottom > top)
        : null;
      const offset = anchor && anchor.getBoundingClientRect().top - top;

      focused = !focused;
      root.toggleAttribute('data-focus-mode', focused);
      updateToggle();
      if (navigationHadFocus) toggle.focus({preventScroll: true});
      if (bottom) log.scrollTop = log.scrollHeight;
      if (anchor) log.scrollTop += anchor.getBoundingClientRect().top - log.getBoundingClientRect().top - offset;
      try { localStorage.setItem(key, String(focused)); } catch {}
    }

    toggle.addEventListener('click', switchMode);
    window.addEventListener('nightlink-interface', updateToggle);
    document.addEventListener('keydown', event => {
      if (event.defaultPrevented || event.isComposing || !event.ctrlKey || event.altKey ||
          event.metaKey || event.shiftKey || event.key.toLowerCase() !== 'b' ||
          event.target.closest?.('input, textarea, select, [contenteditable]:not([contenteditable=false])') ||
          document.querySelector('dialog[open]')) return;
      event.preventDefault();
      if (!event.repeat) switchMode();
    });
    updateToggle();
  });
})();
