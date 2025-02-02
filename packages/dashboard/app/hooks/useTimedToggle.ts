import { useCallback, useState } from "react";

export function useTimedToggle(duration: number) {
  const [state, setState] = useState(false);

  const toggle = useCallback(() => {
    setState(true);
    setTimeout(() => setState(false), duration);
  }, [duration]);

  return [state, toggle] as const;
}
