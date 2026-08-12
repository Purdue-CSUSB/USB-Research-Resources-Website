// Shape and helpers for a project, shared by the form, the card and the detail view. Kept out
// of the component files because a module that exports both components and plain functions
// breaks react-refresh's fast reload.

export const EMPTY_PROJECT_FORM = {
  title: '', description: '', techStack: '', rolesNeeded: '', requirements: '',
  timeCommitment: '', compensation: '', deadline: '', manager: '', contactEmail: ''
};

// Drives the themed inline validation in the form instead of the browser's native
// "fill out this field" bubble. Matches the required list in backend/lib/projectInput.js.
export const REQUIRED_FIELDS = [
  'title', 'description', 'requirements', 'techStack', 'rolesNeeded',
  'timeCommitment', 'compensation', 'deadline', 'manager', 'contactEmail'
];

// A saved project stores techStack as an array; the form edits it as a comma-separated string.
export function projectToForm(project) {
  if (!project) return EMPTY_PROJECT_FORM;
  return {
    title: project.title ?? '',
    description: project.description ?? '',
    techStack: Array.isArray(project.techStack) ? project.techStack.join(', ') : (project.techStack ?? ''),
    rolesNeeded: project.rolesNeeded ?? '',
    requirements: project.requirements ?? '',
    timeCommitment: project.timeCommitment ?? '',
    compensation: project.compensation ?? '',
    deadline: project.deadline ?? '',
    manager: project.manager ?? '',
    contactEmail: project.contactEmail ?? ''
  };
}

// Only produced when the project carries a public contact address. Projects posted before that
// field existed have none, so they get no button rather than a mailto: reading "undefined".
export function buildMailto(project) {
  if (!project?.contactEmail) return null;
  return `mailto:${project.contactEmail}?subject=Application: ${project.title}&body=Hi ${project.manager},%0D%0A%0D%0AI am interested in joining your research team for the ${project.title} project. Please find my resume attached to this email.%0D%0A%0D%0A--- My Details ---%0D%0AName: %0D%0AMajor & Year: %0D%0A%0D%0AWhy I'm a good fit:%0D%0A[Write a brief sentence here about your experience or interest]%0D%0A`;
}
