import { useState } from 'react';
import { Outlet, useLocation } from 'react-router';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const TITLES = {
  '/': 'Dashboard',
  '/products': 'Products',
  '/orders': 'Orders',
  '/profile': 'Profile',
};

export default function AppLayout() {
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopHidden, setDesktopHidden] = useState(false);

  const handleMenuClick = () => {
    if (window.matchMedia('(min-width: 768px)').matches) setDesktopHidden((v) => !v);
    else setMobileOpen(true);
  };

  return (
    <div className="min-h-screen">
      <Sidebar mobileOpen={mobileOpen} desktopHidden={desktopHidden} onClose={() => setMobileOpen(false)} />
      <div className={`transition-[margin] duration-200 ${desktopHidden ? 'md:ml-0' : 'md:ml-sidebar'}`}>
        <Topbar title={TITLES[pathname] || 'ShopDesk'} onMenuClick={handleMenuClick} />
        <main className="mx-auto max-w-[1440px] p-4 md:p-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
