import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Lock, RefreshCcw } from 'lucide-react';
import { Button, Container, Row, Col, Card } from 'react-bootstrap';

const WaitingPage = () => {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);
  const [openingTime, setOpeningTime] = useState<string>('8:00 PM');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/admin/status');
        const data = await response.json();
        
        if (data.open) {
          navigate('/');
        }
        
        const config = data.config;
        setOpeningTime(config.dailyStartTime);
        
        // Mock countdown for now
        setTimeLeft({ hours: 5, minutes: 42, seconds: 18 });
      } catch (error) {
        console.error('Failed to fetch platform status', error);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); 
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (!prev) return null;
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) seconds--;
        else if (minutes > 0) { minutes--; seconds = 59; }
        else if (hours > 0) { hours--; minutes = 59; seconds = 59; }
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timer);
    };
  }, [navigate]);

  const formatTime = (val: number) => val.toString().padStart(2, '0');

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#020617',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <Container className="text-center" style={{ maxWidth: '500px' }}>
        <div style={{
          position: 'relative',
          display: 'inline-block',
          marginBottom: '2rem'
        }}>
          <div style={{
            position: 'absolute',
            inset: '-10px',
            background: 'linear-gradient(to right, #2563eb, #06b6d4)',
            borderRadius: '50%',
            filter: 'blur(20px)',
            opacity: 0.3
          }} />
          <div style={{
            position: 'relative',
            background: '#0f172a',
            padding: '2rem',
            borderRadius: '50%',
            display: 'inline-flex',
            border: '1px solid #1e293b'
          }}>
            <Lock size={48} color="#60a5fa" />
          </div>
        </div>

        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Platform is closed</h1>
        <p style={{ color: '#94a3b8', fontSize: '1.25rem', fontStyle: 'italic', marginBottom: '2.5rem' }}>We'll be back soon!</p>

        <Card style={{
          background: 'rgba(15, 23, 42, 0.5)',
          border: '1px solid #1e293b',
          borderRadius: '1.5rem',
          padding: '2rem',
          backdropFilter: 'blur(8px)',
          marginBottom: '2rem'
        }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              Today's Session Starts At
            </p>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#60a5fa', fontFamily: 'monospace' }}>
              {openingTime}
            </p>
          </div>

          <div style={{ height: '1px', background: '#1e293b', margin: '1.5rem 0' }} />

          <div>
            <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: '500', marginBottom: '1rem' }}>Please visit after:</p>
            <div className="d-flex justify-content-center align-items-center gap-3">
              <TimeBlock label="Hrs" value={timeLeft ? formatTime(timeLeft.hours) : '--'} />
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1e293b' }}>:</div>
              <TimeBlock label="Min" value={timeLeft ? formatTime(timeLeft.minutes) : '--'} />
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1e293b' }}>:</div>
              <TimeBlock label="Sec" value={timeLeft ? formatTime(timeLeft.seconds) : '--'} />
            </div>
          </div>
        </Card>

        <Button 
          variant="outline-light" 
          onClick={() => window.location.reload()}
          style={{
            borderColor: '#334155',
            color: '#94a3b8',
            padding: '0.75rem 2rem',
            borderRadius: '0.75rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <RefreshCcw size={18} />
          Refresh Status
        </Button>

        <p style={{ color: '#475569', fontSize: '0.75rem', marginTop: '2rem' }}>
          Platform availability is scheduled to ensure a high-quality matchmaking experience.
        </p>
      </Container>
    </div>
  );
};

const TimeBlock = ({ label, value }: { label: string; value: string }) => (
  <div className="d-flex flex-column align-items-center">
    <div style={{
      background: 'rgba(30, 41, 59, 0.8)',
      border: '1px solid #334155',
      borderRadius: '1rem',
      padding: '0.75rem 1rem',
      minWidth: '70px',
      fontSize: '2rem',
      fontWeight: 'bold',
      fontFamily: 'monospace'
    }}>
      {value}
    </div>
    <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 'bold', marginTop: '0.5rem' }}>
      {label}
    </span>
  </div>
);

export default WaitingPage;
