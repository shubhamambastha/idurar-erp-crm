/**
 * Custom hook for managing project form state and operations
 */

import { useState, useCallback, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ProjectFormData, ProjectStatus } from '@/types/project';
import { projectService, ApiServiceError } from '@/services/projectService';

interface UseProjectFormOptions {
  initialData?: ProjectFormData;
  projectId?: string;
  onSuccess?: () => void;
}

interface UseProjectFormReturn {
  formData: ProjectFormData;
  loading: boolean;
  error: string | null;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  setFormData: (data: ProjectFormData) => void;
}

/**
 * Hook for managing project form state and submission
 */
export function useProjectForm({
  initialData,
  projectId,
  onSuccess,
}: UseProjectFormOptions = {}): UseProjectFormReturn {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<ProjectFormData>(
    initialData || {
      name: '',
      description: '',
      status: 'active' as ProjectStatus,
    }
  );

  /**
   * Handle form field changes
   */
  const handleChange = useCallback((
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  /**
   * Validate form data
   */
  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Project name is required');
      return false;
    }
    
    if (!formData.description.trim()) {
      setError('Project description is required');
      return false;
    }
    
    return true;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      if (projectId) {
        await projectService.updateProject(projectId, formData);
      } else {
        await projectService.createProject(formData);
      }
      
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/projects');
      }
    } catch (error) {
      const message = error instanceof ApiServiceError
        ? error.message
        : `Failed to ${projectId ? 'update' : 'create'} project`;
      
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [formData, projectId, router, onSuccess]);

  return {
    formData,
    loading,
    error,
    handleChange,
    handleSubmit,
    setFormData,
  };
}