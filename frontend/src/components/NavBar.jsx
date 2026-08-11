import React, { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Calendar, HelpCircle, Building2, Presentation, Code, Home, Menu, X, Beaker, User, LogOut, LogIn, ChevronDown, Settings } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext.jsx'

// Minimum breathing room between the wordmark and the link row before we are
// willing to lay them out side by side.
const ROW_GAP = 24

const navLinks = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/faq', icon: HelpCircle, label: 'FAQ' },
    { path: '/organizations-and-programs', icon: Building2, label: 'Programs' },
    { path: '/cs-specific-research', icon: Code, label: 'CS Research' },
    { path: '/presenting-your-research', icon: Presentation, label: 'Presenting' },
    { path: '/projects', icon: Beaker, label: 'Projects' },
    { path: '/calendar', icon: Calendar, label: 'Calendar' }
]

// One shared pill so every item in the row — links, log in, the account menu —
// is the same height and sits on the same baseline. Nothing here scales or
// shifts on hover/active, so the row can never knock itself out of alignment.
const itemClass = (active) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium leading-5 whitespace-nowrap transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 ${active ? 'bg-green-600 text-white' : 'text-gray-300 hover:bg-green-600/30 hover:text-green-300'}`

export default function NavBar() {
    const location = useLocation()
    const navigate = useNavigate()
    const { isAuthenticated, user, logout } = useAuth()
    const currentPath = location.pathname
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
    const [isCompact, setIsCompact] = useState(false)
    const userMenuRef = useRef(null)
    const rowRef = useRef(null)
    const brandRef = useRef(null)
    const brandTextRef = useRef(null)
    const linksRef = useRef(null)

    const username = user?.username

    // Collapse to the hamburger the moment the full row stops fitting rather
    // than at a fixed breakpoint. The row's real width depends on the username,
    // the font once it loads, and the zoom level, so any hard-coded breakpoint
    // ends up either wrapping or overlapping at some window size.
    useLayoutEffect(() => {
        const measure = () => {
            const row = rowRef.current
            const brand = brandRef.current
            const brandText = brandTextRef.current
            const links = linksRef.current
            if (!row || !brand || !brandText || !links) return

            // Lay the link row out at its natural width even while it is
            // collapsed. Taking it out of flow for the read keeps this
            // invisible to everything else, and we restore before the browser
            // gets a chance to paint.
            const { display, position, visibility } = links.style
            links.style.display = 'flex'
            links.style.position = 'absolute'
            links.style.visibility = 'hidden'
            // scrollWidth - clientWidth is whatever the wordmark had to clip,
            // so this stays the untruncated width at every window size.
            const clipped = brandText.scrollWidth - brandText.clientWidth
            const needed = brand.scrollWidth + clipped + links.scrollWidth + ROW_GAP
            links.style.display = display
            links.style.position = position
            links.style.visibility = visibility

            setIsCompact(needed > row.clientWidth)
        }

        measure()

        const observer = new ResizeObserver(measure)
        if (rowRef.current) observer.observe(rowRef.current)
        // Widths shift once the webfont swaps in, so measure again then.
        document.fonts?.ready.then(measure)
        return () => observer.disconnect()
    }, [isAuthenticated, username])

    // Close the desktop user dropdown on an outside click.
    useEffect(() => {
        if (!isUserMenuOpen) return
        const handleClickOutside = (e) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setIsUserMenuOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isUserMenuOpen])

    // Widening the window past the collapse point hides the hamburger, so the
    // panel it opened has to go with it.
    useEffect(() => {
        if (!isCompact) setIsMenuOpen(false)
    }, [isCompact])

    const handleLogout = () => {
        logout()
        navigate('/')
        closeMenu()
        setIsUserMenuOpen(false)
    }

    const isActive = (path) => {
        if (path === '/') {
            return currentPath === '/' || currentPath === ''
        }
        return currentPath === path
    }

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen)
    }

    const closeMenu = () => {
        setIsMenuOpen(false)
    }

    return (
        <motion.nav
            className="fixed top-0 left-0 right-0 bg-black/50 backdrop-blur-sm border-b border-gray-700 z-50"
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div ref={rowRef} className={`relative flex items-center justify-between h-[72px] ${isCompact ? 'gap-4' : 'gap-6'}`}>
                    <Link
                        ref={brandRef}
                        to="/"
                        className="flex items-center gap-3 min-w-0 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
                        onClick={closeMenu}
                    >
                        <img
                            src="./Purdue%20USB%20Research%20Resources.png"
                            alt="USB Research Resources Icon"
                            className="w-10 h-10 shrink-0 object-contain"
                            draggable={false}
                        />
                        {/* The truncate is a last resort — the step down under
                            360px is what keeps the wordmark whole on the
                            narrowest phones. */}
                        <span
                            ref={brandTextRef}
                            className="font-bold text-white select-none text-base sm:text-lg max-[359px]:text-sm truncate"
                        >
                            USB Research Resources
                        </span>
                    </Link>

                    <div ref={linksRef} className={`${isCompact ? 'hidden' : 'flex'} items-center gap-1`}>
                        {navLinks.map((item) => {
                            const Icon = item.icon
                            return (
                                <Link key={item.path} to={item.path} className={itemClass(isActive(item.path))}>
                                    <Icon className="w-4 h-4 shrink-0" />
                                    <span>{item.label}</span>
                                </Link>
                            )
                        })}

                        {isAuthenticated ? (
                            <div className="relative" ref={userMenuRef}>
                                <button
                                    onClick={() => setIsUserMenuOpen((open) => !open)}
                                    className={itemClass(isActive('/account'))}
                                    title={username}
                                    aria-expanded={isUserMenuOpen}
                                >
                                    <User className="w-4 h-4 shrink-0" />
                                    {/* Usernames run to 80 characters. Capping the
                                        pill keeps a long one from pushing the whole
                                        row past the point where it fits — the full
                                        name is in the dropdown below. */}
                                    <span className="max-w-20 truncate">{username}</span>
                                    <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                                </button>
                                <AnimatePresence>
                                    {isUserMenuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -8 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute right-0 top-full mt-2 w-56 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl overflow-hidden"
                                        >
                                            <div className="px-4 py-3 border-b border-gray-700 text-sm font-medium text-gray-400 break-words">
                                                {username}
                                            </div>
                                            <Link
                                                to="/account"
                                                onClick={() => setIsUserMenuOpen(false)}
                                                className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-300 hover:bg-green-600/30 hover:text-green-300 transition-colors duration-200"
                                            >
                                                <Settings className="w-4 h-4 shrink-0" />
                                                <span>Account</span>
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-300 hover:bg-red-600/30 hover:text-red-300 transition-colors duration-200 w-full"
                                            >
                                                <LogOut className="w-4 h-4 shrink-0" />
                                                <span>Log Out</span>
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <Link to="/login" className={itemClass(isActive('/login'))}>
                                <LogIn className="w-4 h-4 shrink-0" />
                                <span>Log In</span>
                            </Link>
                        )}
                    </div>

                    <motion.button
                        onClick={toggleMenu}
                        aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                        aria-expanded={isMenuOpen}
                        className={`${isCompact ? 'flex' : 'hidden'} items-center shrink-0 p-2 rounded-lg text-gray-300 hover:bg-green-600/20 hover:text-green-400 outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900`}
                        whileTap={{ scale: 0.9 }}
                    >
                        <AnimatePresence mode="wait" initial={false}>
                            {isMenuOpen ? (
                                <motion.div
                                    key="close"
                                    initial={{ rotate: -90, opacity: 0 }}
                                    animate={{ rotate: 0, opacity: 1 }}
                                    exit={{ rotate: 90, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <X className="w-6 h-6" />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="menu"
                                    initial={{ rotate: 90, opacity: 0 }}
                                    animate={{ rotate: 0, opacity: 1 }}
                                    exit={{ rotate: -90, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Menu className="w-6 h-6" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.button>
                </div>

                <AnimatePresence>
                    {isMenuOpen && isCompact && (
                        <motion.div
                            className="overflow-hidden border-t border-gray-700 -mx-4 px-4 sm:-mx-6 sm:px-6 bg-black/60"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Capped so a short landscape window can still scroll the panel. */}
                            <div className="flex flex-col gap-1 py-4 max-h-[calc(100vh-72px)] overflow-y-auto">
                                {navLinks.map((item, index) => {
                                    const Icon = item.icon
                                    return (
                                        <motion.div
                                            key={item.path}
                                            initial={{ x: -20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: index * 0.06, duration: 0.3 }}
                                        >
                                            <Link
                                                to={item.path}
                                                className={`${itemClass(isActive(item.path))} px-4 py-3`}
                                                onClick={closeMenu}
                                            >
                                                <Icon className="w-4 h-4 shrink-0" />
                                                <span>{item.label}</span>
                                            </Link>
                                        </motion.div>
                                    )
                                })}

                                <div className="flex flex-col gap-1 pt-2 mt-2 border-t border-gray-700">
                                    {isAuthenticated ? (
                                        <>
                                            <div className="flex items-center gap-2 px-4 py-3 text-sm font-medium leading-5 text-gray-400">
                                                <User className="w-4 h-4 shrink-0" />
                                                <span className="truncate">{username}</span>
                                            </div>
                                            <Link
                                                to="/account"
                                                onClick={closeMenu}
                                                className={`${itemClass(isActive('/account'))} px-4 py-3`}
                                            >
                                                <Settings className="w-4 h-4 shrink-0" />
                                                <span>Account</span>
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium leading-5 text-gray-300 hover:bg-red-600/30 hover:text-red-300 transition-colors duration-200 w-full outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
                                            >
                                                <LogOut className="w-4 h-4 shrink-0" />
                                                <span>Log Out</span>
                                            </button>
                                        </>
                                    ) : (
                                        <Link
                                            to="/login"
                                            onClick={closeMenu}
                                            className={`${itemClass(isActive('/login'))} px-4 py-3`}
                                        >
                                            <LogIn className="w-4 h-4 shrink-0" />
                                            <span>Log In</span>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.nav>
    )
}
