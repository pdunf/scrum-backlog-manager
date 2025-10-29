'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DataStore } from '@/lib/dataStore';
import { useMemo } from 'react';

export default function Navigation() {
  const pathname = usePathname();

  // Derive active project info without state
  const projectInfo = useMemo(() => {
    if (typeof window === 'undefined') {
      return { hasProject: false, name: '' };
    }
    const project = DataStore.getActiveProject();
    return {
      hasProject: !!project,
      name: project?.name || '',
    };
  }, []); // Re-calculate on route change

  const handleExport = () => {
    const project = DataStore.getActiveProject();
    if (!!project) {
      DataStore.exportProject(project);
    }
  };

  const links = [
    { href: '/projects', label: 'Projects' },
    { href: '/backlog', label: 'Backlog' },
    { href: '/sprints', label: 'Sprints' },
  ];

  return (
    <nav style={{ backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" style={{ color: 'var(--color-primary)' }} className="text-xl font-bold">
              Scrum Manager
            </Link>
            
            {projectInfo.hasProject && projectInfo.name && (
              <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {projectInfo.name}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2 font-medium transition-colors"
                  style={{
                    backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
                    color: isActive ? 'white' : 'var(--color-text-primary)',
                    borderRadius: 'var(--radius)',
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
            
            {projectInfo.hasProject && (
              <button
                onClick={handleExport}
                className="btn-secondary"
                title="Export current project"
              >
                💾 Export
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}