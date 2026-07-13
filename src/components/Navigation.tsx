'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { path: '/', label: 'Home' },
  { path: '/journey', label: 'Journey' },
  { path: '/projects', label: 'Systems' },
  { path: '/wiki', label: 'Wiki' },
  { path: '/essays', label: 'Essays' },
  { path: '/contact', label: 'Contact' }
];

export default function Navigation() {
  const raw = usePathname();
  // Normalize trailing slash (trailingSlash: true) so "/journey/" matches "/journey".
  const pathname = raw !== '/' ? raw.replace(/\/$/, '') : raw;

  const isActive = (path: string) =>
    path === '/' ? pathname === '/' : pathname === path || pathname.startsWith(path + '/');

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      padding: '2rem 5vw',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      zIndex: 100,
      backdropFilter: 'blur(10px)',
      backgroundColor: 'rgba(251, 244, 229, 0.8)', // Cream MAI background with opacity
      borderBottom: '1px solid rgba(0,0,0,0.05)'
    }}>
      <Link href="/" style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', lineHeight: 1 }}>
        Aditya Gaur.
      </Link>
      
      <div style={{ display: 'flex', gap: '2rem' }}>
        {navItems.map((item) => (
          <Link 
            key={item.path} 
            href={item.path}
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '1rem',
              opacity: isActive(item.path) ? 1 : 0.5,
              transition: 'opacity 0.2s ease',
              borderBottom: isActive(item.path) ? '1px solid var(--foreground)' : 'none',
              paddingBottom: '2px'
            }}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
