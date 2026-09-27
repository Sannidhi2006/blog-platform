import { useState, useEffect, useCallback } from 'react';
import { getHealthStatus } from '../services/api';

export const useHealthCheck = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getHealthStatus();
      setData(res);
      setLastChecked(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Health check error:', err);
      setError(err.response?.data?.message || err.message || 'Unable to connect to backend server');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  return { data, loading, error, lastChecked, refetch: fetchHealth };
};
