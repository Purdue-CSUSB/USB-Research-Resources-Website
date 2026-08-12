import { useEffect, useState } from 'react';
import ModalShell from './ui/ModalShell.jsx';
import Button from './ui/Button.jsx';
import Field from './ui/Field.jsx';
import { EMPTY_PROJECT_FORM, REQUIRED_FIELDS, projectToForm } from '../lib/projectFields.js';

// The Post-a-Project form, used for both creating and editing. One component so the two paths
// can't drift apart - the field list here is the same one backend/lib/projectInput.js validates.

export default function ProjectFormModal({
  open,
  mode = 'create',
  project = null,
  isSubmitting = false,
  onSubmit,
  onClose
}) {
  const [formData, setFormData] = useState(EMPTY_PROJECT_FORM);
  const [fieldErrors, setFieldErrors] = useState({});

  // Reload the form whenever it opens, so editing a second project doesn't inherit the first
  // one's values and a cancelled edit doesn't leave changes behind.
  useEffect(() => {
    if (!open) return;
    setFormData(mode === 'edit' ? projectToForm(project) : EMPTY_PROJECT_FORM);
    setFieldErrors({});
  }, [open, mode, project]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
    // Clear a field's error as soon as the user starts fixing it.
    if (fieldErrors[name]) {
      setFieldErrors((prevState) => ({ ...prevState, [name]: undefined }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const nextErrors = {};
    for (const name of REQUIRED_FIELDS) {
      if (!formData[name]?.trim()) {
        nextErrors[name] = 'This field is required.';
      }
    }
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }
    setFieldErrors({});
    onSubmit(formData);
  };

  const isEdit = mode === 'edit';

  return (
    <ModalShell
      open={open}
      onDismiss={onClose}
      panelClassName="max-w-2xl border border-usb-border overflow-hidden flex flex-col max-h-[85vh]"
    >
      <div className="p-4 sm:p-6 border-b border-usb-rule flex justify-between items-center shrink-0">
        <h2 className="font-heading font-bold text-2xl text-usb-charcoal">
          {isEdit ? 'Edit Project' : 'Post a Project'}
        </h2>
        <button
          onClick={onClose}
          aria-label="Close"
          className="text-usb-muted hover:text-usb-charcoal transition-colors cursor-pointer text-lg leading-none"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col min-h-0 flex-1">
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto">
          <Field
            id="project-title"
            name="title"
            label="Project Title"
            value={formData.title}
            onChange={handleInputChange}
            error={fieldErrors.title}
            placeholder="e.g. AI Course Chatbot"
          />
          <Field
            as="textarea"
            id="project-description"
            name="description"
            label="What research are you doing?"
            rows="3"
            controlClassName="resize-none"
            value={formData.description}
            onChange={handleInputChange}
            error={fieldErrors.description}
            placeholder="Explain the project, goals, and what you are trying to solve..."
          />
          <Field
            as="textarea"
            id="project-requirements"
            name="requirements"
            label="Role Requirements"
            hint="(Required skills, classes, etc.)"
            rows="2"
            controlClassName="resize-none"
            value={formData.requirements}
            onChange={handleInputChange}
            error={fieldErrors.requirements}
            placeholder="e.g. Must know Python, CS 251 completed..."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-usb-zebra border border-usb-rule p-4 rounded-lg">
            <Field
              id="project-tech-stack"
              name="techStack"
              label="Tech Stack"
              value={formData.techStack}
              onChange={handleInputChange}
              error={fieldErrors.techStack}
              placeholder="e.g. Python, PyTorch"
            />
            <Field
              id="project-roles-needed"
              name="rolesNeeded"
              label="Roles Needed"
              value={formData.rolesNeeded}
              onChange={handleInputChange}
              error={fieldErrors.rolesNeeded}
              placeholder="e.g. 2 Undergrad RAs"
            />
            <Field
              as="select"
              id="project-time-commitment"
              name="timeCommitment"
              label="Time Commitment"
              value={formData.timeCommitment}
              onChange={handleInputChange}
              error={fieldErrors.timeCommitment}
            >
              <option value="" disabled>Select Hours...</option>
              <option value="1-5 hrs/wk">1-5 hrs/wk</option>
              <option value="5-10 hrs/wk">5-10 hrs/wk</option>
              <option value="10-15 hrs/wk">10-15 hrs/wk</option>
              <option value="15+ hrs/wk">15+ hrs/wk</option>
              <option value="Flexible">Flexible</option>
            </Field>
            <Field
              as="select"
              id="project-compensation"
              name="compensation"
              label="Compensation"
              value={formData.compensation}
              onChange={handleInputChange}
              error={fieldErrors.compensation}
            >
              <option value="" disabled>Select Type...</option>
              <option value="Volunteer">Volunteer (Unpaid)</option>
              <option value="Course Credit">Course Credit</option>
              <option value="Paid">Paid (Hourly/Stipend)</option>
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              id="project-deadline"
              name="deadline"
              type="date"
              label="Accepting Applications Until"
              value={formData.deadline}
              onChange={handleInputChange}
              error={fieldErrors.deadline}
            />
            <Field
              id="project-manager"
              name="manager"
              label="Project Manager"
              value={formData.manager}
              onChange={handleInputChange}
              error={fieldErrors.manager}
              placeholder="Pete Purdue"
            />
          </div>

          <Field
            id="project-contact-email"
            name="contactEmail"
            type="email"
            label="Contact Email"
            hint="(shown publicly - this is where applications are sent)"
            value={formData.contactEmail}
            onChange={handleInputChange}
            error={fieldErrors.contactEmail}
            placeholder="pete@purdue.edu"
          />
        </div>

        <div className="p-4 sm:p-6 pt-3 sm:pt-4 flex justify-end gap-3 border-t border-usb-rule shrink-0 bg-white">
          <Button type="button" variant="neutral" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={isSubmitting}>
            {isSubmitting
              ? (isEdit ? 'Saving...' : 'Sending...')
              : (isEdit ? 'Save Changes' : 'Submit for Review')}
          </Button>
        </div>
      </form>
    </ModalShell>
  );
}
