/**
 * Custom hook for managing projects list state and operations
 */

import { useState, useEffect, useCallback } from 'react';
import { Project, PaginationMeta, ProjectStatus } from '@/types/project';
import { projectService, ApiServiceError } from '@/services/projectService';

interface UseProjectsState {
  projects: Project[];
  loading: boolean;
  error: string | null;
  pagination: PaginationMeta;
  statusFilter: ProjectStatus | 'all';
}

interface UseProjectsReturn extends UseProjectsState {
  fetchProjects: () => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  setPage: (page: number) => void;
  setStatusFilter: (status: ProjectStatus | 'all') => void;
  filteredProjects: Project[];
}

/**
 * Hook for managing projects list with pagination and filtering
 */
export function useProjects(): UseProjectsReturn {
  const [state, setState] = useState<UseProjectsState>({
    projects: [],
    loading: true,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    },
    statusFilter: 'all',
  });

  /**
   * Fetch projects from API
   */
  const fetchProjects = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const data = await projectService.getProjects(
        state.pagination.page,
        state.pagination.limit
      );
      
      setState(prev => ({
        ...prev,
        projects: data.projects,
        pagination: data.pagination,
        loading: false,
      }));
    } catch (error) {
      const message = error instanceof ApiServiceError
        ? error.message
        : 'Failed to fetch projects';
      
      setState(prev => ({
        ...prev,
        error: message,
        loading: false,
      }));
    }
  }, [state.pagination.page, state.pagination.limit]);

  /**
   * Delete a project and refresh the list
   */
  const deleteProject = useCallback(async (id: string) => {
    try {
      await projectService.deleteProject(id);
      await fetchProjects();
    } catch (error) {
      const message = error instanceof ApiServiceError
        ? error.message
        : 'Failed to delete project';
      
      setState(prev => ({ ...prev, error: message }));
    }
  }, [fetchProjects]);

  /**
   * Set current page
   */
  const setPage = useCallback((page: number) => {
    setState(prev => ({
      ...prev,
      pagination: { ...prev.pagination, page },
    }));
  }, []);

  /**
   * Set status filter
   */
  const setStatusFilter = useCallback((status: ProjectStatus | 'all') => {
    setState(prev => ({ ...prev, statusFilter: status }));
  }, []);

  /**
   * Load projects when page changes
   */
  useEffect(() => {
    fetchProjects();
  }, [state.pagination.page]);

  /**
   * Filter projects by status
   */
  const filteredProjects = state.statusFilter === 'all'
    ? state.projects
    : state.projects.filter(p => p.status === state.statusFilter);

  return {
    ...state,
    fetchProjects,
    deleteProject,
    setPage,
    setStatusFilter,
    filteredProjects,
  };
}