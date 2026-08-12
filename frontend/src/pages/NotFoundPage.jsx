import { Link } from "react-router-dom";
import { Home, ArrowLeft, Search } from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import Button from '../components/ui/Button.jsx';
import UnderlineSwipe from '../components/ui/UnderlineSwipe.jsx';
import { StaticCard } from '../components/ui/Card.jsx';

const helpLinks = [
    { path: '/faq', label: 'FAQ' },
    { path: '/organizations-and-programs', label: 'Programs' },
    { path: '/calendar', label: 'Calendar' }
];

export default function NotFoundPage() {
    return (
        <div className="py-16 px-6 flex items-center justify-center">
            <div className="max-w-2xl mx-auto text-center">
                <motion.div
                    className="mb-8"
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, type: 'spring' }}
                >
                    {/* Charcoal, not gold: the page backdrop's gold wedge falls right here, and
                        a gold numeral on it disappeared entirely. */}
                    <h1 className="font-heading font-extrabold text-8xl sm:text-9xl text-usb-charcoal mb-4">404</h1>
                    <motion.div
                        className="h-1 bg-usb-charcoal mx-auto rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: 96 }}
                        transition={{ duration: 0.5, delay: 0.25 }}
                    />
                </motion.div>

                <motion.div
                    className="mb-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                >
                    <h2 className="font-heading font-bold text-3xl text-usb-charcoal mb-4">Page Not Found</h2>
                    <p className="font-body text-lg text-usb-charcoal leading-relaxed">
                        Oops! The page you're looking for doesn't exist. It might have been moved,
                        deleted, or you entered the wrong URL.
                    </p>
                </motion.div>

                <motion.div
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                >
                    <Button to="/" variant="darkGold">
                        <Home className="w-5 h-5" />
                        Go Home
                    </Button>
                    <Button variant="outline" onClick={() => window.history.back()}>
                        <ArrowLeft className="w-5 h-5" />
                        Go Back
                    </Button>
                </motion.div>

                <motion.div
                    className="mt-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 }}
                >
                    <StaticCard padding="p-6 sm:p-8">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <Search className="w-6 h-6 text-usb-gold" />
                            <h3 className="font-heading font-bold text-xl text-usb-charcoal">Need Help?</h3>
                        </div>
                        <p className="font-body text-usb-charcoal mb-5">
                            If you think this is an error, try these helpful links:
                        </p>
                        <div className="flex flex-wrap gap-6 justify-center">
                            {helpLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className="group font-body font-semibold text-usb-charcoal no-underline"
                                >
                                    <span className="relative">
                                        {link.label}
                                        <UnderlineSwipe color="gold" />
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </StaticCard>
                </motion.div>
            </div>
        </div>
    );
}
