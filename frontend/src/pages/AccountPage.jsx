import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { User, Mail, Beaker } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import ResultModal from '../components/ResultModal.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';

const PROJECT_LIMIT = 3;

const AccountPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, token } = useAuth();

  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState(null);
  // Drives the styled confirm dialog for a self-delete: the pending project id, or null.
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchMyProjects = async () => {
      try {
        const response = await fetch('/api/projects/mine', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok) {
          setProjects(data);
        }
      } catch (error) {
        console.error('Failed to load your projects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyProjects();
  }, [isAuthenticated, navigate, token]);

  const confirmDelete = async () => {
    const projectId = pendingDeleteId;
    setPendingDeleteId(null);

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to delete project.');
      }

      setProjects(projects.filter((p) => p._id !== projectId));
      setResult({ type: 'success', title: 'Project Deleted', message: 'Your project has been removed from the board.' });
    } catch (error) {
      console.error('Delete Error:', error);
      setResult({ type: 'error', title: 'Delete Failed', message: error.message || 'Failed to delete project.' });
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <motion.div
      className="min-h-screen pt-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-4xl mx-auto px-6 py-12">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            My <span className="text-green-400">Account</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Manage your account details and the research projects you've posted.
          </p>
        </motion.div>

        <motion.div
          className="bg-black/40 rounded-lg p-6 card-hover mb-8"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.04, 0.62, 0.23, 0.98] }}
        >
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mr-4 text-white">
              <User className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-white">{user?.username}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <Mail className="w-4 h-4 text-green-400" />
            <span>{user?.email}</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.07, ease: [0.04, 0.62, 0.23, 0.98] }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Beaker className="w-5 h-5 text-green-400" />
              Your Projects
            </h2>
            <span className="text-sm font-semibold text-gray-400 bg-gray-800 px-3 py-1 rounded-md">
              {projects.length}/{PROJECT_LIMIT}
            </span>
          </div>

          {isLoading ? (
            <div className="text-center text-green-400 py-12 font-semibold animate-pulse">
              Loading your projects...
            </div>
          ) : projects.length === 0 ? (
            <div className="bg-black/40 rounded-lg p-6 text-center text-gray-400">
              You haven't posted any projects yet.{' '}
              <Link to="/projects" className="text-green-400 hover:text-green-300 underline">
                Post one from the Projects board.
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
                <div key={project._id} className="bg-black/40 rounded-lg p-5 card-hover flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-white truncate">{project.title}</h3>
                    <p className="text-sm text-gray-400">Accepting Until: {project.deadline}</p>
                  </div>
                  <button
                    onClick={() => setPendingDeleteId(project._id)}
                    className="shrink-0 px-3 py-2 bg-gray-800/60 hover:bg-red-600 border border-gray-700/50 hover:border-red-500 text-gray-300 hover:text-white rounded-lg text-sm font-medium transition-all duration-200"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}

          {projects.length >= PROJECT_LIMIT && (
            <p className="mt-4 text-sm text-gray-400 text-center">
              You've reached the {PROJECT_LIMIT}-project limit. Delete one above to post another.
            </p>
          )}
        </motion.div>
      </div>

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

export default AccountPage;
