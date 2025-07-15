/**
 * Project API service
 * Handles all API communication for project-related operations
 */

import { Project, ProjectFormData, ProjectListResponse, ApiError } from '@/types/project';

/**
 * Base API configuration
 */
const API_BASE_URL = '/api/projects';

/**
 * Custom error class for API errors
 */
export class ApiServiceError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiServiceError';
  }
}

/**
 * Generic fetch wrapper with error handling
 */
async function fetchWithErrorHandling<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorData = await response.json() as ApiError;
      throw new ApiServiceError(
        response.status,
        errorData.error || 'An error occurred'
      );
    }
    
    return await response.json() as T;
  } catch (error) {
    if (error instanceof ApiServiceError) {
      throw error;
    }
    throw new Error('Network error occurred');
  }
}

/**
 * Project service methods
 */
export const projectService = {
  /**
   * Fetch paginated list of projects
   * @param page - Page number (1-based)
   * @param limit - Number of items per page
   * @param signal - AbortSignal for request cancellation
   */
  async getProjects(
    page: number = 1,
    limit: number = 10,
    signal?: AbortSignal
  ): Promise<ProjectListResponse> {
    const url = `${API_BASE_URL}?page=${page}&limit=${limit}`;
    return fetchWithErrorHandling<ProjectListResponse>(url, { signal });
  },

  /**
   * Fetch a single project by ID
   * @param id - Project MongoDB ID
   */
  async getProject(id: string): Promise<Project> {
    const url = `${API_BASE_URL}/${id}`;
    return fetchWithErrorHandling<Project>(url);
  },

  /**
   * Create a new project
   * @param data - Project form data
   */
  async createProject(data: ProjectFormData): Promise<Project> {
    return fetchWithErrorHandling<Project>(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  },

  /**
   * Update an existing project
   * @param id - Project MongoDB ID
   * @param data - Updated project data
   */
  async updateProject(id: string, data: ProjectFormData): Promise<Project> {
    const url = `${API_BASE_URL}/${id}`;
    return fetchWithErrorHandling<Project>(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a project
   * @param id - Project MongoDB ID
   */
  async deleteProject(id: string): Promise<{ message: string }> {
    const url = `${API_BASE_URL}/${id}`;
    return fetchWithErrorHandling<{ message: string }>(url, {
      method: 'DELETE',
    });
  },
};