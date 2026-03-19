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
    borderRight: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    padding: '2rem 1.5rem',
    position: 'sticky',
    top: 0,
    height: '100vh',
    overflowY: 'auto',
    boxShadow: '4px 0 24px rgba(0, 0, 0, 0.02)'
  };

  const menuItemStyle = (isActive: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem 1rem',
    borderRadius: '12px',
    transition: 'all 0.2s ease',
    marginBottom: '0.5rem',
    textDecoration: 'none',
    backgroundColor: isActive ? 'rgba(255, 98, 0, 0.08)' : 'transparent',
    color: isActive ? '#FF6200' : '#64748b',
    fontWeight: isActive ? 600 : 500,
    border: 'none'
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', color: '#1e293b' }}>
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
                     e.currentTarget.style.backgroundColor = '#f1f5f9';
                     e.currentTarget.style.color = '#1e293b';
                   }
                }}
                onMouseLeave={(e) => {
                   if(!isActive) {
                     e.currentTarget.style.backgroundColor = 'transparent';
                     e.currentTarget.style.color = '#64748b';
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


        <div style={{ paddingTop: '2rem', marginTop: 'auto', borderTop: '1px solid #f1f5f9' }}>
          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            width: '100%',
            backgroundColor: 'transparent',
            border: 'none',
            color: '#94a3b8',
            fontWeight: 500,
            cursor: 'pointer',
            borderRadius: '12px',
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => {
             e.currentTarget.style.backgroundColor = '#fef2f2';
             e.currentTarget.style.color = '#ef4444';
          }}
          onMouseLeave={(e) => {
             e.currentTarget.style.backgroundColor = 'transparent';
             e.currentTarget.style.color = '#94a3b8';
          }}
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
