import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import test from 'node:test';

const runtime = new URL('../../dashboard/dist/index.js', import.meta.url);

function host() {
  const registrations = new Map();
  const React = {
    Fragment: Symbol('Fragment'),
    createElement(type, props, ...children) {
      return { type, props: props || {}, children };
    },
  };
  const hooks = {
    useState(initial) {
      return [typeof initial === 'function' ? initial() : initial, () => {}];
    },
    useEffect() {},
    useMemo(factory) { return factory(); },
    useCallback(value) { return value; },
    useRef(value) { return { current: value }; },
  };
  const window = {
    location: { search: '?profile=default' },
    __HERMES_INITIAL_PROFILE__: 'default',
    __HERMES_PLUGIN_SDK__: {
      React,
      hooks,
      components: {
        Button: 'Button',
        Select: 'Select',
        SelectOption: 'SelectOption',
      },
      async fetchJSON() { throw new Error('not called during render smoke test'); },
    },
    __HERMES_PLUGINS__: {
      register(id, component) { registrations.set(id, component); },
    },
    setInterval,
    clearInterval,
  };
  return { registrations, window };
}

test('dashboard runtime registers and renders its loading boundary', async () => {
  const source = await readFile(runtime, 'utf8');
  const environment = host();
  vm.runInNewContext(source, { window: environment.window, URLSearchParams }, { filename: 'composer-dashboard.js' });

  const Component = environment.registrations.get('composer-enhancements');
  assert.equal(typeof Component, 'function');
  const tree = Component();
  assert.equal(tree.type, 'main');
  assert.match(tree.props.className, /ce-dashboard/);
});
