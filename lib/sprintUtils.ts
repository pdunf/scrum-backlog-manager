import { DataStore } from './dataStore';
import { JiraIssue } from './types';

export class SprintManager {
  // Get all unique sprint names from issues
  static getSprintNames(issues: JiraIssue[]): string[] {
    const sprints = new Set<string>();
    
    issues.forEach(issue => {
      if (issue.customfield_10020) {
        // Handle multiple sprints (comma-separated)
        const issueSprints = issue.customfield_10020.split(',').map(s => s.trim());
        issueSprints.forEach(sprint => sprints.add(sprint));
      }
    });
    
    return Array.from(sprints).sort();
  }

  // Get issues assigned to a specific sprint
  static getIssuesForSprint(issues: JiraIssue[], sprintName: string): JiraIssue[] {
    return issues.filter(issue => {
      if (!issue.customfield_10020) return false;
      const issueSprints = issue.customfield_10020.split(',').map(s => s.trim());
      return issueSprints.includes(sprintName);
    });
  }

  // Get unassigned issues (no sprint)
  static getUnassignedIssues(issues: JiraIssue[]): JiraIssue[] {
    return issues.filter(issue => !issue.customfield_10020);
  }

  // Assign issue to sprint
  static assignToSprint(issueKey: string, sprintName: string): void {
    const project = DataStore.getActiveProject();
    if (!project) return;

    const issue = project.data.issues.find(i => i.key === issueKey);
    if (!issue) return;

    // Update the issue's sprint field
    issue.customfield_10020 = sprintName;

    // Save the updated project
    DataStore.updateProject(project.id, { data: project.data });
  }

  // Remove issue from sprint (make it unassigned)
  static removeFromSprint(issueKey: string): void {
    const project = DataStore.getActiveProject();
    if (!project) return;

    const issue = project.data.issues.find(i => i.key === issueKey);
    if (!issue) return;

    // Clear the sprint field
    issue.customfield_10020 = null;

    // Save the updated project
    DataStore.updateProject(project.id, { data: project.data });
  }

  // Create a new sprint
  static createSprint(sprintName: string): void {
    const project = DataStore.getActiveProject();
    if (!project) return;

    // Initialize sprints object if it doesn't exist
    if (!project.data.sprints) {
      project.data.sprints = {};
    }

    // Add the new sprint (empty array of issue keys)
    project.data.sprints[sprintName] = [];

    // Save the updated project
    DataStore.updateProject(project.id, { data: project.data });
  }

  // Calculate story points for a sprint
  static getSprintPoints(issues: JiraIssue[], sprintName: string): number {
    const sprintIssues = this.getIssuesForSprint(issues, sprintName);
    return sprintIssues.reduce((total, issue) => {
      const points = parseInt(issue.customfield_10016 || '0');
      return total + points;
    }, 0);
  }

  // Get issue count by type for a sprint
  static getSprintStats(issues: JiraIssue[], sprintName: string) {
    const sprintIssues = this.getIssuesForSprint(issues, sprintName);
    
    return {
      total: sprintIssues.length,
      epics: sprintIssues.filter(i => i.issuetype === 'Epic').length,
      stories: sprintIssues.filter(i => i.issuetype === 'Story').length,
      subtasks: sprintIssues.filter(i => i.issuetype === 'Subtask').length,
      done: sprintIssues.filter(i => i.status.toLowerCase().includes('done')).length,
      points: this.getSprintPoints(issues, sprintName),
    };
  }
}