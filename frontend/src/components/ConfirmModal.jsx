import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Site-styled replacement for the browser's native confirm() dialog.
const ConfirmModal = ({ open, title, message, confirmLabel = 'Confirm', onConfirm, onCancel }) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onCancel}
        >
          <motion.div
            className="bg-gray-900 border border-red-600/40 rounded-2xl w-full max-w-md shadow-2xl p-6 text-center"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border text-2xl font-bold bg-red-500/15 text-red-400 border-red-500/30">
              !
            </div>
            <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">{message}</p>
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 px-6 py-2.5 rounded-lg font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 px-6 py-2.5 rounded-lg font-semibold shadow-lg bg-red-600 hover:bg-red-500 text-white transition-colors"
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
