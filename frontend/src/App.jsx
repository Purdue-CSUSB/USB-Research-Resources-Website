import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'
import NavBar from "./components/NavBar.jsx"
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
    
    return (
        <>
            <ScrollToTop />
            <NavBar />
            <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                    <Route path="/" element={<PageWrapper><HomePage /></PageWrapper>}/>
                    <Route path="/faq" element={<PageWrapper><FAQPage /></PageWrapper>}/>
                    <Route path="/organizations-and-programs" element={<PageWrapper><OrganizationsProgramsPage /></PageWrapper>}/>
                    <Route path="/calendar" element={<PageWrapper><CalendarPage /></PageWrapper>}/>
                    <Route path="/presenting-your-research" element={<PageWrapper><PresentingYourResearchPage /></PageWrapper>} />
                    <Route path="/cs-specific-research" element={<PageWrapper><CSSpecificResearchPage /></PageWrapper>} />
                    
                    
                    <Route path="/projects" element={<PageWrapper><ResearchProjects /></PageWrapper>} />
                    <Route path="/login" element={<PageWrapper><LoginPage /></PageWrapper>} />
                    <Route path="/signup" element={<PageWrapper><SignupPage /></PageWrapper>} />
                    <Route path="/forgot-password" element={<PageWrapper><ForgotPasswordPage /></PageWrapper>} />

                    <Route path="*" element={<PageWrapper><NotFoundPage /></PageWrapper>} />
                </Routes>
            </AnimatePresence>
        </>
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