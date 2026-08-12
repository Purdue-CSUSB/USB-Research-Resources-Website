import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Beaker } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { PROJECT_LIMIT } from '../config.js';
import ResultModal from '../components/ResultModal.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import ProjectFormModal from '../components/ProjectFormModal.jsx';
import PageHeader, { PageShell } from '../components/ui/PageHeader.jsx';
import { StaticCard } from '../components/ui/Card.jsx';
import { fadeUp } from '../components/ui/motion.js';
import { CACHE_KEYS, isStale, mutateCache, readCache, revalidate, writeCache } from '../lib/apiCache.js';

const AccountPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, authFetch } = useAuth();

  // Shares the cache entry with the projects board, which reads the same endpoint for the
  // 3-project cap - so arriving here from there is instant, and vice versa.
  const myProjectsKey = CACHE_KEYS.myProjects(user?.email);
  const [projects, setProjects] = useState(() => readCache(myProjectsKey)?.data ?? []);
  const [isLoading, setIsLoading] = useState(() => !readCache(myProjectsKey));
  const [result, setResult] = useState(null);
  // Drives the styled confirm dialog for a self-delete: the pending project id, or null.
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  // The project being edited, or null. Everything listed here is the caller's own, so no
  // ownership check is needed - /api/projects/mine only ever returns their projects.
  const [editingProject, setEditingProject] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const cached = readCache(myProjectsKey);
    if (cached) setProjects(cached.data);
    if (!isStale(cached)) return;

    let cancelled = false;
    revalidate(myProjectsKey, async () => {
      const response = await authFetch('/api/projects/mine');
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || 'Failed to load your projects.');
      return data;
    })
      .then((data) => { if (!cancelled) setProjects(data); })
      .catch((error) => console.error('Failed to load your projects:', error))
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, [isAuthenticated, navigate, authFetch, myProjectsKey]);

  const handleSaveEdit = async (formData) => {
    setIsSaving(true);
    try {
      const response = await authFetch(`/api/projects/${editingProject._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message = data.stage === 'moderation'
          ? "Your changes didn't pass our moderation check. Please make sure it's a genuine, professional, tech/research project and try again."
          : (data.message || 'Failed to save your changes.');
        setResult({ type: 'error', title: 'Changes Not Saved', message });
        return;
      }

      const saved = data.project;
      setProjects((current) => {
        const next = current.map((p) => (p._id === saved._id ? { ...p, ...saved } : p));
        writeCache(myProjectsKey, next);
        return next;
      });
      // The public board caches the same project separately, so it has to see the edit too.
      mutateCache(CACHE_KEYS.projects, (all) =>
        all.map((p) => (p._id === saved._id ? { ...p, ...saved } : p))
      );
      setEditingProject(null);
      setResult({ type: 'success', title: 'Project Updated', message: 'Your changes are live on the board.' });
    } catch (error) {
      console.error('Edit Error:', error);
      setResult({ type: 'error', title: 'Something Went Wrong', message: "We couldn't reach the server. Please try again." });
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    const projectId = pendingDeleteId;
    setPendingDeleteId(null);
    if (!projectId) return;

    // Drop the row immediately so it starts collapsing the moment they confirm; waiting for the
    // server first made a slow request look like a frozen page.
    const previousProjects = projects;
    const nextProjects = projects.filter((p) => p._id !== projectId);
    setProjects(nextProjects);
    writeCache(myProjectsKey, nextProjects);
    // The public board caches the same project separately; drop it there too, or going back
    // to /projects would still show a row that no longer exists.
    mutateCache(CACHE_KEYS.projects, (all) => all.filter((p) => p._id !== projectId));
    setResult({ type: 'success', title: 'Project Deleted', message: 'Your project has been removed from the board.' });

    try {
      const response = await authFetch(`/api/projects/${projectId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to delete project.');
      }
    } catch (error) {
      console.error('Delete Error:', error);
      // Put the row back - nothing was deleted.
      setProjects(previousProjects);
      writeCache(myProjectsKey, previousProjects);
      mutateCache(CACHE_KEYS.projects, (all) =>
        all.some((p) => p._id === projectId) ? all : [...all, previousProjects.find((p) => p._id === projectId)]
      );
      setResult({ type: 'error', title: 'Delete Failed', message: error.message || 'Failed to delete project.' });
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    // Full-bleed charcoal, matching the auth pages - this is the other signed-in-only screen,
    // so the two read as one area of the site. `flex-1` fills down to the footer.
    <PageShell width="max-w-4xl" className="flex-1 bg-usb-charcoal">
      <PageHeader
        onDark
        title="My"
        accent="Account"
        lead="Manage your account details and the research projects you've posted."
      />

      <motion.div {...fadeUp(0, 0.1)} className="mb-10">
        <StaticCard padding="p-6 sm:p-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-11 h-11 shrink-0 bg-usb-gold rounded-lg flex items-center justify-center text-usb-charcoal">
              <User className="w-5 h-5" />
            </div>
            <span className="font-heading font-bold text-xl text-usb-charcoal break-words">{user?.username}</span>
          </div>
          <div className="flex items-center gap-2 font-body text-usb-charcoal">
            <Mail className="w-4 h-4 shrink-0 text-usb-gold" />
            <span className="break-words">{user?.email}</span>
          </div>
        </StaticCard>
      </motion.div>

      <motion.div {...fadeUp(1, 0.1)}>
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="font-heading font-bold text-xl text-white flex items-center gap-2">
            <Beaker className="w-5 h-5 text-usb-gold" />
            Your Projects
          </h2>
          <span className="font-body text-sm font-semibold text-usb-charcoal bg-usb-gold px-3 py-1 rounded-md">
            {projects.length}/{PROJECT_LIMIT}
          </span>
        </div>

        {isLoading ? (
          <div className="text-center font-body font-semibold text-white/70 py-12 animate-pulse">
            Loading your projects...
          </div>
        ) : projects.length === 0 ? (
          <StaticCard className="text-center">
            <p className="font-body text-usb-charcoal">
              You haven't posted any projects yet.{' '}
              <Link to="/projects" className="font-semibold text-usb-charcoal underline">
                Post one from the Projects board.
              </Link>
            </p>
          </StaticCard>
        ) : (
          // Zebra-striped rows with hairline dividers - the same table idiom the main site
          // uses for its schedules, rather than a stack of individually-floating cards.
          <div className="overflow-hidden rounded-2xl border border-usb-border bg-white shadow-md">
            {/* A deleted row collapses its own height as it fades, so the rows below slide up
                rather than jumping into place. */}
            <AnimatePresence initial={false}>
            {projects.map((project, index) => (
              <motion.div
                key={project._id}
                layout
                exit={{ opacity: 0, height: 0, paddingTop: 0, paddingBottom: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className={`overflow-hidden flex items-center justify-between gap-4 p-5 ${
                  index % 2 === 1 ? 'bg-usb-zebra' : 'bg-white'
                } ${index > 0 ? 'border-t border-usb-rule' : ''}`}
              >
                <div className="min-w-0">
                  <h3 className="font-heading font-bold text-lg text-usb-charcoal truncate">{project.title}</h3>
                  <p className="font-body text-sm text-usb-muted">Accepting Until: {project.deadline}</p>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <button
                    onClick={() => setEditingProject(project)}
                    className="px-3 py-2 rounded-lg font-body text-sm font-semibold text-usb-charcoal border border-usb-border hover:bg-usb-charcoal hover:text-white transition-colors duration-200 cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setPendingDeleteId(project._id)}
                    className="px-3 py-2 rounded-lg font-body text-sm font-semibold text-usb-charcoal border border-usb-border hover:bg-usb-charcoal hover:text-white transition-colors duration-200 cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            ))}
            </AnimatePresence>
          </div>
        )}

        {projects.length >= PROJECT_LIMIT && (
          <p className="mt-4 font-body text-sm text-white/70 text-center">
            You've reached the {PROJECT_LIMIT}-project limit. Delete one above to post another.
          </p>
        )}
      </motion.div>

      <ProjectFormModal
        open={editingProject !== null}
        mode="edit"
        project={editingProject}
        isSubmitting={isSaving}
        onSubmit={handleSaveEdit}
        onClose={() => setEditingProject(null)}
      />

      <ResultModal result={result} onClose={() => setResult(null)} />
      <ConfirmModal
        open={pendingDeleteId !== null}
        title="Delete Project?"
        message="This will permanently remove the project from the board. This can't be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDeleteId(null)}
      />
    </PageShell>
  );
};

export default AccountPage;
