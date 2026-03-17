import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Table, Badge } from 'react-bootstrap';
import { Clock, Users, Globe, Play, Power, ExternalLink, RefreshCw } from "lucide-react";

const AdminDashboard = () => {
  const [config, setConfig] = useState<any>(null);
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';
        const [configRes, usersRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/admin/status`),
          fetch(`${API_BASE_URL}/api/admin/users/active`)
        ]);
        const configData = await configRes.json();
        const usersData = await usersRes.json();
        
        setConfig(configData.config);
        setActiveUsers(usersData);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    e.preventDefault();
    try {
      const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';
      const res = await fetch(`${API_BASE_URL}/api/admin/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      if (res.ok) {
        alert("Configuration Updated Successfully!");
      }
    } catch (err) {
      alert("Failed to update config.");
    }
  };

  if (loading && !config) return <div style={{ color: '#94a3b8', textAlign: 'center', padding: '5rem' }}>Loading Dashboard...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', letterSpacing: '-0.025em' }}>System Status</h1>
          <p style={{ color: '#94a3b8' }}>Monitor real-time platform metrics and schedule.</p>
        </div>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem', 
          backgroundColor: '#0f172a', 
          border: '1px solid #1e293b', 
          padding: '0.5rem 1rem', 
          borderRadius: '1rem' 
        }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: config?.enabled ? '#10b981' : '#ef4444',
            boxShadow: config?.enabled ? '0 0 10px rgba(16, 185, 129, 0.4)' : 'none'
          }} />
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{config?.enabled ? 'Operational' : 'Maintenance'}</span>
        </div>
      </div>

      <Row className="g-4">
        <Col lg={6}>
          <Card style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '1.25rem', overflow: 'hidden', height: '100%', borderTop: '2px solid #6366f1' }}>
            <Card.Header style={{ backgroundColor: 'transparent', borderBottom: '1px solid #1e293b', padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1.125rem' }}>
                <Clock size={20} color="#818cf8" />
                Schedule Configuration
              </div>
              <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>Set daily platform availability.</p>
            </Card.Header>
            <Card.Body style={{ padding: '1.5rem' }}>
              <Form onSubmit={handleUpdateConfig} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <Row>
                  <Col>
                    <Form.Group>
                      <Form.Label style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Daily Start</Form.Label>
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
                      <Form.Label style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Daily End</Form.Label>
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
                  <Form.Label style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Timezone</Form.Label>
                  <Form.Select 
                    value={config?.timezone} 
                    onChange={(e) => setConfig({...config, timezone: e.target.value})}
                    style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', color: 'white', height: '3rem', borderRadius: '0.75rem' }}
                  >
                    <option value="UTC">UTC (Universal)</option>
                    <option value="America/New_York">EST (Eastern)</option>
                    <option value="Asia/Kolkata">IST (Indian)</option>
                    <option value="Europe/London">GMT (London)</option>
                  </Form.Select>
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

                <Button type="submit" style={{ backgroundColor: '#4f46e5', border: 'none', height: '3rem', fontWeight: 'bold', borderRadius: '0.75rem' }}>
                  Update Schedule
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '1.25rem', overflow: 'hidden', height: '100%', borderTop: '2px solid #10b981' }}>
            <Card.Header style={{ backgroundColor: 'transparent', borderBottom: '1px solid #1e293b', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1.125rem' }}>
                <Users size={20} color="#34d399" />
                Active User Queue
              </div>
              <Badge style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                {activeUsers.length} Users
              </Badge>
            </Card.Header>
            <Card.Body style={{ padding: 0 }}>
              <div style={{ maxHeight: '450px', overflowY: 'auto' }}>
                <Table variant="dark" hover style={{ marginBottom: 0 }}>
                  <thead style={{ position: 'sticky', top: 0, backgroundColor: '#0f172a', borderBottom: '2px solid #1e293b' }}>
                    <tr>
                      <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>ID</th>
                      <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>Filters</th>
                      <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeUsers.length === 0 ? (
                      <tr>
                        <td colSpan={3} style={{ textAlign: 'center', padding: '3rem', color: '#475569', fontStyle: 'italic' }}>Queue is empty</td>
                      </tr>
                    ) : (
                      activeUsers.map(user => (
                        <tr key={user.userId} style={{ cursor: 'default' }}>
                          <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                            <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#818cf8' }}>{user.userId.slice(0, 8)}...</span>
                          </td>
                          <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                              {user.filters?.gender?.map((f: string) => (
                                <span key={f} style={{ fontSize: '0.625rem', backgroundColor: '#1e293b', padding: '2px 6px', borderRadius: '4px', border: '1px solid #334155' }}>{f}</span>
                              ))}
                              {(!user.filters?.gender || user.filters.gender.length === 0) && <span style={{ fontSize: '0.75rem', color: '#475569' }}>None</span>}
                            </div>
                          </td>
                          <td style={{ padding: '1rem', verticalAlign: 'middle', color: '#94a3b8', fontSize: '0.75rem' }}>
                            {new Date(user.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;
