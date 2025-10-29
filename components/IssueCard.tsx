'use client';

import { JiraIssue } from '@/lib/types';
import { useDrag } from 'react-dnd';

interface IssueCardProps {
  issue: JiraIssue;
  onClick?: () => void;
  isSelected?: boolean;
  isDraggable?: boolean;
}

export default function IssueCard({ issue, onClick, isSelected, isDraggable = true }: IssueCardProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'issue',
    item: { issueKey: issue.key },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: isDraggable,
  }), [issue.key, isDraggable]);

  const getTypeIcon = (type: string): string => {
    if (type === 'Epic') return '📚';
    if (type === 'Story') return '📖';
    if (type === 'Subtask') return '📝';
    return '📋';
  };

  const getStatusColor = (status: string): string => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('done')) return 'var(--color-status-done)';
    if (statusLower.includes('progress') || statusLower.includes('in progress')) return 'var(--color-status-progress)';
    if (statusLower.includes('blocked')) return 'var(--color-status-blocked)';
    return 'var(--color-status-todo)';
  };

  return (
    <div
      ref={isDraggable ? (drag as any) : null}
      onClick={onClick}
      className={`p-3 rounded border transition-all cursor-pointer ${
        isSelected ? 'ring-2' : ''
      }`}
      style={{
        backgroundColor: isDragging ? 'var(--color-border)' : 'white',
        borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-border)',
        opacity: isDragging ? 0.5 : 1,
        border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getTypeIcon(issue.issuetype)}</span>
          <span className="font-mono text-sm font-medium" style={{ color: 'var(--color-primary)' }}>
            {issue.key}
          </span>
        </div>
        {issue.customfield_10016 && (
          <span
            className="text-xs px-2 py-1 rounded font-medium"
            style={{
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text-primary)',
            }}
          >
            {issue.customfield_10016} pts
          </span>
        )}
      </div>

      <div className="text-sm mb-2" style={{ color: 'var(--color-text-primary)' }}>
        {issue.summary}
      </div>

      <div className="flex items-center justify-between">
        <span
          className="text-xs px-2 py-1 rounded font-medium"
          style={{
            backgroundColor: getStatusColor(issue.status),
            color: 'white',
          }}
        >
          {issue.status}
        </span>
        {issue.parent && (
          <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            {issue.parent}
          </span>
        )}
      </div>
    </div>
  );
}