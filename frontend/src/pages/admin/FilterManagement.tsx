import React from 'react';
import { Row, Col, Card, Badge, Alert } from 'react-bootstrap';
import { Filter, Lock } from "lucide-react";

export const FILTER_OPTIONS = {
  gender: ["He", "She"],
  mood: ["Happy", "Relaxed", "Energetic", "Creative", "Focused", "Adventurous", "Thoughtful", "Playful", "Calm"],
  topics: ["Technology", "Sports", "Music", "Movies", "Books", "Travel", "Food", "Gaming", "Art"],
  hobbies: ["Reading", "Cooking", "Photography", "Dancing", "Hiking", "Painting", "Gardening", "Yoga", "Coding"],
  interests: ["AI/ML", "Startups", "Fitness", "Fashion", "Politics", "Environment", "History", "Philosophy", "Psychology"],
  profession: ["Student", "Engineer", "Designer", "Doctor", "Teacher", "Artist", "Entrepreneur", "Developer", "Marketing"]
};

const FilterManagement = () => {
  const categories = Object.keys(FILTER_OPTIONS);
  const totalOptions = Object.values(FILTER_OPTIONS).reduce((acc, curr) => acc + curr.length, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', letterSpacing: '-0.025em' }}>Filter Management</h1>
          <p style={{ color: '#94a3b8' }}>View available choices for user preferences in the platform.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#ffffff', padding: '0.50rem 1rem', borderRadius: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <Filter size={16} color="#FF6200" />
          <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>{totalOptions} Total</span>
        </div>
      </div>

      <Alert variant="info" style={{ backgroundColor: 'rgba(255, 98, 0, 0.08)', borderColor: 'rgba(255, 98, 0, 0.2)', color: '#FF6200', borderRadius: '12px' }}>
        <Lock size={16} style={{ marginRight: '8px' }} />
        <strong>Static Options:</strong> Filter categories are hardcoded in the Matchmaking Engine for performance optimizations. Any changes require a codebase deployment.
      </Alert>

      <Row className="g-4">
        {categories.map(category => {
          const catFilters = FILTER_OPTIONS[category as keyof typeof FILTER_OPTIONS];
          return (
            <Col xl={4} md={6} key={category}>
              <Card style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '1rem', height: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                <Card.Header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #f1f5f9', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#FF6200' }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#1e293b' }}>{category}</span>
                  </div>
                  <Badge style={{ backgroundColor: '#f1f5f9', color: '#64748b', fontWeight: 'bold', border: '1px solid #e2e8f0' }}>{catFilters.length}</Badge>
                </Card.Header>
                <Card.Body style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {catFilters.length === 0 ? (
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>No options set</span>
                    ) : (
                      catFilters.map(filter => (
                        <div 
                          key={filter} 
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            backgroundColor: '#f8fafc',
                            padding: '0.375rem 0.875rem',
                            borderRadius: '0.5rem',
                            border: '1px solid #e2e8f0',
                            fontSize: '0.8125rem',
                            color: '#475569',
                            fontWeight: 500
                          }}
                        >
                          {filter}
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
