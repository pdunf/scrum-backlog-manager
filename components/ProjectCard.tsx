'use client';

import { AppProject } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

interface ProjectCardProps {
  project: AppProject;
  isActive: boolean;
  onSelect: (project: AppProject) => void;
  onDelete: (project: AppProject) => void;
  onExport: (project: AppProject) => void;
}

export default function ProjectCard({
  project,
  isActive,
  onSelect,
  onDelete,
  onExport,
}: ProjectCardProps) {
  const lastAccessed = formatDistanceToNow(new Date(project.lastAccessed), {
    addSuffix: true,
  });

  return (
    <div
      className={`card cursor-pointer transition-all ${
        isActive ? 'ring-2' : 'hover:shadow-md'
      }`}
      style={{
        border: isActive ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
      }}
      onClick={() => onSelect(project)}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold">{project.name}</h3>
        {isActive && (
          <span
            className="text-xs px-2 py-1 rounded font-medium"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'white',
            }}
          >
            Active
          </span>
        )}
      </div>

      <div className="space-y-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        <div className="flex justify-between">
          <span>Total Issues:</span>
          <span className="font-medium">{project.data.summary.total_issues}</span>
        </div>
        <div className="flex justify-between">
          <span>Epics:</span>
          <span className="font-medium">{project.data.summary.epics}</span>
        </div>
        <div className="flex justify-between">
          <span>Stories:</span>
          <span className="font-medium">{project.data.summary.stories}</span>
        </div>
        <div className="flex justify-between">
          <span>Subtasks:</span>
          <span className="font-medium">{project.data.summary.subtasks}</span>
        </div>
        <div className="pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <span>Last accessed: {lastAccessed}</span>
        </div>
      </div>

      <div className="mt-4 flex gap-2" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => onExport(project)}
          className="btn-secondary text-sm flex-1"
        >
          Export
        </button>
        <button
          onClick={() => {
            if (confirm(`Are you sure you want to delete "${project.name}"?`)) {
              onDelete(project);
            }
          }}
          className="text-sm px-3 py-2 rounded font-medium transition-colors"
          style={{
            backgroundColor: 'var(--color-status-blocked)',
            color: 'white',
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}