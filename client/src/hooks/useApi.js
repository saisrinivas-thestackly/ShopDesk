import { useCallback, useEffect, useRef, useState } from 'react';
import { getErrorMessage } from '../api/client';

export function useApi(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  const reload = useCallback(() => {
    let ignore = false;
    setLoading(true);
    setError('');
    fetcherRef
      .current()
      .then((result) => !ignore && setData(result))
      .catch((err) => !ignore && setError(getErrorMessage(err)))
      .finally(() => !ignore && setLoading(false));
    return () => {
      ignore = true;
    };
  }, []);

  const depsKey = JSON.stringify(deps);
  useEffect(() => reload(), [reload, depsKey]);

  return { data, setData, loading, error, reload };
}
