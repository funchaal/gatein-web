import { useRef } from "react";

/**
 * usePersistFn
 * alternativa ao useCallback para manter referência estável
 */
export function usePersistFn(fn) {
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const persistFn = useRef(null);

  if (!persistFn.current) {
    persistFn.current = function (...args) {
      return fnRef.current.apply(this, args);
    };
  }

  return persistFn.current;
}
