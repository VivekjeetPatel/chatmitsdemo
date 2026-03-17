import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge, InputGroup } from 'react-bootstrap';
import { Plus, X, Tag, Filter, Trash2 } from "lucide-react";

const FilterManagement = () => {
  const [filters, setFilters] = useState<any[]>([]);
  const [newFilter, setNewFilter] = useState({ category: 'interest', value: '' });
  const [loading, setLoading] = useState(true);

  const categories = ['gender', 'mood', 'topic', 'hobby', 'interest', 'profession'];

  useEffect(() => {
    fetchFilters();
  }, []);

  const fetchFilters = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';
      const res = await fetch(`${API_BASE_URL}/api/admin/filters`);
      const data = await res.json();
      setFilters(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFilter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFilter.value) return;

    try {
      const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';
      const res = await fetch(`${API_BASE_URL}/api/admin/filters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFilter)
      });
      if (res.ok) {
        setNewFilter({ ...newFilter, value: '' });
        fetchFilters();
      }
    } catch (err) {
      alert("Error adding filter.");
    }
  };

  const handleDeleteFilter = async (id: number) => {
    try {
      const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';
      const res = await fetch(`${API_BASE_URL}/api/admin/filters/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setFilters(filters.filter(f => f.id !== id));
      }
    } catch (err) {
      alert("Error deleting filter.");
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', letterSpacing: '-0.025em' }}>Filter Management</h1>
          <p style={{ color: '#94a3b8' }}>Define available choices for user preferences.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#0f172a', padding: '0.5rem 1rem', borderRadius: '1rem', border: '1px solid #1e293b' }}>
          <Filter size={16} color="#818cf8" />
          <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>{filters.length} Total</span>
        </div>
      </div>

      <Card style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '1.25rem', borderLeft: '3px solid #6366f1' }}>
        <Card.Header style={{ backgroundColor: 'transparent', borderBottom: '1px solid #1e293b', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1.125rem' }}>
            <Plus size={20} color="#818cf8" />
            Create New Option
          </div>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>Add options to the global matchmaking system.</p>
        </Card.Header>
        <Card.Body style={{ padding: '1.5rem' }}>
          <Form onSubmit={handleAddFilter}>
            <Row className="g-3">
              <Col md={4}>
                <Form.Select 
                  value={newFilter.category} 
                  onChange={(e) => setNewFilter({...newFilter, category: e.target.value})}
                  style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', color: 'white', height: '3.5rem', borderRadius: '0.75rem' }}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={5}>
                <InputGroup>
                  <InputGroup.Text style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', borderRight: 'none', color: '#64748b', borderTopLeftRadius: '0.75rem', borderBottomLeftRadius: '0.75rem' }}>
                    <Tag size={18} />
                  </InputGroup.Text>
                  <Form.Control 
                    placeholder="Enter value (e.g. Photography, Coding)" 
                    value={newFilter.value}
                    onChange={(e) => setNewFilter({...newFilter, value: e.target.value})}
                    style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', color: 'white', height: '3.5rem', borderTopRightRadius: '0.75rem', borderBottomRightRadius: '0.75rem' }}
                  />
                </InputGroup>
              </Col>
              <Col md={3}>
                <Button type="submit" style={{ backgroundColor: '#4f46e5', border: 'none', width: '100%', height: '3.5rem', fontWeight: 'bold', borderRadius: '0.75rem' }}>
                  Add This Filter
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      <Row className="g-4">
        {categories.map(category => {
          const catFilters = filters.filter(f => f.category === category);
          return (
            <Col xl={4} md={6} key={category}>
              <Card style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '1rem', height: '100%' }}>
                <Card.Header style={{ backgroundColor: 'transparent', borderBottom: '1px solid #1e293b', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#6366f1' }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b' }}>{category}</span>
                  </div>
                  <Badge style={{ backgroundColor: '#1e293b', color: '#94a3b8', fontWeight: 'bold' }}>{catFilters.length}</Badge>
                </Card.Header>
                <Card.Body style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {catFilters.length === 0 ? (
                      <span style={{ fontSize: '0.75rem', color: '#475569', fontStyle: 'italic' }}>No options set</span>
                    ) : (
                      catFilters.map(filter => (
                        <div 
                          key={filter.id} 
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            backgroundColor: '#1e293b',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '0.5rem',
                            border: '1px solid #334155',
                            fontSize: '0.875rem',
                            color: '#e2e8f0'
                          }}
                        >
                          {filter.value}
                          <X 
                            size={14} 
                            style={{ cursor: 'pointer', color: '#64748b' }}
                            onClick={() => handleDeleteFilter(filter.id)}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
                          />
                        </div>
                      ))
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default FilterManagement;
