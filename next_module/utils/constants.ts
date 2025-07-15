/**
 * Application-wide constants
 */

import { ProjectStatus } from '@/types/project';

/**
 * Project status configuration
 */
export const PROJECT_STATUS_CONFIG: Record<ProjectStatus, {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  active: {
    label: 'Active',
    color: 'text-green-800',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-200',
  },
  completed: {
    label: 'Completed',
    color: 'text-blue-800',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-200',
  },
  'on-hold': {
    label: 'On Hold',
    color: 'text-yellow-800',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-200',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-red-800',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-200',
  },
};

/**
 * Pagination defaults
 */
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

/**
 * API routes
 */
export const API_ROUTES = {
  PROJECTS: '/api/projects',
} as const;

/**
 * Page routes
 */
export const PAGE_ROUTES = {
  HOME: '/',
  PROJECTS: '/projects',
  PROJECT_NEW: '/projects/new',
  PROJECT_EDIT: (id: string) => `/projects/${id}/edit`,
} as const;