// Shared TypeScript & JavaScript definitions for ClinCommand OS™
export const Roles = {
  ADMIN: 'Admin',
  MEDICAL_AFFAIRS: 'Head of Medical Affairs',
  MEDICAL_MANAGER: 'Medical Manager',
  COORDINATOR: 'Clinical Research Coordinator',
  MONITOR: 'CRA Monitor',
  VIEWER: 'Viewer'
};

export const ReviewWorkflowStates = {
  INITIAL: 'INITIAL',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  UNDER_QUERY: 'UNDER_QUERY',
  DATA_MANAGER_REVIEW: 'DATA_MANAGER_REVIEW',
  MEDICAL_REVIEW: 'MEDICAL_REVIEW',
  SAFETY_REVIEW: 'SAFETY_REVIEW',
  SDV_VERIFIED: 'SDV_VERIFIED',
  LOCKED: 'LOCKED'
};
