// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'
import { fadeDown, fadeUp } from './motion.js'

// The main site's interior-page header, used verbatim on every /initiatives/* page over there:
// a centred extrabold Montserrat title over an optional lead paragraph.
//
// `accent` used to render in gold. It can't any more: the page now sits on a gold/surface
// diagonal, so a gold word lands on a gold background wherever the split happens to fall and
// disappears. Charcoal is the only colour that holds up on both halves (8:1 on the gold,
// 11:1 on the surface), so the title reads as one phrase and the diagonal carries the brand
// instead. The prop is kept so call sites don't have to change.
// `onDark` flips the type to white for the pages that sit on a full-bleed charcoal panel.
export default function PageHeader({ title, accent, lead, onDark = false, className = '' }) {
    return (
        <div className={`mb-10 ${className}`}>
            <motion.h1
                {...fadeDown()}
                className={`text-center font-heading font-extrabold text-4xl lg:text-5xl mb-6 ${onDark ? 'text-white' : 'text-usb-charcoal'}`}
            >
                {title}
                {accent && <> {accent}</>}
            </motion.h1>
            {lead && (
                <motion.p
                    {...fadeUp(0, 0.1)}
                    className={`font-body text-lg text-center max-w-4xl mx-auto leading-relaxed ${onDark ? 'text-white/80' : 'text-usb-charcoal'}`}
                >
                    {lead}
                </motion.p>
            )}
        </div>
    )
}

// Section heading within a page. Left-aligned rather than centred, so it reads as a divider
// inside the content instead of competing with the page title. Charcoal throughout for the
// same reason as PageHeader above - these sit on the left of the column, which is the side
// the gold wedge covers.
export function SectionHeading({ title, accent, className = '' }) {
    return (
        <motion.h2
            {...fadeUp()}
            className={`font-heading font-bold text-2xl sm:text-3xl text-usb-charcoal mb-6 ${className}`}
        >
            {title}
            {accent && <> {accent}</>}
        </motion.h2>
    )
}

// Every interior page sits in the same shell: white, a comfortable gutter, and a centred column.
export function PageShell({ width = 'max-w-6xl', className = '', children }) {
    return (
        <section className={`py-12 px-6 sm:px-8 ${className}`}>
            <div className={`${width} mx-auto`}>{children}</div>
        </section>
    )
}
