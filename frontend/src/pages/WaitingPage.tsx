import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, RefreshCcw, TrendingUp } from 'lucide-react';
import { Button, Container, Card } from 'react-bootstrap';

const WaitingPage = () => {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';
        const response = await fetch(`${API_BASE_URL}/api/admin/status`);
        const data = await response.json();
        
        if (data.open) {
          navigate('/');
        }
        
        // Mock countdown for now
        setTimeLeft({ hours: 0, minutes: 12, seconds: 45 });
      } catch (error) {
        console.error('Failed to fetch platform status', error);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 15000); 
    
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
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: "'Nunito', sans-serif"
    }}>
      <Container className="text-center" style={{ maxWidth: '500px' }}>
        <div style={{
          position: 'relative',
          display: 'inline-block',
          marginBottom: '2rem'
        }}>
          <div style={{
            position: 'absolute',
            inset: '-15px',
            background: 'var(--accent-color)',
            borderRadius: '50%',
            filter: 'blur(30px)',
            opacity: 0.15
          }} />
          <div style={{
            position: 'relative',
            background: 'white',
            padding: '2rem',
            borderRadius: '50%',
            display: 'inline-flex',
            boxShadow: '0 10px 40px rgba(255, 98, 0, 0.1)',
            border: '2px solid rgba(255, 98, 0, 0.05)'
          }}>
            <TrendingUp size={48} color="var(--accent-color)" />
          </div>
        </div>

        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.75rem', color: 'var(--text-primary)', fontFamily: "'Baloo 2', cursive" }}>
          We're Scaling Up!
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', marginBottom: '3rem', maxWidth: '400px', margin: '0 auto 3rem' }}>
          We're expanding our capacity to handle the amazing amount of love you're showing. We'll be ready for you in a moment!
        </p>

        <Card style={{
          background: 'white',
          border: '1px solid var(--border-color)',
          borderRadius: '2rem',
          padding: '2.5rem',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.04)',
          marginBottom: '2.5rem'
        }}>
          <div style={{ marginBottom: '2rem' }}>
             <p style={{ color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
               Quick Tip
             </p>
             <p style={{ color: 'var(--accent-color)', fontSize: '1.25rem', fontWeight: 'bold' }}>
               Best time to join the platform is 9 PM
             </p>
          </div>

          <div style={{ height: '1px', background: 'var(--border-color)', margin: '2rem 0' }} />

          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.25rem' }}>
              Estimated cooldown
            </p>
            <div className="d-flex justify-content-center align-items-center gap-3">
              <TimeBlock label="Hrs" value={timeLeft ? formatTime(timeLeft.hours) : '--'} />
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--border-color)', marginTop: '-1.5rem' }}>:</div>
              <TimeBlock label="Min" value={timeLeft ? formatTime(timeLeft.minutes) : '--'} />
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--border-color)', marginTop: '-1.5rem' }}>:</div>
              <TimeBlock label="Sec" value={timeLeft ? formatTime(timeLeft.seconds) : '--'} />
            </div>
          </div>
        </Card>

        <Button 
          variant="primary" 
          onClick={() => window.location.reload()}
          style={{
            backgroundColor: 'var(--accent-color)',
            borderColor: 'var(--accent-color)',
            padding: '1rem 2.5rem',
            borderRadius: '50px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontWeight: 'bold',
            boxShadow: '0 10px 25px rgba(255, 98, 0, 0.25)'
          }}
        >
          <RefreshCcw size={20} />
          Try Now
        </Button>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '3rem', opacity: 0.7 }}>
          Our server scales based on demand to keep the experience smooth for everyone.
        </p>
      </Container>
    </div>
  );
};

const TimeBlock = ({ label, value }: { label: string; value: string }) => (
  <div className="d-flex flex-column align-items-center">
    <div style={{
      background: 'var(--bg-secondary)',
      borderRadius: '1.25rem',
      padding: '0.75rem 1rem',
      minWidth: '65px',
      fontSize: '1.75rem',
      fontWeight: 'bold',
      color: 'var(--text-primary)',
      fontFamily: 'monospace'
    }}>
      {value}
    </div>
    <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: '800', marginTop: '0.5rem' }}>
      {label}
    </span>
  </div>
);

export default WaitingPage;
