'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DataStore } from '@/lib/dataStore';
import { AppProject } from '@/lib/types';
import ProjectCard from '@/components/ProjectCard';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<AppProject[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    const allProjects = DataStore.getAllProjects();
    const activeId = DataStore.getActiveProjectId();
    setProjects(allProjects);
    setActiveProjectId(activeId);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const project = await DataStore.importFromFile(file);
      DataStore.setActiveProjectId(project.id);
      loadProjects();
      
      // Show success message
      alert(`Successfully imported project: ${project.name}`);
      
      // Redirect to backlog
      router.push('/backlog');
    } catch (error) {
      console.error('Error importing file:', error);
      alert('Error importing file. Please make sure it\'s a valid JSON file.');
    } finally {
      setIsUploading(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const handleSelectProject = (project: AppProject) => {
    DataStore.setActiveProjectId(project.id);
    setActiveProjectId(project.id);
    router.push('/backlog');
  };

  const handleDeleteProject = (project: AppProject) => {
    DataStore.deleteProject(project.id);
    loadProjects();
  };

  const handleExportProject = (project: AppProject) => {
    DataStore.exportProject(project);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Projects</h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Manage your SCRUM project backlogs
          </p>
        </div>
        
        <label className="btn-primary cursor-pointer">
          {isUploading ? 'Uploading...' : '+ Import Project'}
          <input
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="hidden"
          />
        </label>
      </div>

      {projects.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">📁</div>
          <h2 className="text-xl font-semibold mb-2">No projects yet</h2>
          <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>
            Import your Jira JSON export to get started
          </p>
          <label className="btn-primary cursor-pointer inline-block">
            Import Your First Project
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              isActive={project.id === activeProjectId}
              onSelect={handleSelectProject}
              onDelete={handleDeleteProject}
              onExport={handleExportProject}
            />
          ))}
        </div>
      )}
    </div>
  );
}