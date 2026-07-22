import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Site-styled replacement for the browser's native alert() used after a project submission.
// Pass `result` = { type: 'success' | 'error', title, message } to open it, or null to close.
const ResultModal = ({ result, onClose }) => {
  const isSuccess = result?.type === 'success';

  const accent = isSuccess
    ? {
        border: 'border-green-600/40',
        badge: 'bg-green-500/15 text-green-400 border-green-500/30',
        button: 'bg-green-600 hover:bg-green-500 text-white',
        icon: '✓'
      }
    : {
        border: 'border-red-600/40',
        badge: 'bg-red-500/15 text-red-400 border-red-500/30',
        button: 'bg-gray-700 hover:bg-gray-600 text-white',
        icon: '✕'
      };

  return (
    <AnimatePresence>
      {result && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            className={`bg-gray-900 border ${accent.border} rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto shadow-2xl p-6 text-center`}
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border text-2xl font-bold ${accent.badge}`}>
              {accent.icon}
            </div>
            <h2 className="text-xl font-bold text-white mb-2">{result.title}</h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">{result.message}</p>
            <button
              onClick={onClose}
              className={`w-full px-6 py-2.5 rounded-lg font-semibold shadow-lg transition-colors ${accent.button}`}
            >
              OK
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ResultModal;
