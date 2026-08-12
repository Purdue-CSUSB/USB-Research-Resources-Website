import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { PROJECT_LIMIT } from '../config.js';
import ResultModal from '../components/ResultModal.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import ProjectFormModal from '../components/ProjectFormModal.jsx';
import ProjectDetailModal from '../components/ProjectDetailModal.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import Button from '../components/ui/Button.jsx';
import PageHeader, { PageShell } from '../components/ui/PageHeader.jsx';
import { fadeUp } from '../components/ui/motion.js';
import { CACHE_KEYS, isStale, readCache, revalidate, writeCache } from '../lib/apiCache.js';

const ResearchProjects = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, user, authFetch } = useAuth();
  const myProjectsKey = CACHE_KEYS.myProjects(user?.email);

  // null = closed. { mode: 'create' } or { mode: 'edit', project } while open.
  const [formState, setFormState] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Drives the styled success/error popup shown after a submission: { type, title, message } | null.
  const [result, setResult] = useState(null);
  // The project whose full text is being read, or null.
  const [viewingProject, setViewingProject] = useState(null);
  // Drives the styled confirm dialog for deletes: the pending project, or null.
  const [pendingDelete, setPendingDelete] = useState(null);

  // Seed from the cache so returning to the board renders the previous list on the first paint
  // instead of flashing a spinner and re-querying the database.
  const [projects, setProjects] = useState(() => readCache(CACHE_KEYS.projects)?.data ?? []);
  const [isLoading, setIsLoading] = useState(() => !readCache(CACHE_KEYS.projects));

  // The caller's own projects, which is both the 3-project cap count and how the board knows
  // which cards to offer Edit/Delete on. The public list deliberately omits userId, so
  // ownership can't be read from it - this is the only thing that identifies them.
  const [myProjects, setMyProjects] = useState(() => readCache(myProjectsKey)?.data ?? []);
  const myProjectIds = useMemo(() => new Set(myProjects.map((p) => p._id)), [myProjects]);
  const atProjectLimit = isAuthenticated && !isAdmin && myProjects.length >= PROJECT_LIMIT;

  // An admin may manage anything; everyone else only their own.
  const canManage = (project) => isAuthenticated && (isAdmin || myProjectIds.has(project._id));

  useEffect(() => {
    if (!isAuthenticated) {
      setMyProjects([]);
      return;
    }

    const cached = readCache(myProjectsKey);
    if (cached) setMyProjects(cached.data);
    if (!isStale(cached)) return;

    let cancelled = false;
    revalidate(myProjectsKey, async () => {
      const response = await authFetch('/api/projects/mine');
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || 'Failed to load your projects.');
      return data;
    })
      .then((data) => { if (!cancelled) setMyProjects(data); })
      .catch((error) => console.error('Failed to load your projects:', error));

    return () => { cancelled = true; };
  }, [isAuthenticated, authFetch, myProjectsKey]);

  // Fetch projects from MongoDB, unless a recent copy is already cached. When the cache is
  // present but past its freshness window the refetch happens quietly underneath the list that
  // is already on screen - no spinner, no empty state, and the rows update in place.
  useEffect(() => {
    if (!isStale(readCache(CACHE_KEYS.projects))) return;

    let cancelled = false;
    revalidate(CACHE_KEYS.projects, async () => {
      const response = await fetch('/api/projects');
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || 'Failed to load projects.');
      return data;
    })
      .then((data) => { if (!cancelled) setProjects(data); })
      .catch((error) => console.error('Failed to load projects:', error))
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, []);

  // Keep both cached lists in step with a local change, so navigating away and back shows the
  // board as the user just left it rather than as it was before their edit.
  const applyProjectChange = (updateList) => {
    setProjects((current) => {
      const next = updateList(current);
      writeCache(CACHE_KEYS.projects, next);
      return next;
    });
    setMyProjects((current) => {
      const next = updateList(current);
      writeCache(myProjectsKey, next);
      return next;
    });
  };

  const handleSubmit = async (formData) => {
    const isEdit = formState?.mode === 'edit';
    const editing = formState?.project;
    setIsSubmitting(true);

    try {
      const response = await authFetch(
        isEdit ? `/api/projects/${editing._id}` : '/api/submit',
        {
          method: isEdit ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        }
      );

      const responseText = await response.text();
      let data = {};

      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch {
        data = { message: responseText || 'Failed to save project.' };
      }

      if (!response.ok) {
        // Show a clean, user-friendly reason instead of the raw "[stage] details" string.
        const message = data.stage === 'moderation'
          ? "Your project didn't pass our moderation check. Please make sure it's a genuine, professional, tech/research project and try again."
          : (data.message || 'Failed to save project. Please try again.');
        setResult({
          type: 'error',
          title: data.stage === 'limit' ? 'Project Limit Reached' : 'Submission Not Approved',
          message
        });
        return;
      }

      // Use the saved document the API echoes back rather than the raw form: it carries the
      // real _id and the server's normalised techStack array.
      const saved = data.project;

      if (isEdit) {
        applyProjectChange((list) => list.map((p) => (p._id === saved._id ? { ...p, ...saved } : p)));
        setViewingProject((current) => (current && current._id === saved._id ? { ...current, ...saved } : current));
        setResult({ type: 'success', title: 'Project Updated', message: 'Your changes are live on the board.' });
      } else {
        applyProjectChange((list) => [saved, ...list]);
        setResult({
          type: 'success',
          title: 'Project Posted!',
          // The API reports notification failures as a warning on an otherwise successful save,
          // so the project is live either way - say so rather than implying it failed.
          message: data.warning
            ? `Your project is now live on the board. ${data.warning}`
            : 'Your project passed moderation and is now live on the board.'
        });
      }

      setFormState(null);
    } catch (error) {
      console.error('Save Error:', error);
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
    const project = pendingDelete;
    setPendingDelete(null);
    if (!project) return;

    // Remove it from the board straight away rather than after the round trip. The request can
    // take a second or more against a cold serverless function, and waiting on it before
    // starting the animation left the user staring at the card they had just confirmed away.
    const previousProjects = projects;
    const previousMine = myProjects;
    applyProjectChange((list) => list.filter((p) => p._id !== project._id));
    setViewingProject((current) => (current && current._id === project._id ? null : current));

    try {
      const response = await authFetch(`/api/projects/${project._id}`, { method: 'DELETE' });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to delete project.');
      }
    } catch (error) {
      console.error('Delete Error:', error);
      // The delete didn't happen, so put the project back exactly where it was.
      setProjects(previousProjects);
      writeCache(CACHE_KEYS.projects, previousProjects);
      setMyProjects(previousMine);
      writeCache(myProjectsKey, previousMine);
      setResult({
        type: 'error',
        title: 'Delete Failed',
        message: error.message || 'Failed to delete project.'
      });
    }
  };

  const handleOpenCreate = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    // Explain the cap on click rather than disabling the button. A greyed-out control tells you
    // that you can't, but not why or what to do about it.
    if (atProjectLimit) {
      setResult({
        type: 'error',
        title: 'Project Limit Reached',
        message: (
          <>
            You've reached the {PROJECT_LIMIT}-project limit. Delete one from your{' '}
            <Link to="/account" className="font-semibold text-usb-charcoal underline">
              Account
            </Link>{' '}
            to post another.
          </>
        )
      });
      return;
    }
    setFormState({ mode: 'create' });
  };

  const handleOpenEdit = (project) => {
    setViewingProject(null);
    setFormState({ mode: 'edit', project });
  };

  const handleRequestDelete = (project) => {
    setViewingProject(null);
    setPendingDelete(project);
  };

  return (
    <>
      <PageShell width="max-w-4xl" className="!pb-2">
        <PageHeader
          title="Research"
          accent="Projects"
          lead="Looking to get involved in undergrad research? Browse open projects below, check out the tech stacks, and reach out directly to the project managers to join the team."
          className="mb-8"
        />
        {/* Fades up with the rest of the page rather than snapping in - the header above and
            the cards below both animate, so a static button was the odd one out. */}
        <motion.div {...fadeUp(0, 0.15)} className="text-center">
          {/* Charcoal rather than gold: this CTA sits centred near the top of the page, which
              is where the backdrop's gold wedge falls, so a gold button blended into it. */}
          {/* Always enabled, even at the cap - handleOpenCreate explains the limit in a dialog
              instead. The helper paragraph that used to sit under here is gone with it. */}
          <Button variant="darkGold" onClick={handleOpenCreate}>
            {isAuthenticated ? 'Post a New Project' : 'Log In to Post a Project'}
          </Button>
        </motion.div>
      </PageShell>

      {/* pt-12 so the grid isn't crowded up against the Post a New Project button above it. */}
      <section className="px-6 sm:px-8 pt-12 pb-16">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="text-center font-body font-semibold text-usb-muted py-20 animate-pulse">
              Loading live projects from database...
            </div>
          ) : projects.length === 0 ? (
            // Same treatment as the lead paragraph under the page title, so the empty board
            // reads as part of the page rather than as a greyed-out system message.
            <div className="font-body text-lg text-usb-charcoal text-center leading-relaxed py-20">
              No active projects right now. Be the first to post one!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* popLayout takes the exiting card out of flow as it fades, so the cards after
                  it reflow into the gap smoothly rather than jumping the moment it's removed. */}
              <AnimatePresence mode="popLayout">
                {projects.map((project, index) => (
                  <ProjectCard
                    key={project._id}
                    project={project}
                    index={index}
                    canManage={canManage(project)}
                    onView={setViewingProject}
                    onEdit={handleOpenEdit}
                    onDelete={handleRequestDelete}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>

      <ProjectFormModal
        open={formState !== null}
        mode={formState?.mode ?? 'create'}
        project={formState?.project ?? null}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onClose={() => setFormState(null)}
      />

      <ProjectDetailModal
        project={viewingProject}
        canManage={viewingProject ? canManage(viewingProject) : false}
        onClose={() => setViewingProject(null)}
        onEdit={handleOpenEdit}
        onDelete={handleRequestDelete}
      />

      <ResultModal result={result} onClose={() => setResult(null)} />
      <ConfirmModal
        open={pendingDelete !== null}
        title="Delete Project?"
        message="This will permanently remove the project from the board. This can't be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
};

export default ResearchProjects;
