import { Pencil, Trash2 } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import Button from './ui/Button.jsx';
import { CARD_HOVER_SHADOW, HOVER_TRANSITION } from './ui/motion.js';
import { buildMailto } from '../lib/projectFields.js';

// Every card is the same height regardless of how much anyone typed. Without this a single
// long description stretched its whole grid row, leaving the cards beside it half empty.
// Overflow is clamped rather than shrunk, and the full text lives behind "View details".
const CARD_HEIGHT = 'h-[32rem]';

// A stat in the card's summary panel. Muted micro-label over the value, rather than the
// colour-per-stat scheme this used to have - three accent colours in one small panel read as
// decoration instead of information.
export const Stat = ({ label, value, className = '' }) => (
  <div className={`min-w-0 ${className}`}>
    <span className="block font-heading text-[11px] font-bold uppercase tracking-wide text-usb-muted mb-0.5">{label}</span>
    <span className="block font-body text-sm font-semibold text-usb-charcoal truncate" title={value}>{value}</span>
  </div>
);

const MAX_VISIBLE_TECH = 4;

export default function ProjectCard({ project, index = 0, canManage = false, onView, onEdit, onDelete }) {
  const techStack = project.techStack ?? [];
  const visibleTech = techStack.slice(0, MAX_VISIBLE_TECH);
  const hiddenTechCount = techStack.length - visibleTech.length;
  const mailtoLink = buildMailto(project);

  return (
    <motion.article
      // `layout` is what makes the remaining cards glide into their new positions when one is
      // removed, instead of snapping. `exit` gives the deleted card time to fade out first.
      layout
      // pb-8 rather than a flat p-6: the action row was sitting hard against the bottom edge.
      className={`bg-white border border-usb-border rounded-2xl shadow-md p-6 pb-8 flex flex-col ${CARD_HEIGHT}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.2, ease: "easeInOut" } }}
      transition={{ duration: 0.35, ease: 'easeOut', delay: (index % 6) * 0.05 }}
      whileHover={{ scale: 1.02, boxShadow: CARD_HOVER_SHADOW, transition: HOVER_TRANSITION }}
      style={{ willChange: 'transform, box-shadow' }}
    >
      {/* Each block below is a fixed height rather than content-sized. Letting them size
          themselves inside a fixed-height card meant a long description overflowed its box and
          printed straight over the tech stack heading underneath. */}
      <div className="flex justify-between items-start gap-2 mb-3 min-h-[3.5rem] shrink-0">
        <h2 className="min-w-0 font-heading font-bold text-xl text-usb-charcoal line-clamp-2" title={project.title}>
          {project.title}
        </h2>
        <span className="shrink-0 font-body text-xs font-semibold text-usb-charcoal bg-usb-gold px-2 py-1 rounded-md whitespace-nowrap">
          Until {project.deadline}
        </span>
      </div>

      <div className="h-[4.5rem] overflow-hidden mb-1 shrink-0">
        <p className="font-body text-sm text-usb-charcoal leading-relaxed line-clamp-3">
          {project.description}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onView(project)}
        className="self-start mb-4 shrink-0 font-body text-sm font-semibold text-usb-charcoal underline hover:text-black cursor-pointer"
      >
        View details
      </button>

      <div className="mb-4 shrink-0">
        <h3 className="font-heading text-[11px] font-bold uppercase tracking-wide text-usb-muted mb-2">Tech Stack</h3>
        <div className="flex flex-wrap gap-2 h-7 overflow-hidden">
          {visibleTech.map((tech) => (
            <span key={tech} className="px-3 py-1 bg-gray-100 font-body text-xs rounded-full text-usb-charcoal truncate max-w-[10rem]">
              {tech}
            </span>
          ))}
          {hiddenTechCount > 0 && (
            <span className="px-3 py-1 bg-gray-100 font-body text-xs rounded-full text-usb-muted">
              +{hiddenTechCount}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 shrink-0 bg-usb-zebra border border-usb-rule border-l-4 border-l-usb-gold p-3 rounded-lg">
        <Stat label="Roles Needed" value={project.rolesNeeded} />
        <Stat label="Time (Weekly)" value={project.timeCommitment} />
        <Stat label="Compensation" value={project.compensation} className="sm:col-span-2" />
      </div>

      {/* Absorbs whatever slack is left, so the footer sits on the bottom edge of every card. */}
      <div className="flex-grow" />

      <div className="border-t border-usb-rule pt-4 shrink-0 flex flex-col gap-3">
        <p className="font-body text-sm text-usb-muted truncate">
          Led by: <span className="font-semibold text-usb-charcoal">{project.manager}</span>
        </p>
        <div className="flex items-center gap-2">
          {/* A contained lift - enough to mark this out as the primary action, well short of
              the jump the full-strength version gave it. */}
          {mailtoLink && (
            <Button href={mailtoLink} size="sm" lift="subtle" className="flex-grow">
              Apply via Email
            </Button>
          )}
          {/* Same Button component and variant as the detail dialog's Edit/Delete, so the two
              places look and behave identically - only the size differs, because a card footer
              has no room for labels. */}
          {canManage && (
            <>
              <Button
                variant="ghost"
                size="icon"
                lift={false}
                onClick={() => onEdit(project)}
                title="Edit this project"
                aria-label={`Edit ${project.title}`}
                className="shrink-0"
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                lift={false}
                onClick={() => onDelete(project)}
                title="Delete this project"
                aria-label={`Delete ${project.title}`}
                className="shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </motion.article>
  );
}
