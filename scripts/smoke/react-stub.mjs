const internals = {
  hookState: [],
  effects: [],
  hookIndex: 0,
};

function ensureSlot(index, createValue) {
  if (!(index in internals.hookState)) {
    internals.hookState[index] = createValue();
  }
  return internals.hookState[index];
}

export function resetHooks() {
  internals.hookIndex = 0;
  internals.effects = [];
}

export function resetRuntime() {
  internals.hookState = [];
  internals.effects = [];
  internals.hookIndex = 0;
}

export function flushEffects() {
  const pending = internals.effects.slice();
  internals.effects = [];
  const cleanups = [];
  for (const effect of pending) {
    const cleanup = effect();
    if (typeof cleanup === "function") {
      cleanups.push(cleanup);
    }
  }
  return () => {
    for (const cleanup of cleanups.reverse()) {
      cleanup();
    }
  };
}

export function getHookState() {
  return internals.hookState;
}

export function useState(initialValue) {
  const index = internals.hookIndex++;
  const value = ensureSlot(index, () =>
    typeof initialValue === "function" ? initialValue() : initialValue,
  );
  const setValue = (nextValue) => {
    internals.hookState[index] =
      typeof nextValue === "function"
        ? nextValue(internals.hookState[index])
        : nextValue;
  };
  return [value, setValue];
}

export function useRef(initialValue) {
  const index = internals.hookIndex++;
  return ensureSlot(index, () => ({ current: initialValue }));
}

export function useEffect(effect) {
  internals.hookIndex++;
  internals.effects.push(effect);
}

export function useCallback(callback) {
  internals.hookIndex++;
  return callback;
}

export function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...(props || {}),
      children,
    },
  };
}

export const Fragment = Symbol.for("solara.smoke.fragment");
export function lazy(loader) {
  return { __lazy: true, loader };
}
export function Suspense(props) {
  return props?.children ?? null;
}

export default {
  useState,
  useRef,
  useEffect,
  useCallback,
  createElement,
  Fragment,
  lazy,
  Suspense,
};
