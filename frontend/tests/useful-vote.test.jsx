import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { act } from 'react';
import { JSDOM } from 'jsdom';
import UsefulVote from '../src/components/forum/useful-vote';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost:3000' });
for (const name of ['window', 'self', 'document', 'HTMLElement', 'HTMLFormElement', 'FormData', 'Event', 'MouseEvent']) {
  Object.defineProperty(globalThis, name, { configurable: true, value: name === 'window' || name === 'self' ? dom.window : dom.window[name] });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
let createRoot;
before(async () => { ({ createRoot } = await import('react-dom/client')); });
after(() => dom.window.close());

function deferred() {
  let resolve, reject;
  const promise = new Promise((done, fail) => { resolve = done; reject = fail; });
  return { promise, resolve, reject };
}

async function mount(vote, save) {
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  const fallback = () => { assert.fail('Hydrated submissions must use the optimistic save.'); };
  const render = async (value) => act(async () => root.render(
    <UsefulVote vote={value} save={save} action={fallback} signInHref="/connexion" />,
  ));
  await render(vote);
  return {
    container,
    button: () => container.querySelector('button'),
    submit: () => act(async () => container.querySelector('form').dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }))),
    render,
    cleanup: async () => { await act(async () => root.unmount()); container.remove(); },
  };
}

test('vote and unvote update immediately, block duplicates and reconcile the server count once', async () => {
  let request = deferred();
  const calls = [];
  const view = await mount({ hasVoted: false, usefulCount: 4 }, useful => { calls.push(useful); return request.promise; });
  try {
    await view.submit();
    assert.equal(view.button().textContent, ' Utile (5)');
    assert.equal(view.button().getAttribute('aria-pressed'), 'true');
    assert.equal(view.button().disabled, true);
    await view.submit();
    assert.deepEqual(calls, [true]);

    // Another member also voted while this request was pending. The RSC refresh
    // includes both votes; rebasing the optimistic state must not count ours twice.
    await view.render({ hasVoted: true, usefulCount: 6 });
    assert.equal(view.button().textContent, ' Utile (6)');
    await act(async () => request.resolve({ error: null }));
    assert.equal(view.button().textContent, ' Utile (6)');
    assert.equal(view.button().disabled, false);

    request = deferred();
    await view.submit();
    assert.equal(view.button().textContent, ' Utile (5)');
    assert.equal(view.button().getAttribute('aria-pressed'), 'false');
    assert.deepEqual(calls, [true, false]);
    await view.render({ hasVoted: false, usefulCount: 5 });
    await act(async () => request.resolve({ error: null }));
    assert.equal(view.button().textContent, ' Utile (5)');
    assert.equal(view.button().disabled, false);
  } finally { await view.cleanup(); }
});

test('an expired session rolls back the optimistic vote and offers reconnection', async () => {
  const request = deferred();
  const view = await mount({ hasVoted: false, usefulCount: 0 }, () => request.promise);
  try {
    await view.submit();
    assert.equal(view.button().textContent, ' Utile (1)');
    await act(async () => request.resolve({ error: 'Votre session a expiré.', signIn: true }));
    assert.equal(view.button().textContent, ' Utile (0)');
    assert.equal(view.button().getAttribute('aria-pressed'), 'false');
    assert.equal(view.button().disabled, false);
    assert.match(view.container.querySelector('[role="alert"]').textContent, /session a expiré/);
    assert.equal(view.container.querySelector('a').getAttribute('href'), '/connexion');
  } finally { await view.cleanup(); }
});

test('a transport failure rolls back an unvote and permits a successful retry', async () => {
  let request = deferred();
  const view = await mount({ hasVoted: true, usefulCount: 1 }, () => request.promise);
  try {
    await view.submit();
    assert.equal(view.button().textContent, ' Utile (0)');
    await act(async () => request.reject(new TypeError('Failed to fetch')));
    assert.equal(view.button().textContent, ' Utile (1)');
    assert.equal(view.button().getAttribute('aria-pressed'), 'true');
    assert.equal(view.button().disabled, false);
    assert.match(view.container.querySelector('[role="alert"]').textContent, /pas pu être confirmé/);

    request = deferred();
    await view.submit();
    assert.equal(view.container.querySelector('[role="alert"]'), null);
    await view.render({ hasVoted: false, usefulCount: 0 });
    await act(async () => request.resolve({ error: null }));
    assert.equal(view.button().textContent, ' Utile (0)');
  } finally { await view.cleanup(); }
});
