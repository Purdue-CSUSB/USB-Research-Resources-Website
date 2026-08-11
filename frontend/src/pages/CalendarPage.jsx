
import React, { useState } from "react";
import { motion } from 'framer-motion';
import { GOOGLE_CALENDAR_ID, CALENDAR_TIMEZONE } from '../config.js';

export default function CalendarPage() {
    // Both are public constants in src/config.js, matching backend/lib/constants.js, so the
    // embed points at the same calendar the scraper writes events to.
    const calendarId = encodeURIComponent(GOOGLE_CALENDAR_ID)
    const timeZone = encodeURIComponent(CALENDAR_TIMEZONE)
    const [isHovered, setIsHovered] = useState(false);
    
    return (
        <motion.div 
            className="min-h-screen pt-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
        >
            <div className="max-w-7xl mx-auto px-6 py-12">
                <motion.div 
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }}
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Research <span className="text-green-400">Calendar</span>
                    </h1>
                    <p className="text-xl text-green-100 max-w-3xl mx-auto">
                        Stay updated with research events, deadlines, and important dates at Purdue University.
                    </p>
                </motion.div>
                
                <motion.div 
                    className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 card-hover"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ 
                        opacity: 1, 
                        scale: isHovered ? 1.02 : 1,
                        y: isHovered ? -4 : 0,
                    }}
                    transition={{ 
                        duration: 0.5,
                        ease: [0.04, 0.62, 0.23, 0.98],
                        delay: 0.2,
                        scale: { delay: 0, duration: 0.5, ease: [0.04, 0.62, 0.23, 0.98] },
                        y: { delay: 0, duration: 0.5, ease: [0.04, 0.62, 0.23, 0.98] }
                    }}
                    onHoverStart={() => setIsHovered(true)}
                    onHoverEnd={() => setIsHovered(false)}
                    style={{
                        boxShadow: isHovered 
                            ? '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(22, 163, 74, 0.4)' 
                            : 'none',
                    }}
                >
                    <div className="flex justify-center">
                        <iframe
                            title="Google Calendar"
                            src={`https://calendar.google.com/calendar/embed?src=${calendarId}&ctz=${timeZone}`}
                            style={{ 
                                border: '0', 
                                width: '100%', 
                                height: '600px', 
                                frameborder: '0', 
                                scrolling: 'no',
                                borderRadius: '12px'
                            }}
                            allowFullScreen
                        ></iframe>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}