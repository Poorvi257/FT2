import { useEffect, useRef, useState } from "react";

export function useAsyncData(loader, deps) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const requestIdRef = useRef(0);

  useEffect(() => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setLoading(true);
    setError("");
    setData(null);

    loader()
      .then((result) => {
        if (requestIdRef.current === requestId) {
          setData(result);
        }
      })
      .catch((err) => {
        if (requestIdRef.current === requestId) {
          setError(err.message || "Failed to load");
        }
      })
      .finally(() => {
        if (requestIdRef.current === requestId) {
          setLoading(false);
        }
      });
  }, deps);

  return { data, loading, error, setData };
}
