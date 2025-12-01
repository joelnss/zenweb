// Project Types
export const PROJECT_TYPES = [
  { value: 'new_website', label: 'New Website' },
  { value: 'website_redesign', label: 'Website Redesign' },
  { value: 'mobile_app', label: 'Mobile App' },
  { value: 'ecommerce_platform', label: 'eCommerce Platform' },
  { value: 'platform_migration', label: 'Platform Migration' },
  { value: 'oci_punchout', label: 'OCI Punch-Out' },
  { value: 'payment_integration', label: 'Payment Gateway Integration' },
  { value: 'erp_integration', label: 'ERP Integration' },
  { value: 'b2b_portal', label: 'B2B Customer Portal' },
  { value: 'inventory_management', label: 'Inventory Management' },
  { value: 'marketplace_integration', label: 'Marketplace Integration' },
  { value: 'custom_development', label: 'Custom Development' },
  { value: 'maintenance', label: 'Maintenance & Support' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'other', label: 'Other' },
] as const;

export type ProjectType = typeof PROJECT_TYPES[number]['value'];

export type ProjectStatus = 'draft' | 'pending' | 'approved' | 'in_progress' | 'review' | 'completed' | 'cancelled' | 'on_hold';
export type ProjectPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Project {
  id: string;
  userId: string;
  name: string;
  slug: string;
  type: ProjectType;
  status: ProjectStatus;
  priority: ProjectPriority;
  description: string;
  requirements?: string;
  timeline?: string;
  budgetMin?: number;
  budgetMax?: number;
  budgetRange?: string;
  website?: string;
  startDate?: string;
  targetDate?: string;
  completedAt?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectInput {
  userId: string;
  name: string;
  type: ProjectType;
  description: string;
  timeline?: string;
  budgetRange?: string;
  website?: string;
  priority?: ProjectPriority;
}

const STORAGE_KEY = 'zenweb_projects';

// Generate URL-friendly slug
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    + '-' + Date.now().toString(36);
}

// Generate unique ID
function generateId(): string {
  return 'proj_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// Get all projects
export function getAllProjects(): Project[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

// Get projects by user ID
export function getProjectsByUserId(userId: string): Project[] {
  return getAllProjects().filter(p => p.userId === userId);
}

// Get project by ID
export function getProjectById(id: string): Project | null {
  return getAllProjects().find(p => p.id === id) || null;
}

// Get project by slug
export function getProjectBySlug(slug: string): Project | null {
  return getAllProjects().find(p => p.slug === slug) || null;
}

// Create a new project
export function createProject(input: CreateProjectInput): { success: boolean; project?: Project; message: string } {
  try {
    const projects = getAllProjects();

    const newProject: Project = {
      id: generateId(),
      userId: input.userId,
      name: input.name,
      slug: generateSlug(input.name),
      type: input.type,
      status: 'pending',
      priority: input.priority || 'normal',
      description: input.description,
      timeline: input.timeline,
      budgetRange: input.budgetRange,
      website: input.website,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    projects.push(newProject);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));

    return { success: true, project: newProject, message: 'Project created successfully' };
  } catch (error) {
    console.error('Error creating project:', error);
    return { success: false, message: 'Failed to create project' };
  }
}

// Update project
export function updateProject(id: string, updates: Partial<Project>): { success: boolean; project?: Project; message: string } {
  try {
    const projects = getAllProjects();
    const index = projects.findIndex(p => p.id === id);

    if (index === -1) {
      return { success: false, message: 'Project not found' };
    }

    projects[index] = {
      ...projects[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    return { success: true, project: projects[index], message: 'Project updated successfully' };
  } catch (error) {
    console.error('Error updating project:', error);
    return { success: false, message: 'Failed to update project' };
  }
}

// Update project status
export function updateProjectStatus(id: string, status: ProjectStatus): { success: boolean; message: string } {
  return updateProject(id, { status });
}

// Delete project
export function deleteProject(id: string): { success: boolean; message: string } {
  try {
    const projects = getAllProjects();
    const filtered = projects.filter(p => p.id !== id);

    if (filtered.length === projects.length) {
      return { success: false, message: 'Project not found' };
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return { success: true, message: 'Project deleted successfully' };
  } catch (error) {
    console.error('Error deleting project:', error);
    return { success: false, message: 'Failed to delete project' };
  }
}

// Get project type label
export function getProjectTypeLabel(type: ProjectType): string {
  return PROJECT_TYPES.find(t => t.value === type)?.label || type;
}

// Get status color for UI
export function getProjectStatusColor(status: ProjectStatus): string {
  const colors: Record<ProjectStatus, string> = {
    draft: 'gray',
    pending: 'yellow',
    approved: 'blue',
    in_progress: 'cyan',
    review: 'purple',
    completed: 'green',
    cancelled: 'red',
    on_hold: 'orange',
  };
  return colors[status] || 'gray';
}
