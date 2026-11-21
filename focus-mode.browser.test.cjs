const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const {chromium} = require(process.env.NIGHTLINK_PLAYWRIGHT || 'playwright');

const origin = 'http://127.0.0.1:4173';
const dimensions = locator => locator.evaluate(el => ({
  width: el.clientWidth,
  height: el.clientHeight,
  left: el.getBoundingClientRect().left,
  top: el.getBoundingClientRect().top
}));

async function checkInterface(browser, mode) {
  const page = await browser.newPage({viewport: {width: 1320, height: 860}});
  try {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(mode => { try { localStorage.setItem('nightlink.interface', mode); } catch {} }, mode);
    await page.route('**/*', async route => {
      const url = new URL(route.request().url());
      if (url.origin !== origin) return route.abort();
      const file = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
      const types = {'.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html'};
      try {
        await route.fulfill({body: await fs.readFile(path.join(__dirname, file)),
          contentType: types[path.extname(file)]});
      } catch { await route.fulfill({status: 404, body: ''}); }
    });
    await page.goto(origin);
    const terminal = mode === 'terminal';
    const navigation = page.locator(terminal ? '#term-menubar' : '#workspace-sidebar');
    const toggle = page.locator('#focus-mode-toggle');
    const main = page.locator('main');
    const full = await dimensions(main);
    assert.equal(await navigation.isVisible(), true);
    assert.equal(await toggle.getAttribute('aria-controls'), await navigation.getAttribute('id'));

    await navigation.locator('button').first().focus();
    await page.keyboard.press('Control+b');
    assert.equal(await navigation.isVisible(), false);
    assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
    assert.match(await toggle.getAttribute('aria-label'), /^Show /);
    assert.equal(await toggle.evaluate(el => el === document.activeElement), true);
    const focused = await dimensions(main);
    if (terminal) {
      assert.equal(focused.top, 0);
      assert.ok(focused.height > full.height);
    } else {
      assert.equal(focused.left, 0);
      assert.equal(focused.width, 1320);
      assert.ok(focused.width > full.width);
    }

    await page.reload();
    assert.equal(await navigation.isVisible(), false);
    assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
    await toggle.press('Enter');
    assert.deepEqual(await dimensions(main), full);
    assert.equal(await navigation.isVisible(), true);
    await toggle.press('Space');
    assert.equal(await navigation.isVisible(), false);
    assert.equal(await toggle.evaluate(el => getComputedStyle(el).outlineStyle), 'solid');

    await page.setViewportSize({width: 760, height: 560});
    await page.evaluate(() => setCompact(true, false, false));
    await toggle.click();
    await toggle.click();
    assert.equal(await page.locator('body').evaluate(el => el.classList.contains('compact')), true);
    const button = await toggle.boundingBox();
    assert.ok(button.x >= 0 && button.x + button.width <= 760);

    await page.evaluate(() => {
      window.radioRequests = [];
      radioSession.request = ble.command = async () => { radioRequests.push('unexpected radio request'); };
      live.identity = {key: 'ff'.repeat(32), name: 'Focus fixture', frequency: 910.525, txPower: 20};
      live.sync = 'ready';
      live.channels = [{kind: 'channel', slot: 0, id: 'ab'.repeat(12), name: 'Public'}];
      live.channels.push({kind: 'channel', slot: 1, id: 'cd'.repeat(12), name: 'Other'});
      view('Nodes');
      radioSession.dispatchEvent(new CustomEvent('message', {detail: {
        kind: 'channel', slot: 1, text: 'Peer: Background message', timestamp: 10,
        pathLength: 0, textType: 0
      }}));
      live.selected = live.channels[0];
      view('Messages');
    });
    const input = page.locator(terminal ? '#mrc-input' : '#message-input');
    await input.fill('Unsent focus draft');
    await input.press('Control+b');
    assert.equal(await navigation.isVisible(), false, 'editing keeps the keyboard shortcut local');
    const snapshot = () => page.evaluate(() => [
      current, live.selected?.id, live.identity?.key, live.sync,
      ensureAttention().unread(live.messages).length, radioRequests.slice()
    ]);
    const before = await snapshot();
    assert.ok(before[4] > 0, 'the background channel has unread messages');
    const log = page.locator(terminal ? '#mrc-log' : '#chat-log');
    await log.evaluate(el => {
      for (let i = 0; i < 60; i++) {
        const row = document.createElement('p');
        row.textContent = 'Focus test scrollback row ' + i;
        el.append(row);
      }
      el.scrollTop = 220;
    });
    const scrollTop = await log.evaluate(el => el.scrollTop);
    assert.ok(scrollTop > 0);
    await toggle.click();
    assert.equal(await input.inputValue(), 'Unsent focus draft');
    assert.deepEqual(await snapshot(), before);
    assert.equal(await log.evaluate(el => el.scrollTop), scrollTop);

    await page.evaluate(() => view('Network map'));
    await page.locator('#network-radio').click();
    await page.waitForFunction(() => networkStreetMap.getContainer().clientWidth > 0 &&
      networkStreetMap.getSize().x === networkStreetMap.getContainer().clientWidth);
    const mapSize = await page.evaluate(() => ({...networkStreetMap.getSize()}));
    await toggle.click();
    await page.waitForFunction(before => {
      const container = networkStreetMap.getContainer();
      return networkStreetMap.getSize().x === container.clientWidth &&
        networkStreetMap.getSize().y === container.clientHeight &&
        (container.clientWidth > before.x || container.clientHeight > before.y);
    }, mapSize);
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }
}

(async () => {
  const browser = await chromium.launch({headless: true, executablePath: process.env.NIGHTLINK_BROWSER});
  try {
    for (const mode of ['cards', 'terminal']) {
      await checkInterface(browser, mode);
      console.log('PASS Focus Mode in ' + mode);
    }
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
