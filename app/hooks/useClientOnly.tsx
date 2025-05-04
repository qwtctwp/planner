import { useState, useEffect } from 'react';

export default function useClientOnly<T>(initialValue: T): [T, boolean] {
  const [value, setValue] = useState<T>(initialValue);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return [value, isClient];
} 