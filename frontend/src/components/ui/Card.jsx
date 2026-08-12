import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CARD_HOVER_SHADOW, HOVER_TRANSITION, fadeUp } from './motion.js'

// The main site's white card: grey hairline border, generous radius, lifts slightly on hover.
//
// Hover is handled entirely by framer-motion's whileHover here. That matters beyond tidiness:
// three pages used to call useState inside .map() to track their own hover flag, which only
// worked because those arrays happen to be a fixed length. Owning the gesture in the card
// means a list can be any length and the Rules of Hooks are never in question.

const MotionLink = motion.create(Link)

export default function Card({
    to,
    href,
    index = 0,
    hover = true,
    className = '',
    padding = 'p-6',
    children,
    ...rest
}) {
    const classes = `bg-white border border-usb-border rounded-2xl shadow-md ${padding} ${className}`

    const motionProps = {
        ...fadeUp(index),
        // The gesture carries its own transition so the lift is snappy (0.18s) even though the
        // mount animation it shares props with is slower.
        ...(hover
            ? { whileHover: { scale: 1.02, boxShadow: CARD_HOVER_SHADOW, transition: HOVER_TRANSITION } }
            : {}),
        style: { willChange: 'transform, box-shadow' }
    }

    if (to) {
        return (
            <MotionLink to={to} {...motionProps} {...rest} className={`block no-underline ${classes}`}>
                {children}
            </MotionLink>
        )
    }

    if (href) {
        return (
            <motion.a href={href} {...motionProps} {...rest} className={`block no-underline ${classes}`}>
                {children}
            </motion.a>
        )
    }

    return (
        <motion.div {...motionProps} {...rest} className={classes}>
            {children}
        </motion.div>
    )
}

// A card that never animates - for static panels that would otherwise inherit the lift.
export function StaticCard({ className = '', padding = 'p-6', children, ...rest }) {
    return (
        <div {...rest} className={`bg-white border border-usb-border rounded-2xl shadow-md ${padding} ${className}`}>
            {children}
        </div>
    )
}
