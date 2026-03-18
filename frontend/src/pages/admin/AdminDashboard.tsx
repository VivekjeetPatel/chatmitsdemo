import React, { useState, useEffect } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { Users, Activity, MessageCircle, Power, Clock } from "lucide-react";

const AdminDashboard = () => {
  const [config, setConfig] = useState<any>(null);
  const [usersInfo, setUsersInfo] = useState<any>(null);
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
        
        setConfig(configData);
        setUsersInfo(usersData);
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

  if (loading && !config) return <div style={{ color: '#94a3b8', textAlign: 'center', padding: '5rem' }}>Loading Dashboard...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', letterSpacing: '-0.025em' }}>Platform Overview</h1>
          <p style={{ color: '#94a3b8' }}>High-level metrics for ChatMITS.</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
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
              backgroundColor: config?.open ? '#10b981' : '#ef4444',
              boxShadow: config?.open ? '0 0 10px rgba(16, 185, 129, 0.4)' : 'none'
            }} />
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{config?.open ? 'Platform Open' : 'Platform Closed'}</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
             {config?.config?.dailyStartTime} to {config?.config?.dailyEndTime} (IST)
          </span>
        </div>
      </div>

      <Row className="g-4">
        <Col xl={3} md={6}>
          <Card style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '1.25rem', padding: '1.5rem', borderTop: '2px solid #3b82f6' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
               <div style={{ padding: '0.75rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '0.75rem' }}>
                 <Users size={24} color="#3b82f6" />
               </div>
               <div>
                 <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.875rem', fontWeight: 600 }}>Total Connected</p>
                 <h2 style={{ margin: 0, fontWeight: 'bold' }}>{usersInfo?.totalUsersInPlatform || 0}</h2>
               </div>
            </div>
          </Card>
        </Col>

        <Col xl={3} md={6}>
          <Card style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '1.25rem', padding: '1.5rem', borderTop: '2px solid #FF6200' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
               <div style={{ padding: '0.75rem', backgroundColor: 'rgba(255, 98, 0, 0.1)', borderRadius: '0.75rem' }}>
                 <MessageCircle size={24} color="#FF6200" />
               </div>
               <div>
                 <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.875rem', fontWeight: 600 }}>Active Chats</p>
                 <h2 style={{ margin: 0, fontWeight: 'bold' }}>{usersInfo?.chattingUsers?.length || 0}</h2>
               </div>
            </div>
          </Card>
        </Col>

        <Col xl={3} md={6}>
          <Card style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '1.25rem', padding: '1.5rem', borderTop: '2px solid #10b981' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
               <div style={{ padding: '0.75rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '0.75rem' }}>
                 <Activity size={24} color="#10b981" />
               </div>
               <div>
                 <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.875rem', fontWeight: 600 }}>Queue Size</p>
                 <h2 style={{ margin: 0, fontWeight: 'bold' }}>{usersInfo?.queueUsers?.length || 0}</h2>
               </div>
            </div>
          </Card>
        </Col>

        <Col xl={3} md={6}>
          <Card style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '1.25rem', padding: '1.5rem', borderTop: '2px solid #8b5cf6' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
               <div style={{ padding: '0.75rem', backgroundColor: 'rgba(139, 92, 246, 0.1)', borderRadius: '0.75rem' }}>
                 <Clock size={24} color="#8b5cf6" />
               </div>
               <div>
                 <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.875rem', fontWeight: 600 }}>Idle Users</p>
                 <h2 style={{ margin: 0, fontWeight: 'bold' }}>{usersInfo?.idleUsers?.length || 0}</h2>
               </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;
