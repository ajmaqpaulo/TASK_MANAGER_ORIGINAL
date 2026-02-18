import { Outlet, useNavigate, useLocation } from 'react-router';
import { LayoutDashboard, ClipboardList, CheckSquare, UserPlus, LogOut, ChevronLeft, ChevronRight, FileText, Building2, Shield } from 'lucide-react';
import logo from '@/assets/aae02afcf95717fd7154788982f1cae7f0997dcb.png';
import { useState } from 'react';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(true);

  const menuSections = [
    {
      title: 'Principal',
      items: [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/approvals', icon: CheckSquare, label: 'Aprobaciones' },
      ]
    },
    {
      title: 'Administración',
      items: [
        { path: '/register', icon: UserPlus, label: 'Usuarios' },
        { path: '/organizational-units', icon: Building2, label: 'Unidades Org.' },
        { path: '/roles', icon: Shield, label: 'Roles' },
      ]
    },
    {
      title: 'Reportes',
      items: [
        { path: '/reports', icon: FileText, label: 'Reportes' },
      ]
    }
  ];

  const isActive = (path: string) => {
    if (path === '/tasks/new') {
      return location.pathname.startsWith('/tasks');
    }
    return location.pathname === path;
  };

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="size-full flex" style={{ backgroundColor: '#14151A' }}>
      {/* Sidebar Navigation */}
      <aside 
        className="flex flex-col backdrop-blur-xl border-r transition-all duration-300" 
        style={{
          width: isExpanded ? '288px' : '80px',
          background: 'rgba(28, 29, 36, 0.95)',
          borderColor: 'rgba(222, 222, 224, 0.1)',
          boxShadow: '2px 0 16px 0 rgba(0, 0, 0, 0.3)'
        }}
      >
        {/* Logo y Header */}
        <div className="p-6 border-b relative" style={{ borderColor: 'rgba(222, 222, 224, 0.1)' }}>
          <div className="flex items-center gap-3">
            <img 
              src={logo} 
              alt="Logo" 
              className="flex-shrink-0 object-contain" 
              style={{
                width: '48px',
                height: '48px'
              }}
            />
            {isExpanded && (
              <div className="overflow-hidden">
                <h2 style={{ color: '#DEDEE0' }}>Task Manager</h2>
                <p className="text-sm" style={{ color: '#DEDEE0', opacity: 0.6 }}>
                  Sistema de Gestión
                </p>
              </div>
            )}
          </div>
          
          {/* Toggle Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="absolute -right-3 top-1/2 -translate-y-1/2 p-1.5 transition-all duration-300 hover:scale-110 active:scale-95"
            style={{
              backgroundColor: '#9D833E',
              color: '#14151A',
              borderRadius: '8px',
              boxShadow: '0 4px 16px 0 rgba(157, 131, 62, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.2)'
            }}
          >
            {isExpanded ? <ChevronLeft size={16} strokeWidth={2.5} /> : <ChevronRight size={16} strokeWidth={2.5} />}
          </button>
        </div>

        {/* Menu Items */}
        <nav 
          className="flex-1 p-4" 
          style={{
            overflowY: isExpanded ? 'auto' : 'visible'
          }}
        >
          <div className="space-y-6">
            {menuSections.map((section, sectionIndex) => (
              <div key={section.title}>
                {/* Section Header */}
                {isExpanded ? (
                  <div className="mb-3 px-2">
                    <div className="flex items-center gap-2">
                      <span 
                        className="text-xs font-semibold tracking-wider uppercase"
                        style={{ color: '#9D833E', opacity: 0.9 }}
                      >
                        {section.title}
                      </span>
                      <div 
                        className="flex-1 h-px"
                        style={{
                          background: 'linear-gradient(90deg, rgba(157, 131, 62, 0.3), transparent)'
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div 
                    className="mb-3 mx-auto h-px"
                    style={{
                      width: '32px',
                      background: 'linear-gradient(90deg, transparent, rgba(157, 131, 62, 0.5), transparent)'
                    }}
                  />
                )}
                
                {/* Section Items */}
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    return (
                      <button
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        className="w-full flex items-center gap-3 px-4 py-3 transition-all duration-300 active:scale-[0.98] relative"
                        style={{
                          backgroundColor: active ? '#9D833E' : 'transparent',
                          color: active ? '#14151A' : '#DEDEE0',
                          borderRadius: '12px',
                          boxShadow: active 
                            ? '0 4px 16px 0 rgba(157, 131, 62, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.2)' 
                            : 'none',
                          justifyContent: isExpanded ? 'flex-start' : 'center'
                        }}
                        onMouseEnter={(e) => {
                          if (!active) {
                            e.currentTarget.style.backgroundColor = 'rgba(42, 43, 49, 0.5)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!active) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                        {isExpanded && <span className="text-sm">{item.label}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t" style={{ borderColor: 'rgba(222, 222, 224, 0.1)' }}>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 transition-all duration-300 active:scale-[0.98]"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#EF4444',
              borderRadius: '12px',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              justifyContent: isExpanded ? 'flex-start' : 'center'
            }}
          >
            <LogOut size={20} />
            {isExpanded && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}