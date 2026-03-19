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

      <Card style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '1.25rem', overflow: 'hidden', borderTop: '4px solid #FF6200', boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
        <Card.Header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #f1f5f9', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1.125rem', color: '#1e293b' }}>
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
                    style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', color: '#1e293b', height: '3.5rem', borderRadius: '0.75rem', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.01)' }} 
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
                    style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', color: '#1e293b', height: '3.5rem', borderRadius: '0.75rem', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.01)' }} 
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
                style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', color: '#94a3b8', height: '3.5rem', borderRadius: '0.75rem' }}
              />
            </Form.Group>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '1rem', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Power color={config?.enabled ? '#10b981' : '#94a3b8'} />
                <div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: '#1e293b' }}>Enable Platform</p>
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

            <Button type="submit" style={{ backgroundColor: '#FF6200', border: 'none', height: '3.5rem', fontWeight: '600', borderRadius: '0.75rem', boxShadow: '0 4px 12px rgba(255, 98, 0, 0.2)' }}>
              Save Configuration
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default AdminSettings;
