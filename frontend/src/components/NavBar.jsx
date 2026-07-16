import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Calendar, HelpCircle, Building2, Presentation, Code, Home, Menu, X, Beaker, User, LogOut } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext.jsx'

export default function NavBar() {
    const location = useLocation()
    const navigate = useNavigate()
    const { isAuthenticated, user, logout } = useAuth()
    const currentPath = location.pathname
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [hoveredIndex, setHoveredIndex] = useState(null)

    const handleLogout = () => {
        logout()
        navigate('/')
        closeMenu()
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

    const navLinks = [
        { path: '/', icon: Home, label: 'Home' },
        { path: '/faq', icon: HelpCircle, label: 'FAQ' },
        { path: '/organizations-and-programs', icon: Building2, label: 'Programs' },
        { path: '/cs-specific-research', icon: Code, label: 'CS Research' },
        { path: '/presenting-your-research', icon: Presentation, label: 'Presenting' },
        { path: '/projects', icon: Beaker, label: 'Projects' },
        { path: '/calendar', icon: Calendar, label: 'Calendar' }
    ];

    return (
        <motion.nav 
            className="fixed top-0 left-0 right-0 bg-black/50 backdrop-blur-sm border-b border-gray-700 z-50"
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
        >
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Link to="/" className="flex items-center space-x-3" onClick={closeMenu}>
                            <img
                                src="./Purdue%20USB%20Research%20Resources.png"
                                alt="USB Research Resources Icon"
                                className="w-10 h-10 object-contain"
                                draggable={false}
                            />
                            <span className="font-bold text-white select-none text-lg"> USB Research Resources</span>
                        </Link>
                    </motion.div>

                    <div className="hidden md:flex space-x-3">
                        {navLinks.map((item, index) => {
                            const Icon = item.icon
                            return (
                                <motion.div
                                    key={item.path}
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.07, duration: 0.3 }}
                                    className="relative"
                                    style={{ zIndex: hoveredIndex === index ? 20 : isActive(item.path) ? 10 : 1 }}
                                    onMouseEnter={() => setHoveredIndex(index)}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                >
                                    <motion.div
                                        whileHover={!isActive(item.path) ? { scale: 1.05 } : {}}
                                        animate={isActive(item.path) ? { scale: 1.08, y: -2 } : { scale: 1, y: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="relative"
                                    >
                                        <Link 
                                            to={item.path} 
                                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative ${isActive(item.path) ? 'bg-green-600 text-white shadow-2xl' : 'bg-transparent text-gray-300 hover:bg-green-600/30 hover:text-green-300'}`}
                                        >
                                            <Icon className="w-4 h-4" />
                                            <span>{item.label}</span>
                                        </Link>
                                    </motion.div>
                                </motion.div>
                            )
                        })}

                        {isAuthenticated ? (
                            <div className="flex items-center space-x-2 pl-2 ml-2 border-l border-gray-700">
                                <span className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-300">
                                    <User className="w-4 h-4" />
                                    <span>{user?.username}</span>
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-red-600/30 hover:text-red-300 transition-all duration-200"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>Log Out</span>
                                </button>
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ml-2 ${isActive('/login') || isActive('/signup') ? 'bg-green-600 text-white shadow-2xl' : 'bg-transparent text-gray-300 hover:bg-green-600/30 hover:text-green-300'}`}
                            >
                                <User className="w-4 h-4" />
                                <span>Log In</span>
                            </Link>
                        )}
                    </div>

                    <motion.button
                        onClick={toggleMenu}
                        className="md:hidden flex items-center p-2 rounded-lg text-gray-300 hover:bg-green-600/20 hover:text-green-400"
                        whileTap={{ scale: 0.9 }}
                    >
                        <AnimatePresence mode="wait">
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
                    {isMenuOpen && (
                        <motion.div 
                            className="md:hidden mt-4 pb-4 border-t border-gray-700"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="flex flex-col space-y-2 pt-4">
                                {navLinks.map((item, index) => {
                                    const Icon = item.icon
                                    return (
                                        <motion.div
                                            key={item.path}
                                            initial={{ x: -20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: index * 0.06, duration: 0.3 }}
                                        >
                                            <motion.div
                                                whileHover={!isActive(item.path) ? { scale: 1.02 } : {}}
                                                animate={isActive(item.path) ? { scale: 1.08, y: -2 } : { scale: 1, y: 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <Link 
                                                    to={item.path} 
                                                    className={`flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(item.path) ? 'bg-green-600 text-white shadow-2xl' : 'bg-transparent text-gray-300 hover:bg-green-600/30 hover:text-green-300'}`} 
                                                    onClick={closeMenu}
                                                >
                                                    <Icon className="w-4 h-4" />
                                                    <span>{item.label}</span>
                                                </Link>
                                            </motion.div>
                                        </motion.div>
                                    )
                                })}

                                <div className="pt-2 mt-2 border-t border-gray-700">
                                    {isAuthenticated ? (
                                        <>
                                            <div className="flex items-center space-x-2 px-4 py-3 text-sm font-medium text-gray-300">
                                                <User className="w-4 h-4" />
                                                <span>{user?.username}</span>
                                            </div>
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium text-gray-300 hover:bg-red-600/30 hover:text-red-300 transition-all duration-200 w-full"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                <span>Log Out</span>
                                            </button>
                                        </>
                                    ) : (
                                        <Link
                                            to="/login"
                                            onClick={closeMenu}
                                            className={`flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${isActive('/login') || isActive('/signup') ? 'bg-green-600 text-white shadow-2xl' : 'bg-transparent text-gray-300 hover:bg-green-600/30 hover:text-green-300'}`}
                                        >
                                            <User className="w-4 h-4" />
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