import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Avatar from '../ui/Avatar';
import { MenuIcon, MoonIcon, SearchIcon, SidebarIcon, SunIcon } from '../ui/icons';

const iconButton = 'grid size-8 cursor-pointer place-items-center rounded-control text-ink transition-colors hover:bg-hover';

export default function Topbar({ title, onMenuClick }) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const submitSearch = (e) => {
    e.preventDefault();
    navigate(`/products?search=${encodeURIComponent(search.trim())}`);
    setSearch('');
  };

  return (
    <header className="sticky top-0 z-20 flex h-topbar items-center gap-3 border-b border-line bg-page/90 px-4 backdrop-blur md:px-7">
      <button type="button" onClick={onMenuClick} aria-label="Toggle menu" className={iconButton}>
        <MenuIcon className="md:hidden" />
        <SidebarIcon className="hidden md:block" />
      </button>
      <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-sm">
        <span className="hidden text-muted sm:inline">ShopDesk</span>
        <span className="hidden text-muted sm:inline" aria-hidden="true">
          /
        </span>
        <span className="truncate font-medium">{title}</span>
      </nav>
      <div className="ml-auto flex items-center gap-2">
        <form onSubmit={submitSearch} role="search" className="relative hidden lg:block">
          <SearchIcon size={16} className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products"
            aria-label="Search products"
            className="h-8 w-48 rounded-control bg-hover pr-3 pl-8 text-sm outline-none placeholder:text-muted focus:ring-2 focus:ring-ink/10"
          />
        </form>
        <button
          type="button"
          onClick={toggleTheme}
          className={iconButton}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
        <Link to="/profile" aria-label="Your profile" className="rounded-full">
          <Avatar name={user?.name} src={user?.avatarUrl} size={28} />
        </Link>
      </div>
    </header>
  );
}
