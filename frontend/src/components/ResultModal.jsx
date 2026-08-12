import { Check, AlertTriangle } from 'lucide-react';
import ModalShell from './ui/ModalShell.jsx';
import Button from './ui/Button.jsx';

// Site-styled replacement for the browser's native alert() used after a project submission.
// Pass `result` = { type: 'success' | 'error', title, message } to open it, or null to close.
//
// Laid out like the Post a Project modal - square icon tile beside the title, body, then a
// ruled footer with the action on the right - so the two dialogs read as the same component.
// The old pastel circle badge and washed-out grey button weren't an idiom used anywhere else
// on the site.
const ResultModal = ({ result, onClose }) => {
  const isSuccess = result?.type === 'success';

  // Brand tokens only - gold and charcoal - so this reads as part of the site rather than as
  // a generic alert box. The two states stay distinguishable by inverting the tile, which is
  // the same pairing the darkGold buttons use, and the icon carries the meaning. The tile
  // itself is the w-11 rounded-lg shape used on the CS Research cards and the account page.
  const tone = isSuccess
    ? { tile: 'bg-usb-gold text-usb-charcoal', Icon: Check }
    : { tile: 'bg-usb-charcoal text-usb-gold', Icon: AlertTriangle };

  return (
    <ModalShell
      open={Boolean(result)}
      onDismiss={onClose}
      panelClassName="max-w-md border border-usb-border overflow-hidden flex flex-col max-h-[85vh]"
    >
      <div className="p-6 overflow-y-auto">
        <div className="flex items-center gap-3 mb-3">
          <span className={`w-11 h-11 shrink-0 rounded-lg flex items-center justify-center ${tone.tile}`}>
            <tone.Icon className="w-5 h-5" />
          </span>
          <h2 className="font-heading font-bold text-xl text-usb-charcoal">{result?.title}</h2>
        </div>
        <p className="font-body text-usb-charcoal leading-relaxed">{result?.message}</p>
      </div>
      <div className="px-6 py-4 border-t border-usb-rule flex justify-end shrink-0">
        {/* The site's standard gold CTA - this only dismisses, so it needs no danger styling. */}
        <Button size="sm" onClick={onClose} className="min-w-24">
          OK
        </Button>
      </div>
    </ModalShell>
  );
};

export default ResultModal;
