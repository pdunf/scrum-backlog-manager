'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppProject } from '@/lib/types';
import BacklogTable from '@/components/BacklogTable';
import { DataStore } from '@/lib/dataStore';

export default function BacklogPage() {
  const [project] = useState<AppProject | null>(() => {
    if (typeof window !== 'undefined') {
      return DataStore.getActiveProject();
    }
    return null;
  });
  const router = useRouter();

  useEffect(() => {    
    if (!project) {
      router.push('/projects');
    }
  }, [project, router]);

  // Show loading while project is loading
  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p style={{ color: 'var(--color-text-secondary)' }}>Loading backlog...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={() => router.push('/projects')}
            className="text-sm hover:underline"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            ← Back to Projects
          </button>
        </div>
        <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
        <div className="flex gap-6 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          <span>📊 {project.data.summary.total_issues} Total Issues</span>
          <span>📚 {project.data.summary.epics} Epics</span>
          <span>📖 {project.data.summary.stories} Stories</span>
          <span>📝 {project.data.summary.subtasks} Subtasks</span>
        </div>
      </div>

      {/* Backlog Table */}
      <BacklogTable issues={project.data.issues} />
    </div>
  );
}