import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const usePlatformStatus = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkStatus = async () => {
      // Don't redirect if we are on admin or waiting pages
      if (location.pathname.startsWith('/admin') || location.pathname === '/waiting') {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/admin/status');
        const data = await response.json();
        
        setIsOpen(data.open);
        if (!data.open) {
          navigate('/waiting');
        }
      } catch (error) {
        console.error('Status check failed', error);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
    // Re-check periodically
    const interval = setInterval(checkStatus, 60000); 
    return () => clearInterval(interval);
  }, [navigate, location.pathname]);

  return { isOpen, loading };
};
