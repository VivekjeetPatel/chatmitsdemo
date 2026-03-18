import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, Filter, Users, Settings, LogOut, ChevronRight } from "lucide-react";
import { Container, Row, Col, Nav } from "react-bootstrap";

const AdminLayout = () => {
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
    { icon: Filter, label: "Filters", path: "/admin/filters" },
    { icon: Users, label: "Active Users", path: "/admin/users" },
    { icon: Settings, label: "Settings", path: "/admin/settings" },
  ];

  const sidebarStyle: React.CSSProperties = {
    width: '260px',
    borderRight: '1px solid #1e293b',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    backdropFilter: 'blur(20px)',
    display: 'flex',
    flexDirection: 'column',
    padding: '2rem 1.5rem',
    position: 'sticky',
    top: 0,
    height: '100vh',
    overflowY: 'auto'
  };

  const menuItemStyle = (isActive: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem 1rem',
    borderRadius: '0.75rem',
    transition: 'all 0.3s ease',
    marginBottom: '0.5rem',
    textDecoration: 'none',
    backgroundColor: isActive ? 'rgba(255, 98, 0, 0.1)' : 'transparent',
    color: isActive ? '#FF6200' : '#94a3b8',
    border: isActive ? '1px solid rgba(255, 98, 0, 0.2)' : '1px solid transparent'
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#020617', color: '#f1f5f9' }}>
      {/* Sidebar */}
      <aside style={sidebarStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0 0.5rem', marginBottom: '2rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(to bottom right, #FF7B00, #E65A00)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(255, 98, 0, 0.2)'
          }}>
            <Settings size={24} color="white" />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Admin Panel</span>
        </div>

        <nav style={{ flex: 1 }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path === "/admin" && location.pathname === "/admin/");
            return (
              <Link
                key={item.path}
                to={item.path}
                style={menuItemStyle(isActive)}
                onMouseEnter={(e) => {
                   if(!isActive) {
                     e.currentTarget.style.backgroundColor = '#1e293b';
                     e.currentTarget.style.color = '#e2e8f0';
                   }
                }}
                onMouseLeave={(e) => {
                   if(!isActive) {
                     e.currentTarget.style.backgroundColor = 'transparent';
                     e.currentTarget.style.color = '#94a3b8';
                   }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <item.icon size={20} />
                  <span style={{ fontWeight: 500 }}>{item.label}</span>
                </div>
                {isActive && <ChevronRight size={16} />}
              </Link>
            );
          })}
        </nav>

        <div style={{ paddingTop: '2rem', marginTop: 'auto', borderTop: '1px solid #1e293b' }}>
          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            width: '100%',
            backgroundColor: 'transparent',
            border: 'none',
            color: '#ef4444',
            fontWeight: 500,
            cursor: 'pointer',
            borderRadius: '0.75rem',
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.05)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '2rem 3rem', overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
