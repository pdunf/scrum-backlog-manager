'use client';

import { JiraIssue } from '@/lib/types';
import { useState, useMemo, RefObject } from 'react';

interface BacklogTableProps {
  issues: JiraIssue[];
  searchInputRef?: RefObject<HTMLInputElement>;
}

export default function BacklogTable({ issues, searchInputRef }: BacklogTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof JiraIssue>('key');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Get unique issue types and statuses for filters
  const issueTypes = useMemo(() => {
    const types = new Set(issues.map(i => i.issuetype));
    return ['all', ...Array.from(types)];
  }, [issues]);

  const statuses = useMemo(() => {
    const stats = new Set(issues.map(i => i.status));
    return ['all', ...Array.from(stats)];
  }, [issues]);

  // Filter and sort issues
  const filteredIssues = useMemo(() => {
    let filtered = issues;

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        issue =>
          issue.key.toLowerCase().includes(term) ||
          issue.summary.toLowerCase().includes(term) ||
          (issue.description && issue.description.toLowerCase().includes(term))
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(issue => issue.issuetype === filterType);
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(issue => issue.status === filterStatus);
    }

    // Sort
    filtered.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return sortDirection === 'asc'
        ? aVal > bVal ? 1 : -1
        : aVal < bVal ? 1 : -1;
    });

    return filtered;
  }, [issues, searchTerm, filterType, filterStatus, sortField, sortDirection]);

  const handleSort = (field: keyof JiraIssue) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getStatusColor = (status: string): string => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('done')) return 'var(--color-status-done)';
    if (statusLower.includes('progress') || statusLower.includes('in progress')) return 'var(--color-status-progress)';
    if (statusLower.includes('blocked')) return 'var(--color-status-blocked)';
    return 'var(--color-status-todo)';
  };

  const getTypeIcon = (type: string): string => {
    if (type === 'Epic') return '📚';
    if (type === 'Story') return '📖';
    if (type === 'Subtask') return '📝';
    return '📋';
  };

  return (
    <div>
      {/* Filters and Search */}
      <div className="mb-6 space-y-4">
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search by key, summary, or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input w-full"
        />

        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium mb-1">Issue Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="input w-full"
            >
              {issueTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Types' : type}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input w-full"
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Statuses' : status}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterType('all');
                setFilterStatus('all');
              }}
              className="btn-secondary"
            >
              Clear Filters
            </button>
          </div>
        </div>

        <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Showing {filteredIssues.length} of {issues.length} issues
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto" style={{ backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)' }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
              <th className="table-header" onClick={() => handleSort('issuetype')}>
                <div className="flex items-center gap-1">
                  Type
                  {sortField === 'issuetype' && (
                    <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th className="table-header" onClick={() => handleSort('key')}>
                <div className="flex items-center gap-1">
                  Key
                  {sortField === 'key' && (
                    <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th className="table-header" onClick={() => handleSort('summary')}>
                <div className="flex items-center gap-1">
                  Summary
                  {sortField === 'summary' && (
                    <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th className="table-header" onClick={() => handleSort('parent')}>
                <div className="flex items-center gap-1">
                  Epic/Parent
                  {sortField === 'parent' && (
                    <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th className="table-header" onClick={() => handleSort('customfield_10020')}>
                <div className="flex items-center gap-1">
                  Sprint
                  {sortField === 'customfield_10020' && (
                    <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th className="table-header" onClick={() => handleSort('status')}>
                <div className="flex items-center gap-1">
                  Status
                  {sortField === 'status' && (
                    <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th className="table-header" onClick={() => handleSort('customfield_10016')}>
                <div className="flex items-center gap-1">
                  Points
                  {sortField === 'customfield_10016' && (
                    <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th className="table-header" onClick={() => handleSort('assignee')}>
                <div className="flex items-center gap-1">
                  Assignee
                  {sortField === 'assignee' && (
                    <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredIssues.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8" style={{ color: 'var(--color-text-secondary)' }}>
                  No issues found matching your filters
                </td>
              </tr>
            ) : (
              filteredIssues.map((issue) => (
                <tr
                  key={issue.key}
                  className="table-row"
                  style={{ borderBottom: '1px solid var(--color-border)' }}
                >
                  <td className="table-cell">
                    <span className="text-lg">{getTypeIcon(issue.issuetype)}</span>
                    <span className="ml-2 text-sm">{issue.issuetype}</span>
                  </td>
                  <td className="table-cell">
                    <a
                      href={issue.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono font-medium hover:underline"
                      style={{ color: 'var(--color-primary)' }}
                    >
                      {issue.key}
                    </a>
                  </td>
                  <td className="table-cell max-w-md">
                    <div className="truncate" title={issue.summary}>
                      {issue.summary}
                    </div>
                  </td>
                  <td className="table-cell">
                    <span style={{ color: 'var(--color-text-secondary)' }}>
                      {issue.parent || '-'}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span style={{ color: 'var(--color-text-secondary)' }}>
                      {issue.customfield_10020 || '-'}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span
                      className="inline-block px-2 py-1 rounded text-xs font-medium"
                      style={{
                        backgroundColor: getStatusColor(issue.status),
                        color: 'white',
                      }}
                    >
                      {issue.status}
                    </span>
                  </td>
                  <td className="table-cell text-center">
                    <span style={{ color: 'var(--color-text-secondary)' }}>
                      {issue.customfield_10016 || '-'}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span style={{ color: 'var(--color-text-secondary)' }}>
                      {issue.assignee || 'Unassigned'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}