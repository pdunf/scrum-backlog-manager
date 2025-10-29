'use client';

import { ProjectData, AppProject } from './types';

const STORAGE_KEY = 'scrum-projects';
const ACTIVE_PROJECT_KEY = 'active-project-id';

export class DataStore {
  // Get all projects
  static getAllProjects(): AppProject[] {
    if (typeof window === 'undefined') return [];
    
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    
    try {
      return JSON.parse(data);
    } catch (error) {
      console.error('Error parsing projects from localStorage:', error);
      return [];
    }
  }

  // Save all projects
  static saveAllProjects(projects: AppProject[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }

  // Get a specific project by ID
  static getProject(id: string): AppProject | null {
    const projects = this.getAllProjects();
    return projects.find(p => p.id === id) || null;
  }

  // Create a new project
  static createProject(name: string, data: ProjectData): AppProject {
    const project: AppProject = {
      id: this.generateId(),
      name,
      data,
      lastAccessed: new Date().toISOString(),
    };

    const projects = this.getAllProjects();
    projects.push(project);
    this.saveAllProjects(projects);
    
    return project;
  }

  // Update an existing project
  static updateProject(id: string, updates: Partial<AppProject>): void {
    const projects = this.getAllProjects();
    const index = projects.findIndex(p => p.id === id);
    
    if (index !== -1) {
      projects[index] = {
        ...projects[index],
        ...updates,
        lastAccessed: new Date().toISOString(),
      };
      this.saveAllProjects(projects);
    }
  }

  // Delete a project
  static deleteProject(id: string): void {
    const projects = this.getAllProjects();
    const filtered = projects.filter(p => p.id !== id);
    this.saveAllProjects(filtered);
    
    // If we deleted the active project, clear it
    if (this.getActiveProjectId() === id) {
      this.setActiveProjectId(null);
    }
  }

  // Get active project ID
  static getActiveProjectId(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ACTIVE_PROJECT_KEY);
  }

  // Set active project ID
  static setActiveProjectId(id: string | null): void {
    if (typeof window === 'undefined') return;
    
    if (id === null) {
      localStorage.removeItem(ACTIVE_PROJECT_KEY);
    } else {
      localStorage.setItem(ACTIVE_PROJECT_KEY, id);
      
      // Update last accessed time
      this.updateProject(id, {});
    }
  }

  // Get active project
  static getActiveProject(): AppProject | null {
    const id = this.getActiveProjectId();
    if (!id) return null;
    return this.getProject(id);
  }

  // Generate a unique ID
  private static generateId(): string {
    return `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Import project from JSON file
  static async importFromFile(file: File): Promise<AppProject> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const data: ProjectData = JSON.parse(content);
          
          // Validate that it has the required structure
          if (!data.issues || !Array.isArray(data.issues)) {
            throw new Error('Invalid project file: missing issues array');
          }
          
          // Use the project name from metadata, or derive from filename
          const projectName = data.metadata?.projectName || 
                             data.issues[0]?.project || 
                             file.name.replace('.json', '');
          
          // Add metadata if missing
          if (!data.metadata) {
            data.metadata = {
              projectName,
              lastModified: new Date().toISOString(),
              version: '1.0',
            };
          }
          
          // Initialize sprints and status overrides if not present
          if (!data.sprints) {
            data.sprints = {};
          }
          if (!data.statusOverrides) {
            data.statusOverrides = {};
          }
          
          const project = this.createProject(projectName, data);
          resolve(project);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
      
      reader.readAsText(file);
    });
  }

  // Export project to JSON file
  static exportProject(project: AppProject): void {
    const dataStr = JSON.stringify(project.data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_backup.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}