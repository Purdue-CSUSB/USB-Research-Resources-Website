import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'
import NavBar from "./components/NavBar.jsx"
import Footer from "./components/Footer.jsx"
import HomePage from "./pages/HomePage.jsx"
import FAQPage from "./pages/FAQPage.jsx"
import OrganizationsProgramsPage from "./pages/OrganizationsProgramsPage.jsx"
import CalendarPage from "./pages/CalendarPage.jsx"
import PresentingYourResearchPage from "./pages/PresentingYourResearchPage.jsx";
import CSSpecificResearchPage from "./pages/CSSpecificResearchPage.jsx"
import NotFoundPage from "./pages/NotFoundPage.jsx"
import LoginPage from "./pages/LoginPage.jsx"
import SignupPage from "./pages/SignupPage.jsx"
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx"
import AccountPage from "./pages/AccountPage.jsx"
import { AuthProvider } from "./context/AuthContext.jsx"


import ResearchProjects from "./pages/ResearchProjects.jsx"

function ScrollToTop() {
    const { pathname } = useLocation()

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [pathname])

    return null
}

function PageWrapper({ children }) {
    return (
        <motion.div
            className="flex-1 flex flex-col"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
        >
            {children}
        </motion.div>
    )
}

function AppRoutes() {
    const location = useLocation()

    // The column layout is what keeps the footer at the bottom of the viewport on the short
    // pages (login, 404) instead of floating halfway up. pt-20 clears the fixed navbar.
    return (
        <div className="min-h-screen flex flex-col">
            <ScrollToTop />
            {/* The homepage's two-tone diagonal, used as a backdrop for every other page.

                Fixed to the viewport rather than sized to the page. `to bottom right` takes
                its angle from its box, so anchoring this to the routed content made the
                diagonal shallower on a long page than a short one, and a fixed-height band
                instead ran out partway down and left the rest of a long page bare. Pinning it
                to the viewport solves both: the wedge is pixel-identical on every route, and
                a page of any length scrolls over it without ever running past it.

                Content sits above via z-10; the homepage's opaque charcoal hero covers it. */}
            <div
                aria-hidden="true"
                className="pointer-events-none fixed inset-0"
                style={{ background: 'linear-gradient(to bottom right, #FFCA44 50%, #F8F7F3 50%)' }}
            />
            <NavBar />
            {/* The flex chain from here down to PageWrapper lets a page opt into filling the
                whole area between nav and footer - which is what the auth pages need to carry
                a full-bleed charcoal background. Pages that don't opt in just stack from the
                top as before. */}
            <main className="relative z-10 flex-1 pt-20 flex flex-col">
                <div className="flex-1 flex flex-col">
                    <AnimatePresence mode="wait">
                        <Routes location={location} key={location.pathname}>
                            <Route path="/" element={<PageWrapper><HomePage /></PageWrapper>} />
                            <Route path="/faq" element={<PageWrapper><FAQPage /></PageWrapper>} />
                            <Route path="/organizations-and-programs" element={<PageWrapper><OrganizationsProgramsPage /></PageWrapper>} />
                            <Route path="/calendar" element={<PageWrapper><CalendarPage /></PageWrapper>} />
                            <Route path="/presenting-your-research" element={<PageWrapper><PresentingYourResearchPage /></PageWrapper>} />
                            <Route path="/cs-specific-research" element={<PageWrapper><CSSpecificResearchPage /></PageWrapper>} />

                            <Route path="/projects" element={<PageWrapper><ResearchProjects /></PageWrapper>} />
                            <Route path="/login" element={<PageWrapper><LoginPage /></PageWrapper>} />
                            <Route path="/signup" element={<PageWrapper><SignupPage /></PageWrapper>} />
                            <Route path="/forgot-password" element={<PageWrapper><ForgotPasswordPage /></PageWrapper>} />
                            <Route path="/account" element={<PageWrapper><AccountPage /></PageWrapper>} />

                            <Route path="*" element={<PageWrapper><NotFoundPage /></PageWrapper>} />
                        </Routes>
                    </AnimatePresence>
                </div>
            </main>
            <div className="relative z-10">
                <Footer />
            </div>
        </div>
    )
}

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </BrowserRouter>
    )
}