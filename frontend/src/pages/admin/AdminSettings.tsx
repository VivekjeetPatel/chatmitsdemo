import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Row, Col } from 'react-bootstrap';
import { Clock, Power } from "lucide-react";

const AdminSettings = () => {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';
        const res = await fetch(`${API_BASE_URL}/api/admin/status`);
        const json = await res.json();
        setConfig(json.config);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleUpdateConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Force Indian Time Zone
      const updatedConfig = { ...config, timezone: 'Asia/Kolkata' };
      const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';
      const res = await fetch(`${API_BASE_URL}/api/admin/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedConfig)
      });
      if (res.ok) {
        alert("Configuration Updated Successfully! The platform relies exclusively on IST.");
        setConfig(updatedConfig);
      }
    } catch (err) {
      alert("Failed to update config.");
    }
  };

  if (loading && !config) return <div style={{ color: '#94a3b8', textAlign: 'center', padding: '5rem' }}>Loading Settings...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', maxWidth: '800px' }}>
      <div>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>Settings</h1>
        <p style={{ color: '#94a3b8' }}>Manage global platform configuration.</p>
      </div>

      <Card style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '1.25rem', overflow: 'hidden', borderTop: '2px solid #FF6200' }}>
        <Card.Header style={{ backgroundColor: 'transparent', borderBottom: '1px solid #1e293b', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1.125rem' }}>
            <Clock size={20} color="#FF6200" />
            Schedule Configuration (IST Only)
          </div>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>Set daily platform availability. Time strictly uses Indian Standard Time (IST).</p>
        </Card.Header>
        <Card.Body style={{ padding: '1.5rem' }}>
          <Form onSubmit={handleUpdateConfig} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <Row>
              <Col>
                <Form.Group>
                  <Form.Label style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Daily Start (IST)</Form.Label>
                  <Form.Control 
                    type="time" 
                    value={config?.dailyStartTime || ""} 
                    onChange={(e) => setConfig({...config, dailyStartTime: e.target.value})}
                    style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', color: 'white', height: '3rem', borderRadius: '0.75rem' }} 
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <Form.Label style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Daily End (IST)</Form.Label>
                  <Form.Control 
                    type="time" 
                    value={config?.dailyEndTime || ""} 
                    onChange={(e) => setConfig({...config, dailyEndTime: e.target.value})}
                    style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', color: 'white', height: '3rem', borderRadius: '0.75rem' }} 
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group>
              <Form.Label style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Timezone Lock</Form.Label>
              <Form.Control 
                type="text"
                readOnly
                value="Asia/Kolkata (IST Restricted)" 
                style={{ backgroundColor: 'rgba(30, 41, 59, 0.3)', border: '1px solid #1e293b', color: '#64748b', height: '3rem', borderRadius: '0.75rem' }}
              />
            </Form.Group>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', backgroundColor: 'rgba(30, 41, 59, 0.3)', borderRadius: '1rem', border: '1px solid #1e293b' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Power color={config?.enabled ? '#10b981' : '#64748b'} />
                <div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem' }}>Enable Platform</p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Allow users to participate.</p>
                </div>
              </div>
              <Form.Check 
                type="switch"
                checked={config?.enabled}
                onChange={(e) => setConfig({...config, enabled: e.target.checked})}
                style={{ fontSize: '1.25rem' }}
              />
            </div>

            <Button type="submit" style={{ backgroundColor: '#FF6200', border: 'none', height: '3rem', fontWeight: 'bold', borderRadius: '0.75rem' }}>
              Update Schedule
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default AdminSettings;
