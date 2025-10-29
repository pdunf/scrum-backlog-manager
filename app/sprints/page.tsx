'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DataStore } from '@/lib/dataStore';
import { SprintManager } from '@/lib/sprintUtils';
import { AppProject, JiraIssue } from '@/lib/types';
import SprintColumn from '@/components/SprintColumn';

export default function SprintsPage() {
  const [project, setProject] = useState<AppProject | null>(() => {
    if (typeof window !== 'undefined') {
      return DataStore.getActiveProject();
    }
    return null;
  });
  const [isDragMode, setIsDragMode] = useState(true);
  const [selectedIssues, setSelectedIssues] = useState<Set<string>>(new Set());
  const [targetSprint, setTargetSprint] = useState<string | null>(null);
  const [newSprintName, setNewSprintName] = useState('');
  const [showNewSprintInput, setShowNewSprintInput] = useState(false);
  const router = useRouter();

  // Derive sprints from project (no useState needed)
  const sprints = useMemo(() => {
    if (!project) return [];
    return SprintManager.getSprintNames(project.data.issues);
  }, [project]);

  const unassignedIssues = useMemo(() => {
    if (!project) return [];
    return SprintManager.getUnassignedIssues(project.data.issues);
  }, [project]);

  useEffect(() => {
    if (!project) {
      router.push('/projects');
    }
  }, [project, router]);

  const refreshProject = useCallback(() => {
    const updatedProject = DataStore.getActiveProject();
    if (updatedProject) {
      setProject(updatedProject);
    }
  }, []);

  const handleDrop = useCallback((issueKey: string, sprintName: string | null) => {
    if (sprintName) {
      SprintManager.assignToSprint(issueKey, sprintName);
    } else {
      SprintManager.removeFromSprint(issueKey);
    }
    refreshProject();
  }, [refreshProject]);

  const handleIssueClick = useCallback((issue: JiraIssue) => {
    if (isDragMode) return;

    setSelectedIssues(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(issue.key)) {
        newSelected.delete(issue.key);
      } else {
        newSelected.add(issue.key);
      }
      return newSelected;
    });
  }, [isDragMode]);

  const handleAssignSelected = useCallback(() => {
    if (!targetSprint || selectedIssues.size === 0) return;

    selectedIssues.forEach(issueKey => {
      SprintManager.assignToSprint(issueKey, targetSprint);
    });

    setSelectedIssues(new Set());
    setTargetSprint(null);
    refreshProject();
  }, [targetSprint, selectedIssues, refreshProject]);

  const handleUnassignSelected = useCallback(() => {
    if (selectedIssues.size === 0) return;

    selectedIssues.forEach(issueKey => {
      SprintManager.removeFromSprint(issueKey);
    });

    setSelectedIssues(new Set());
    refreshProject();
  }, [selectedIssues, refreshProject]);

  const handleCreateSprint = useCallback(() => {
    if (!newSprintName.trim()) return;

    SprintManager.createSprint(newSprintName.trim());
    setNewSprintName('');
    setShowNewSprintInput(false);
    refreshProject();
  }, [newSprintName, refreshProject]);

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p style={{ color: 'var(--color-text-secondary)' }}>Loading sprints...</p>
        </div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => router.push('/projects')}
              className="text-sm hover:underline"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              ← Back to Projects
            </button>
          </div>
          <h1 className="text-3xl font-bold mb-4">{project.name} - Sprint Planning</h1>

          {/* Controls */}
          <div className="flex flex-wrap gap-4 items-center">
            {/* Mode Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Mode:</span>
              <button
                onClick={() => {
                  setIsDragMode(!isDragMode);
                  setSelectedIssues(new Set());
                }}
                className={isDragMode ? 'btn-primary' : 'btn-secondary'}
              >
                {isDragMode ? '🖱️ Drag & Drop' : '👆 Click to Assign'}
              </button>
            </div>

            {/* Click Mode Controls */}
            {!isDragMode && selectedIssues.size > 0 && (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    {selectedIssues.size} selected
                  </span>
                  <select
                    value={targetSprint || ''}
                    onChange={(e) => setTargetSprint(e.target.value || null)}
                    className="input"
                  >
                    <option value="">Select sprint...</option>
                    {sprints.map(sprint => (
                      <option key={sprint} value={sprint}>{sprint}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleAssignSelected}
                    disabled={!targetSprint}
                    className="btn-primary"
                    style={{
                      opacity: targetSprint ? 1 : 0.5,
                      cursor: targetSprint ? 'pointer' : 'not-allowed',
                    }}
                  >
                    Assign
                  </button>
                  <button
                    onClick={handleUnassignSelected}
                    className="btn-secondary"
                  >
                    Unassign
                  </button>
                </div>
              </>
            )}

            {/* New Sprint Button */}
            <button
              onClick={() => setShowNewSprintInput(!showNewSprintInput)}
              className="btn-secondary ml-auto"
            >
              + New Sprint
            </button>
          </div>

          {/* New Sprint Input */}
          {showNewSprintInput && (
            <div className="mt-4 flex gap-2">
              <input
                type="text"
                placeholder="Sprint name (e.g., Sprint 4)"
                value={newSprintName}
                onChange={(e) => setNewSprintName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateSprint()}
                className="input flex-1"
                autoFocus
              />
              <button onClick={handleCreateSprint} className="btn-primary">
                Create
              </button>
              <button
                onClick={() => {
                  setShowNewSprintInput(false);
                  setNewSprintName('');
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Sprint Columns */}
        <div className="grid grid-cols-3 gap-4" style={{ height: 'calc(100vh - 300px)' }}>
          {/* Backlog Column */}
          <SprintColumn
            sprintName={null}
            issues={unassignedIssues}
            onDrop={handleDrop}
            onIssueClick={handleIssueClick}
            selectedIssues={selectedIssues}
            stats={{
              total: unassignedIssues.length,
              points: SprintManager.getSprintPoints(project.data.issues, ''),
              done: 0,
            }}
            isDragMode={isDragMode}
          />

          {/* Sprint Columns */}
          {sprints.map(sprint => {
            const sprintIssues = SprintManager.getIssuesForSprint(project.data.issues, sprint);
            const stats = SprintManager.getSprintStats(project.data.issues, sprint);

            return (
              <SprintColumn
                key={sprint}
                sprintName={sprint}
                issues={sprintIssues}
                onDrop={handleDrop}
                onIssueClick={handleIssueClick}
                selectedIssues={selectedIssues}
                stats={stats}
                isDragMode={isDragMode}
              />
            );
          })}
        </div>
      </div>
    </DndProvider>
  );
}