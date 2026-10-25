import { NavLink } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';
import Logo from './Logo';
import { CloseIcon, DashboardIcon, LogoutIcon, OrdersIcon, ProductsIcon, ProfileIcon } from '../ui/icons';

const SECTIONS = [
  { title: 'Dashboards', links: [{ to: '/', label: 'Dashboard', icon: DashboardIcon, end: true }] },
  {
    title: 'Pages',
    links: [
      { to: '/products', label: 'Products', icon: ProductsIcon },
      { to: '/orders', label: 'Orders', icon: OrdersIcon },
      { to: '/profile', label: 'Profile', icon: ProfileIcon },
    ],
  },
];

export default function Sidebar({ mobileOpen, desktopHidden, onClose }) {
  const { user, logout } = useAuth();

  return (
    <>
      {mobileOpen && <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={onClose} aria-hidden="true" />}

      <aside
        aria-label="Main menu"
        className={`fixed inset-y-0 left-0 z-40 flex w-sidebar flex-col border-r border-line bg-page px-4 py-5 transition-transform duration-200
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          ${desktopHidden ? 'md:-translate-x-full' : 'md:translate-x-0'}`}
      >
        <div className="mb-6 flex items-center justify-between px-2">
          <Logo />
          <button type="button" onClick={onClose} aria-label="Close menu" className="cursor-pointer rounded-control p-1 text-muted hover:bg-hover md:hidden">
            <CloseIcon size={18} />
          </button>
        </div>
        <nav className="flex-1 space-y-5 overflow-y-auto">
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <p className="mb-2 px-3 text-sm text-muted">{section.title}</p>
              <ul className="space-y-1">
                {section.links.map(({ to, label, icon: Icon, end }) => (
                  <li key={to}>
                    <NavLink
                      to={to}
                      end={end}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `relative flex items-center gap-2 rounded-control px-3 py-2 transition-colors hover:bg-hover ${
                          isActive
                            ? 'bg-hover font-medium before:absolute before:top-1/2 before:left-0 before:h-4 before:w-1 before:-translate-y-1/2 before:rounded-full before:bg-ink'
                            : ''
                        }`
                      }
                    >
                      <Icon size={20} />
                      {label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <div className="border-t border-line pt-4">
          <div className="mb-2 flex items-center gap-2 px-2">
            <Avatar name={user?.name} src={user?.avatarUrl} size={28} />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{user?.name}</p>
              <p className="truncate text-xs text-muted">{user?.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="flex w-full cursor-pointer items-center gap-2 rounded-control px-3 py-2 text-left transition-colors hover:bg-hover"
          >
            <LogoutIcon size={20} />
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}
