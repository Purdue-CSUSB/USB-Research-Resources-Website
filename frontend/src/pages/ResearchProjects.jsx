import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { PROJECT_LIMIT } from '../config.js';
import ResultModal from '../components/ResultModal.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';

// Required fields for the Post-a-Project form; drives the themed inline validation below
// instead of the browser's native "fill out this field" bubble.
const REQUIRED_FIELDS = ['title', 'description', 'requirements', 'techStack', 'rolesNeeded', 'timeCommitment', 'compensation', 'deadline', 'manager'];

// Small helper so every field can show a themed error the same way.
const fieldClasses = (base, hasError) =>
  `${base} ${hasError ? 'border-red-500 focus:border-red-500' : 'border-gray-700 focus:border-green-500'}`;

const FieldError = ({ message }) =>
  message ? (
    <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-400">
      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
      {message}
    </p>
  ) : null;

// House easing curve used for card entrances across the rest of the site (see card-hover / index.css).
const HOUSE_EASE = [0.04, 0.62, 0.23, 0.98];

// Matches the backend cap enforced in submit.js - kept in sync there.

const ResearchProjects = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, authFetch } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Drives the styled success/error popup shown after a submission: { type, title, message } | null.
  const [result, setResult] = useState(null);
  // Drives the styled confirm dialog for admin deletes: the pending project id, or null.
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  // State for live database projects
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  // Which card is currently hovered, for the lift/scale effect other pages use. A single
  // shared value (like NavBar's hoveredIndex) rather than useState-per-card, since this list
  // is fetched/dynamic-length - calling useState inside .map() would break on the next fetch.
  const [hoveredProjectId, setHoveredProjectId] = useState(null);

  const [formData, setFormData] = useState({
    title: '', description: '', techStack: '', rolesNeeded: '', requirements: '',
    timeCommitment: '', compensation: '', deadline: '', manager: ''
  });
  // Field name -> error message, for the themed inline validation (replaces native "fill out this field").
  const [fieldErrors, setFieldErrors] = useState({});
  // How many projects the signed-in user already has, for the "Post a New Project" cap/disable UI.
  const [myProjectCount, setMyProjectCount] = useState(0);
  const atProjectLimit = isAuthenticated && !isAdmin && myProjectCount >= PROJECT_LIMIT;

  // Fetch how many projects the signed-in user already owns, to enforce the 3-project cap in the UI.
  useEffect(() => {
    if (!isAuthenticated) {
      setMyProjectCount(0);
      return;
    }

    const fetchMyProjectCount = async () => {
      try {
        const response = await authFetch('/api/projects/mine');
        const data = await response.json();
        if (response.ok) {
          setMyProjectCount(data.length);
        }
      } catch (error) {
        console.error('Failed to load your project count:', error);
      }
    };

    fetchMyProjectCount();
  }, [isAuthenticated, authFetch]);

  // Fetch projects from MongoDB on load
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects');
        const data = await response.json();
        if (response.ok) {
          setProjects(data);
        }
      } catch (error) {
        console.error("Failed to load projects:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
    // Clear a field's error as soon as the user starts fixing it.
    if (fieldErrors[name]) {
      setFieldErrors(prevState => ({ ...prevState, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Themed inline validation in place of the browser's native "fill out this field" bubbles.
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

    setIsSubmitting(true);

    try {
      const response = await authFetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const responseText = await response.text();
      let data = {};

      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch {
        data = { message: responseText || 'Failed to submit project.' };
      }

      if (!response.ok) {
        // Show a clean, user-friendly reason instead of the raw "[stage] details" string.
        const message = data.stage === 'moderation'
          ? "Your project didn't pass our moderation check. Please make sure it's a genuine, professional, tech/research project and try again."
          : (data.message || "Failed to submit project. Please try again.");
        setResult({
          type: 'error',
          title: data.stage === 'limit' ? 'Project Limit Reached' : 'Submission Not Approved',
          message
        });
        return;
      }

      // Instantly add the new project to the UI without refreshing the page. Use the saved
      // document the API echoes back: this used to fake `_id: Date.now().toString()`, and
      // deleting that card before a reload sent a non-ObjectId and 400'd.
      const newProjectForBoard = {
        ...formData,
        techStack: formData.techStack.split(',').map(tech => tech.trim()),
        ...data.project,
        linkedin: "#"
      };

      setProjects([newProjectForBoard, ...projects]);
      setMyProjectCount((count) => count + 1);
      setIsModalOpen(false);
      setFormData({
        title: '', description: '', techStack: '', rolesNeeded: '', requirements: '',
        timeCommitment: '', compensation: '', deadline: '', manager: ''
      });
      setFieldErrors({});
      setResult({
        type: 'success',
        title: 'Project Posted!',
        // The API reports notification failures as a warning on an otherwise successful save,
        // so the project is live either way - say so rather than implying it failed.
        message: data.warning
          ? `Your project is now live on the board. ${data.warning}`
          : 'Your project passed moderation and is now live on the board.'
      });

    } catch (error) {
      console.error("Submission Error:", error);
      setResult({
        type: 'error',
        title: 'Something Went Wrong',
        message: "We couldn't reach the server. Please check your connection and try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    const projectId = pendingDeleteId;
    setPendingDeleteId(null);

    try {
      const response = await authFetch(`/api/projects/${projectId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Failed to delete project.");
      }

      setProjects(projects.filter((p) => p._id !== projectId));
    } catch (error) {
      console.error("Delete Error:", error);
      setResult({
        type: 'error',
        title: 'Delete Failed',
        message: error.message || "Failed to delete project."
      });
    }
  };

  const handleOpenModal = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (atProjectLimit) {
      return;
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFieldErrors({});
  };

  return (
    <motion.div
      className="min-h-screen text-gray-100 pt-20 pb-16 px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="max-w-4xl mx-auto py-12">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Research <span className="text-green-400">Projects</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Looking to get involved in undergrad research? Browse open projects below, check out the tech stacks, and reach out directly to the project managers to join the team.
          </p>
          <button
            onClick={handleOpenModal}
            disabled={atProjectLimit}
            className={`px-6 py-3 rounded-lg font-semibold shadow-lg transition-all duration-200 transform ${
              atProjectLimit
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-500 hover:shadow-green-900/20 hover:-translate-y-0.5'
            }`}
          >
            {isAuthenticated
              ? (atProjectLimit ? `Project Limit Reached (${PROJECT_LIMIT}/${PROJECT_LIMIT})` : 'Post a New Project')
              : 'Log In to Post a Project'}
          </button>
          {atProjectLimit && (
            <p className="mt-3 text-sm text-gray-400">
              You've reached the {PROJECT_LIMIT}-project limit. Delete one from your{' '}
              <Link to="/account" className="text-green-400 hover:text-green-300 underline">
                Account
              </Link>{' '}
              to post another.
            </p>
          )}
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Loading State Check */}
        {isLoading ? (
          <div className="text-center text-green-400 py-20 font-semibold animate-pulse">
            Loading live projects from database...
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center text-gray-500 py-20">
            No active projects right now. Be the first to post one!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => {
              const mailtoLink = `mailto:${project.email}?subject=Application: ${project.title}&body=Hi ${project.manager},%0D%0A%0D%0AI am interested in joining your research team for the ${project.title} project. Please find my resume attached to this email.%0D%0A%0D%0A--- My Details ---%0D%0AName: %0D%0AMajor & Year: %0D%0A%0D%0AWhy I'm a good fit:%0D%0A[Write a brief sentence here about your experience or interest]%0D%0A`;
              const isHovered = hoveredProjectId === project._id;

              return (
                <motion.div
                  key={project._id}
                  className="bg-gray-900/40 backdrop-blur-md rounded-xl p-6 flex flex-col group shadow-xl card-hover"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    scale: isHovered ? 1.05 : 1,
                    y: isHovered ? -6 : 0,
                  }}
                  transition={{
                    duration: 0.5,
                    ease: HOUSE_EASE,
                    delay: (index % 6) * 0.07,
                    scale: { delay: 0, duration: 0.5, ease: HOUSE_EASE },
                    y: { delay: 0, duration: 0.5, ease: HOUSE_EASE },
                  }}
                  onHoverStart={() => setHoveredProjectId(project._id)}
                  onHoverEnd={() => setHoveredProjectId(null)}
                >
                  <div className="flex justify-between items-start gap-2 mb-3">
                     <h2 className="min-w-0 break-words text-2xl font-bold text-white group-hover:text-green-400 transition-colors duration-200">
                       {project.title}
                     </h2>
                     <span className="shrink-0 text-xs font-semibold text-gray-400 bg-gray-800 px-2 py-1 rounded-md whitespace-nowrap">
                       Accepting Until: {project.deadline}
                     </span>
                  </div>
                  
                  <p className="text-gray-400 mb-6 flex-grow leading-relaxed text-sm">
                    {project.description}
                  </p>
                  
                  <div className="mb-4">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Tech Stack</h3>
                    <div className="flex flex-wrap gap-2">
                      {project.techStack?.map((tech, index) => (
                        <span key={index} className="px-3 py-1 bg-gray-800/60 border border-gray-700/50 text-xs font-medium rounded-md text-gray-300">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 bg-gray-950/50 p-3 rounded-lg border border-gray-800/50">
                    <div>
                      <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">Roles Needed</span>
                      <span className="text-sm text-green-400 font-medium">{project.rolesNeeded}</span>
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">Time (Weekly)</span>
                      <span className="text-sm text-blue-400 font-medium">{project.timeCommitment}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">Compensation</span>
                      <span className="text-sm text-purple-400 font-medium">{project.compensation}</span>
                    </div>
                  </div>

                  <div className="border-t border-gray-800 pt-5 mt-auto flex flex-col gap-4">
                    <p className="text-sm text-gray-400">
                      Led by: <span className="font-semibold text-white">{project.manager}</span>
                    </p>
                    <div className="flex items-center justify-between gap-2">
                      <motion.a
                        href={mailtoLink}
                        className="flex-grow px-4 py-2 bg-green-600/10 hover:bg-green-600 border border-green-600/30 hover:border-green-500 text-green-400 hover:text-white rounded-lg text-sm font-semibold transition-colors duration-200 text-center"
                        whileHover={{ scale: 1.02, y: -2 }}
                        transition={{ duration: 0.3, ease: HOUSE_EASE }}
                      >
                        Apply via Email
                      </motion.a>
                      {isAdmin && (
                        <button
                          onClick={() => setPendingDeleteId(project._id)}
                          title="Admin: delete this project"
                          className="px-3 py-2 bg-gray-800/60 hover:bg-red-600 border border-gray-700/50 hover:border-red-500 text-gray-500 hover:text-white rounded-lg text-sm transition-all duration-200"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Post a Project modal: fixed header + footer, scrollable body */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
          <motion.div
            className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.25 }}
          >
            <div className="p-4 sm:p-6 border-b border-gray-800 flex justify-between items-center shrink-0">
              <h2 className="text-2xl font-bold text-white">Post a Project</h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-white transition-colors">✕</button>
            </div>
            <form onSubmit={handleSubmit} noValidate className="flex flex-col min-h-0 flex-1">
              <div className="p-4 sm:p-6 space-y-5 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Project Title</label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} className={fieldClasses("w-full bg-gray-800 border rounded-lg px-4 py-2 text-white focus:outline-none transition-colors", fieldErrors.title)} placeholder="e.g. AI Course Chatbot" />
                <FieldError message={fieldErrors.title} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">What research are you doing?</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" className={fieldClasses("w-full bg-gray-800 border rounded-lg px-4 py-2 text-white focus:outline-none transition-colors resize-none", fieldErrors.description)} placeholder="Explain the project, goals, and what you are trying to solve..." />
                <FieldError message={fieldErrors.description} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Role Requirements <span className="text-xs text-gray-500 ml-1 font-normal">(Required skills, classes, etc.)</span></label>
                <textarea name="requirements" value={formData.requirements} onChange={handleInputChange} rows="2" className={fieldClasses("w-full bg-gray-800 border rounded-lg px-4 py-2 text-white focus:outline-none transition-colors resize-none", fieldErrors.requirements)} placeholder="e.g. Must know Python, CS 251 completed..." />
                <FieldError message={fieldErrors.requirements} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-950/50 p-4 rounded-lg border border-gray-800/50">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Tech Stack</label>
                  <input type="text" name="techStack" value={formData.techStack} onChange={handleInputChange} className={fieldClasses("w-full bg-gray-800 border rounded-lg px-4 py-2 text-white focus:outline-none transition-colors", fieldErrors.techStack)} placeholder="e.g. Python, PyTorch" />
                  <FieldError message={fieldErrors.techStack} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Roles Needed</label>
                  <input type="text" name="rolesNeeded" value={formData.rolesNeeded} onChange={handleInputChange} className={fieldClasses("w-full bg-gray-800 border rounded-lg px-4 py-2 text-white focus:outline-none transition-colors", fieldErrors.rolesNeeded)} placeholder="e.g. 2 Undergrad RAs" />
                  <FieldError message={fieldErrors.rolesNeeded} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Time Commitment</label>
                  <select name="timeCommitment" value={formData.timeCommitment} onChange={handleInputChange} className={fieldClasses("w-full bg-gray-800 border rounded-lg px-4 py-2 text-white focus:outline-none transition-colors", fieldErrors.timeCommitment)}>
                    <option value="" disabled>Select Hours...</option>
                    <option value="1-5 hrs/wk">1-5 hrs/wk</option>
                    <option value="5-10 hrs/wk">5-10 hrs/wk</option>
                    <option value="10-15 hrs/wk">10-15 hrs/wk</option>
                    <option value="15+ hrs/wk">15+ hrs/wk</option>
                    <option value="Flexible">Flexible</option>
                  </select>
                  <FieldError message={fieldErrors.timeCommitment} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Compensation</label>
                  <select name="compensation" value={formData.compensation} onChange={handleInputChange} className={fieldClasses("w-full bg-gray-800 border rounded-lg px-4 py-2 text-white focus:outline-none transition-colors", fieldErrors.compensation)}>
                    <option value="" disabled>Select Type...</option>
                    <option value="Volunteer">Volunteer (Unpaid)</option>
                    <option value="Course Credit">Course Credit</option>
                    <option value="Paid">Paid (Hourly/Stipend)</option>
                  </select>
                  <FieldError message={fieldErrors.compensation} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Accepting Applications Until</label>
                  <input type="date" name="deadline" value={formData.deadline} onChange={handleInputChange} className={fieldClasses("w-full bg-gray-800 border rounded-lg px-4 py-2 text-white focus:outline-none transition-colors [color-scheme:dark]", fieldErrors.deadline)} />
                  <FieldError message={fieldErrors.deadline} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Project Manager</label>
                  <input type="text" name="manager" value={formData.manager} onChange={handleInputChange} className={fieldClasses("w-full bg-gray-800 border rounded-lg px-4 py-2 text-white focus:outline-none transition-colors", fieldErrors.manager)} placeholder="Pete Purdue" />
                  <FieldError message={fieldErrors.manager} />
                </div>
              </div>
              </div>
              <div className="p-4 sm:p-6 pt-3 sm:pt-4 flex justify-end gap-3 border-t border-gray-800 shrink-0 bg-gray-900">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 rounded-lg font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className={`px-6 py-2 rounded-lg font-medium transition-colors shadow-lg ${isSubmitting ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500 text-white'}`}>
                  {isSubmitting ? 'Sending...' : 'Submit for Review'}
                </button>
              </div>
            </form>
          </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ResultModal result={result} onClose={() => setResult(null)} />
      <ConfirmModal
        open={pendingDeleteId !== null}
        title="Delete Project?"
        message="This will permanently remove the project from the board. This can't be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDeleteId(null)}
      />
    </motion.div>
  );
};

export default ResearchProjects;
