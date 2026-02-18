import { useState, useCallback } from "react";

export function useAsync(fn) {
  const [state, setState] = useState({ data: null, loading: false, error: null });

  const run = useCallback(async (...args) => {
    setState({ data: null, loading: true, error: null });
    try {
      const data = await fn(...args);
      setState({ data, loading: false, error: null });
      return data;
    } catch (err) {
      setState({ data: null, loading: false, error: err.message });
      throw err;
    }
  }, [fn]);

  return { ...state, run };
}

export function useSession() {
  const [sessionId] = useState(() =>
    crypto.randomUUID?.() || Math.random().toString(36).slice(2)
  );
  return sessionId;
}
