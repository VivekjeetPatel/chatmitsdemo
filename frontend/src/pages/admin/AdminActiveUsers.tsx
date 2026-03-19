import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Row, Col } from 'react-bootstrap';
import { Users, Activity, Coffee, MessageCircle } from "lucide-react";

const AdminActiveUsers = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';
        const res = await fetch(`${API_BASE_URL}/api/admin/users/active`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
    const interval = setInterval(fetchUsers, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) return <div style={{ color: '#94a3b8', textAlign: 'center', padding: '5rem' }}>Loading Users...</div>;

  const renderFiltersList = (filters: any) => {
    if (!filters) return <span style={{ fontSize: '0.75rem', color: '#64748b' }}>None</span>;
    const all: string[] = [];
    ['gender', 'mood', 'topics', 'hobbies', 'interests', 'profession'].forEach(cat => {
       if (filters[cat] && filters[cat].length > 0) {
         filters[cat].forEach((f: string) => all.push(f));
       }
    });

    if (all.length === 0) return <span style={{ fontSize: '0.75rem', color: '#64748b' }}>None</span>;
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
        {all.map((f, i) => (
          <span key={i} style={{ fontSize: '0.625rem', backgroundColor: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '4px', border: '1px solid #e2e8f0', fontWeight: 500 }}>
            {f}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>Active Users</h1>
        <p style={{ color: '#94a3b8' }}>Monitor real-time platform user activity and match states.</p>
      </div>

      <Row className="g-4 mb-2">
        <Col md={3}>
          <Card style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '1rem', borderTop: '4px solid #FF6200', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
             <Card.Body>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.875rem', fontWeight: 600 }}>
                  <Users size={16} color="#FF6200" /> Total Users
                </div>
                <h3 style={{ margin: '0.5rem 0 0', fontWeight: 'bold', color: '#1e293b' }}>{data?.totalUsersInPlatform || 0}</h3>
             </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '1rem', borderTop: '4px solid #3b82f6', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
             <Card.Body>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.875rem', fontWeight: 600 }}>
                  Selected "He"
                </div>
                <h3 style={{ margin: '0.5rem 0 0', fontWeight: 'bold', color: '#1e293b' }}>{data?.totalHeSelected || 0}</h3>
             </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '1rem', borderTop: '4px solid #ec4899', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
             <Card.Body>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.875rem', fontWeight: 600 }}>
                  Selected "She"
                </div>
                <h3 style={{ margin: '0.5rem 0 0', fontWeight: 'bold', color: '#1e293b' }}>{data?.totalSheSelected || 0}</h3>
             </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        {/* Chatting Users */}
        <Col lg={12}>
          <Card style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '1.25rem', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
            <Card.Header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #f1f5f9', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1.125rem', color: '#1e293b' }}>
                <MessageCircle size={20} color="#FF6200" />
                Chatting Users
              </div>
              <Badge style={{ backgroundColor: 'rgba(255, 98, 0, 0.1)', color: '#FF6200', border: '1px solid rgba(255, 98, 0, 0.2)' }}>
                {data?.chattingUsers?.length || 0} Sessions
              </Badge>
            </Card.Header>
            <Card.Body style={{ padding: 0 }}>
              <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                <Table hover style={{ marginBottom: 0 }}>
                  <thead style={{ position: 'sticky', top: 0, backgroundColor: '#fdfdfd', borderBottom: '2px solid #f1f5f9' }}>
                    <tr>
                      <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.75rem', backgroundColor: '#fdfdfd' }}>SESSION ID</th>
                      <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.75rem', backgroundColor: '#fdfdfd' }}>USER 1 & FILTERS</th>
                      <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.75rem', backgroundColor: '#fdfdfd' }}>USER 2 & FILTERS</th>
                      <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.75rem', backgroundColor: '#fdfdfd' }}>STARTED AT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!data?.chattingUsers?.length ? (
                      <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontStyle: 'italic' }}>No active chats</td></tr>
                    ) : (
                      data.chattingUsers.map((s: any) => (
                        <tr key={s.sessionId} style={{ borderBottom: '1px solid #f8fafc' }}>
                          <td style={{ padding: '1rem', verticalAlign: 'middle', fontFamily: 'monospace', color: '#6366f1', fontSize: '0.75rem' }}>{s.sessionId.slice(0, 8)}...</td>
                          <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                             <div style={{ marginBottom: '4px', fontSize: '0.75rem', fontWeight: 'bold', color: '#1e293b' }}>{s.user1Id.slice(0, 8)}</div>
                             {renderFiltersList(s.user1Filters)}
                          </td>
                          <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                             <div style={{ marginBottom: '4px', fontSize: '0.75rem', fontWeight: 'bold', color: '#1e293b' }}>{s.user2Id.slice(0, 8)}</div>
                             {renderFiltersList(s.user2Filters)}
                          </td>
                          <td style={{ padding: '1rem', verticalAlign: 'middle', color: '#8e95a2', fontSize: '0.75rem' }}>
                            {new Date(s.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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

        {/* Queue Users */}
        <Col lg={6}>
          <Card style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '1.25rem', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
            <Card.Header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #f1f5f9', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1.125rem', color: '#1e293b' }}>
                <Activity size={20} color="#FF6200" />
                Queue Users
              </div>
              <Badge style={{ backgroundColor: 'rgba(255, 98, 0, 0.1)', color: '#FF6200', border: '1px solid rgba(255, 98, 0, 0.2)' }}>
                {data?.queueUsers?.length || 0} Waiting
              </Badge>
            </Card.Header>
            <Card.Body style={{ padding: 0 }}>
              <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                <Table hover style={{ marginBottom: 0 }}>
                  <thead style={{ position: 'sticky', top: 0, backgroundColor: '#fdfdfd', borderBottom: '2px solid #f1f5f9' }}>
                    <tr>
                      <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.75rem', backgroundColor: '#fdfdfd' }}>ID</th>
                      <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.75rem', backgroundColor: '#fdfdfd' }}>FILTERS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!data?.queueUsers?.length ? (
                      <tr><td colSpan={2} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontStyle: 'italic' }}>Queue is empty</td></tr>
                    ) : (
                      data.queueUsers.map((u: any) => (
                        <tr key={u.userId} style={{ borderBottom: '1px solid #f8fafc' }}>
                          <td style={{ padding: '1rem', verticalAlign: 'middle', fontFamily: 'monospace', color: '#6366f1', fontSize: '0.75rem' }}>{u.userId.slice(0, 8)}...</td>
                          <td style={{ padding: '1rem', verticalAlign: 'middle' }}>{renderFiltersList(u.filters)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Idle Users */}
        <Col lg={6}>
          <Card style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '1.25rem', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
            <Card.Header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #f1f5f9', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1.125rem', color: '#1e293b' }}>
                <Coffee size={20} color="#FF6200" />
                Idle Users
              </div>
              <Badge style={{ backgroundColor: 'rgba(255, 98, 0, 0.1)', color: '#FF6200', border: '1px solid rgba(255, 98, 0, 0.2)' }}>
                {data?.idleUsers?.length || 0} Idle
              </Badge>
            </Card.Header>
            <Card.Body style={{ padding: 0 }}>
              <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                <Table hover style={{ marginBottom: 0 }}>
                  <thead style={{ position: 'sticky', top: 0, backgroundColor: '#fdfdfd', borderBottom: '2px solid #f1f5f9' }}>
                    <tr>
                      <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.75rem', backgroundColor: '#fdfdfd' }}>ID</th>
                      <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.75rem', backgroundColor: '#fdfdfd' }}>FILTERS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!data?.idleUsers?.length ? (
                      <tr><td colSpan={2} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontStyle: 'italic' }}>No idle users</td></tr>
                    ) : (
                      data.idleUsers.map((u: any) => (
                        <tr key={u.userId} style={{ borderBottom: '1px solid #f8fafc' }}>
                          <td style={{ padding: '1rem', verticalAlign: 'middle', fontFamily: 'monospace', color: '#6366f1', fontSize: '0.75rem' }}>{u.userId.slice(0, 8)}...</td>
                          <td style={{ padding: '1rem', verticalAlign: 'middle' }}>{renderFiltersList(u.filters)}</td>
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

export default AdminActiveUsers;
