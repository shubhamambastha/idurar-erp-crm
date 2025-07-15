/**
 * ProjectsClient Component
 * 
 * Client-side component for the projects list page
 * Handles data fetching, filtering, and user interactions
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import LoadingSpinner from '@/components/LoadingSpinner';
import StatusBadge from '@/components/StatusBadge';
import ConfirmDialog from '@/components/ConfirmDialog';
import ErrorMessage from '@/components/ErrorMessage';
import { useProjects } from '@/hooks/useProjects';
import { ProjectStatus } from '@/types/project';
import { formatDate, formatProjectId } from '@/utils/formatters';
import { PAGE_ROUTES } from '@/utils/constants';

/**
 * Empty state component when no projects are found
 */
function EmptyState({ 
  statusFilter, 
  onClearFilter 
}: { 
  statusFilter: ProjectStatus | 'all';
  onClearFilter: () => void;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
      <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
      <p className="text-gray-600 mb-4">
        {statusFilter !== 'all' ? `No ${statusFilter} projects.` : 'Get started by creating your first project.'}
      </p>
      {statusFilter !== 'all' && (
        <button
          onClick={onClearFilter}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Clear filter
        </button>
      )}
    </div>
  );
}

/**
 * Pagination controls component
 */
function PaginationControls({ 
  pagination, 
  onPageChange 
}: { 
  pagination: ReturnType<typeof useProjects>['pagination'];
  onPageChange: (page: number) => void;
}) {
  const { page, limit, total, totalPages } = pagination;
  
  if (totalPages <= 1) return null;

  return (
    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-b-lg">
      {/* Mobile pagination */}
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
      
      {/* Desktop pagination */}
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing{' '}
            <span className="font-medium">{(page - 1) * limit + 1}</span>
            {' '}to{' '}
            <span className="font-medium">
              {Math.min(page * limit, total)}
            </span>
            {' '}of{' '}
            <span className="font-medium">{total}</span>
            {' '}results
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="relative inline-flex items-center px-3 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            className="relative inline-flex items-center px-3 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Main projects list component
 */
export default function ProjectsClient() {
  const {
    loading,
    error,
    pagination,
    statusFilter,
    filteredProjects,
    fetchProjects,
    deleteProject,
    setPage,
    setStatusFilter,
  } = useProjects();

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Handle project deletion
   */
  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    
    setIsDeleting(true);
    try {
      await deleteProject(deleteConfirmId);
      setDeleteConfirmId(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Projects</h1>
          <p className="text-gray-600">Manage and track all your projects in one place</p>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
              Filter by status:
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | 'all')}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="on-hold">On Hold</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <Link
            href={PAGE_ROUTES.PROJECT_NEW}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium text-sm flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Project
          </Link>
        </div>

        {/* Error State */}
        {error && (
          <ErrorMessage 
            message={error} 
            onRetry={fetchProjects}
            className="mb-6"
          />
        )}

        {/* Loading State */}
        {loading ? (
          <LoadingSpinner />
        ) : filteredProjects.length === 0 ? (
          <EmptyState 
            statusFilter={statusFilter}
            onClearFilter={() => setStatusFilter('all')}
          />
        ) : (
          <>
            {/* Projects Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Project ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                        Created
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProjects.map((project) => (
                      <tr key={project._id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatProjectId(project.projectId)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {project.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 hidden md:table-cell">
                          <div className="max-w-xs truncate">{project.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={project.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                          {formatDate(project.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            href={PAGE_ROUTES.PROJECT_EDIT(project._id)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => setDeleteConfirmId(project._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <PaginationControls 
              pagination={pagination}
              onPageChange={setPage}
            />
          </>
        )}

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={!!deleteConfirmId}
          title="Delete Project"
          message="Are you sure you want to delete this project? This action cannot be undone."
          confirmText="Delete"
          variant="danger"
          onConfirm={handleDelete}
          onCancel={() => setDeleteConfirmId(null)}
          isLoading={isDeleting}
        />
      </div>
    </Layout>
  );
}