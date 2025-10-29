export interface JiraIssue {
  key: string;
  summary: string;
  issuetype: string;
  status: string;
  statusCategory: string;
  parent: string | null;
  description: string | null;
  customfield_10020: string | null; // Sprint
  customfield_10016: string | null; // Story Points
  priority: string;
  assignee: string | null;
  reporter: string;
  created: string;
  updated: string;
  resolution: string | null;
  subtasks: string[];
  url: string;
  [key: string]: any; // Allow other Jira fields
}

export interface ProjectData {
  metadata: {
    projectName: string;
    lastModified: string;
    version: string;
  };
  summary: {
    total_issues: number;
    epics: number;
    stories: number;
    subtasks: number;
    other: number;
    export_date: string;
  };
  issues: JiraIssue[];
  organized: {
    epics: JiraIssue[];
    stories: JiraIssue[];
    subtasks: JiraIssue[];
    other: JiraIssue[];
  };
  // Application state
  sprints?: Record<string, string[]>; // sprintName -> issue keys
  statusOverrides?: Record<string, string>; // issueKey -> status
}

export interface AppProject {
  id: string;
  name: string;
  data: ProjectData;
  lastAccessed: string;
}