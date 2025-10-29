'use client';

import { JiraIssue } from '@/lib/types';
import { useDrop } from 'react-dnd';
import IssueCard from './IssueCard';

interface SprintColumnProps {
  sprintName: string | null;
  issues: JiraIssue[];
  onDrop: (issueKey: string, sprintName: string | null) => void;
  onIssueClick: (issue: JiraIssue) => void;
  selectedIssues: Set<string>;
  stats?: {
    total: number;
    points: number;
    done: number;
  };
  isDragMode: boolean;
}

export default function SprintColumn({
  sprintName,
  issues,
  onDrop,
  onIssueClick,
  selectedIssues,
  stats,
  isDragMode,
}: SprintColumnProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'issue',
    drop: (item: { issueKey: string }) => {
      onDrop(item.issueKey, sprintName);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }), [sprintName, onDrop]);

  const isBacklog = sprintName === null;

  return (
    <div
      ref={drop}
      className="flex flex-col h-full rounded-lg border-2 transition-colors"
      style={{
        backgroundColor: isOver ? 'var(--color-background)' : 'var(--color-surface)',
        borderColor: isOver ? 'var(--color-primary)' : 'var(--color-border)',
      }}
    >
      {/* Header */}
      <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <h3 className="font-semibold text-lg mb-2">
          {isBacklog ? '📋 Backlog' : sprintName}
        </h3>
        {stats && (
          <div className="flex gap-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <span>{stats.total} issues</span>
            <span>{stats.points} points</span>
            {stats.done > 0 && <span>{stats.done} done</span>}
          </div>
        )}
      </div>

      {/* Issues List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {issues.length === 0 ? (
          <div className="text-center py-8" style={{ color: 'var(--color-text-secondary)' }}>
            <p className="text-sm">
              {isDragMode ? 'Drag issues here' : 'Click issues to assign'}
            </p>
          </div>
        ) : (
          issues.map((issue) => (
            <IssueCard
              key={issue.key}
              issue={issue}
              onClick={() => onIssueClick(issue)}
              isSelected={selectedIssues.has(issue.key)}
              isDraggable={isDragMode}
            />
          ))
        )}
      </div>
    </div>
  );
}