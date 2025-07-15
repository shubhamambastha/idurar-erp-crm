/**
 * Project-related type definitions
 */

/**
 * Represents the status of a project
 */
export type ProjectStatus = 'active' | 'completed' | 'on-hold' | 'cancelled';

/**
 * Main Project interface representing a project document from MongoDB
 */
export interface Project {
  _id: string;
  projectId: string;
  name: string;
  description: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

/**
 * Form data for creating/updating a project
 */
export interface ProjectFormData {
  name: string;
  description: string;
  status: ProjectStatus;
}

/**
 * Pagination metadata returned by the API
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * API response for project list endpoint
 */
export interface ProjectListResponse {
  projects: Project[];
  pagination: PaginationMeta;
}

/**
 * API error response
 */
export interface ApiError {
  error: string;
  message?: string;
}