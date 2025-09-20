
'use client';

import { useState, useEffect } from 'react';

/**
 * A custom hook that returns `true` only after the component has mounted on the client.
 * This is useful for preventing hydration mismatches by deferring the rendering of
 * client-side only UI until after the initial server render.
 * @returns {boolean} `true` if the component has mounted, otherwise `false`.
 */
export function useHasMounted(): boolean {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return hasMounted;
}
