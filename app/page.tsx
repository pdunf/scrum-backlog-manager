'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DataStore } from '@/lib/dataStore';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // If there's an active project, redirect to backlog
    const activeProject = DataStore.getActiveProject();
    if (activeProject) {
      router.push('/backlog');
    }
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--color-primary)' }}>
        Scrum Backlog Manager
      </h1>
      <p className="text-xl mb-8 max-w-2xl" style={{ color: 'var(--color-text-secondary)' }}>
        A simple, efficient tool for managing your SCRUM backlogs and sprint planning.
        Import your Jira data and organize your work with ease.
      </p>
      <div className="flex gap-4">
        <Link href="/projects" className="btn-primary text-lg px-6 py-3">
          Get Started
        </Link>
      </div>
      
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl">
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">📊 Backlog Management</h3>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            View and organize all your issues in a clean, filterable table.
          </p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">🎯 Sprint Planning</h3>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Drag-and-drop or click to assign issues to sprints effortlessly.
          </p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">💾 Local Storage</h3>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Your data stays on your machine. Import and export as JSON files.
          </p>
        </div>
      </div>
    </div>
  );
}