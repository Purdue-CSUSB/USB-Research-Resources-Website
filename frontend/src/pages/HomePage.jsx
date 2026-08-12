import { Globe, Camera, HelpCircle, Building2, Code, Beaker } from 'lucide-react';
import { Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import Button from '../components/ui/Button.jsx';
import UnderlineSwipe from '../components/ui/UnderlineSwipe.jsx';
import { fadeUp } from '../components/ui/motion.js';

// Internal shortcuts into the reference pages. Nothing new lives here - it is the same
// navigation the header offers, surfaced where a first-time visitor will actually look.
// The FAQ leads, with the live project board right beside it.
const startingPoints = [
    {
        to: '/faq',
        icon: HelpCircle,
        title: 'Start with the FAQ',
        body: 'Why join a project, how to find one, whether you can get credit or paid for it.'
    },
    {
        to: '/projects',
        icon: Beaker,
        title: 'Browse Open Projects',
        body: 'Every active research project accepting students right now — tech stack, time commitment, and how to apply.'
    },
    {
        to: '/organizations-and-programs',
        icon: Building2,
        title: 'Browse Programs',
        body: 'The offices and funded programs across Purdue that place undergraduates into research.'
    },
    {
        to: '/cs-specific-research',
        icon: Code,
        title: 'Find CS Research',
        body: 'Openings with CS faculty, departmental research areas, seminars, and the project board.'
    }
];

export default function HomePage() {
    return (
        <>
            {/* Hero. Charcoal and full-bleed, with the wordmark centred across the whole band -
                no image, so the type carries the section on its own and can run much larger. */}
            <section className="bg-usb-charcoal px-6 sm:px-8 py-24 lg:py-32">
                <motion.div
                    // max-w-6xl, not 5xl: at the xl heading size the icon + wordmark lockup is
                    // just over 1024px, so a narrower column wraps the icon onto its own line.
                    className="max-w-6xl mx-auto text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
                >
                    {/* The icon sits inline with the wordmark and scales with it, so the pair
                        reads as one lockup at every breakpoint instead of a logo parked above
                        a heading. */}
                    <h1 className="font-body font-bold text-white text-5xl sm:text-6xl lg:text-7xl xl:text-8xl leading-tight mb-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
                        {/* The icon's own artwork is a #333333 rounded square - the exact
                            colour of this section - so without a rule it reads as loose gold
                            lettering rather than a badge. The radius is a percentage because
                            the source art's corners are 16% of its box, so it stays matched
                            as the icon scales across breakpoints. */}
                        <img
                            src="/usb/usb-icon.webp"
                            alt=""
                            aria-hidden="true"
                            className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24 object-contain shrink-0 rounded-[16%] border-2 border-usb-gold"
                            draggable={false}
                        />
                        <span>
                            Research <span className="text-usb-gold">Resources</span>
                        </span>
                    </h1>
                    {/* Left-aligned inside a centred column: a pull quote this long is hard to
                        read ragged-centre, and the gold rule needs an edge to sit against. */}
                    <blockquote className="font-body text-lg sm:text-xl lg:text-2xl text-white/85 leading-relaxed mb-10 border-l-4 border-usb-gold pl-6 text-left max-w-3xl mx-auto">
                        "Anything you can imagine, any unanswered question you can fathom is likely being
                        explored at some level through a research project here on Purdue's campus."
                        <footer className="mt-4 font-semibold text-white/70 text-base lg:text-lg">
                            — Amber Stanley, Undergraduate Programs Specialist
                        </footer>
                    </blockquote>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            href="https://purdue0-my.sharepoint.com/:w:/g/personal/spushpa_purdue_edu/EZm7Z_PgrZlGmrzaz22eTakBxWx92LKsC73_Hp3ERQexaQ?rtime=2Y9k3_ny3Ug"
                            target="_blank"
                            rel="noopener noreferrer"
                            variant="ghostLight"
                            size="lg"
                        >
                            Amber's Research Thoughts
                        </Button>
                        <Button to="/calendar" size="lg">
                            View Research Calendar
                        </Button>
                    </div>
                </motion.div>
            </section>

            {/* The main site's diagonal gold/white split, used here as the backdrop for the
                starting points. */}
            <section className="relative overflow-hidden py-16 px-6 sm:px-8">
                <div
                    aria-hidden="true"
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(to bottom right, #FFCA44 50%, #F8F7F3 50%)' }}
                />
                <div className="relative z-10 max-w-7xl mx-auto">
                    <motion.h2
                        {...fadeUp()}
                        className="font-heading font-bold text-3xl lg:text-4xl text-usb-charcoal text-center mb-10"
                    >
                        Where to Start
                    </motion.h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {startingPoints.map((item, index) => {
                            const Icon = item.icon;
                            return (
                                <motion.div key={item.to} {...fadeUp(index, 0.1)}>
                                    <Link
                                        to={item.to}
                                        className="group flex flex-col h-full bg-white border border-usb-border rounded-2xl shadow-md p-6 no-underline transition-shadow duration-200 hover:shadow-xl"
                                    >
                                        <div className="w-12 h-12 mb-4 bg-usb-gold rounded-lg flex items-center justify-center text-usb-charcoal">
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <h3 className="font-heading font-bold text-xl text-usb-charcoal mb-2">
                                            <span className="relative">
                                                {item.title}
                                                <UnderlineSwipe color="charcoal" />
                                            </span>
                                        </h3>
                                        <p className="font-body text-usb-charcoal leading-relaxed">{item.body}</p>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Connect band, on charcoal like the main site's "Stay Connected" section. */}
            <motion.section
                className="bg-usb-charcoal px-6 sm:px-8 py-16"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
            >
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="font-heading font-bold text-3xl text-white mb-4">Connect with USB</h2>
                    <p className="font-body text-lg text-white/80 leading-relaxed mb-8">
                        Still have questions about undergraduate research or want to reach out? Check out our
                        Instagram and website for more about Purdue USB.
                    </p>
                    <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-4">
                        <a
                            href="https://purdueusb.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center gap-2 font-body font-semibold text-lg text-usb-gold no-underline"
                        >
                            <Globe className="w-6 h-6 shrink-0" />
                            <span className="relative">
                                USB Website
                                <UnderlineSwipe color="gold" />
                            </span>
                        </a>
                        <a
                            href="https://www.instagram.com/purdueusb/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center gap-2 font-body font-semibold text-lg text-usb-gold no-underline"
                        >
                            <Camera className="w-6 h-6 shrink-0" />
                            <span className="relative">
                                USB Instagram
                                <UnderlineSwipe color="gold" />
                            </span>
                        </a>
                    </div>
                </div>
            </motion.section>
        </>
    )
}
