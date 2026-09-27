import { useState, useEffect, useRef, useCallback } from 'react';

export function useApi(apiFn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const callIdRef = useRef(0);
  const apiFnRef = useRef(apiFn);

  useEffect(() => {
    apiFnRef.current = apiFn;
  });

  const fetchData = useCallback(() => {
    const currentId = ++callIdRef.current;

    Promise.resolve()
      .then(() => apiFnRef.current())
      .then((res) => {
        if (currentId === callIdRef.current) {
          setData(res);
          setLoading(false);
          setError(null);
        }
      })
      .catch((err) => {
        if (currentId === callIdRef.current) {
          setError(err);
          setLoading(false);
        }
      });
  }, []);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, reload: fetchData };
}
