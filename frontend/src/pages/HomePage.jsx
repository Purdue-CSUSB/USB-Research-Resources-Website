import { Globe, Camera } from 'lucide-react';
import React from "react";
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function HomePage() {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.1
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.45,
                ease: "easeOut"
            }
        }
    }

    return (
        <motion.div 
            className="min-h-screen pt-20 flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
        >
            <div className="max-w-7xl mx-auto px-6 py-24">
                <motion.div 
                    className="text-center"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.h1
                        className="text-4xl sm:text-5xl md:text-7xl font-black text-white mb-8 leading-tight flex flex-wrap items-center justify-center gap-x-3 gap-y-2"
                        variants={itemVariants}
                    >
                        <img
                            src="./Purdue%20USB%20Research%20Resources.png"
                            alt="USB Research Resources Icon"
                            className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 object-contain"
                            draggable={false}
                        />
                        <span className="text-white">Research</span>
                        <span className="bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">Resources</span>
                    </motion.h1>
                    <motion.p 
                        className="text-xl md:text-2xl text-green-100 mb-12 max-w-4xl mx-auto leading-relaxed"
                        variants={itemVariants}
                    >
                        "Anything you can imagine, any unanswered question you can fathom is likely being explored at some level through a research project here on Purdue's campus."<br />- Amber Stanley, Undergraduate Programs Specialist
                    </motion.p>
                    <motion.div 
                        className="flex flex-col sm:flex-row gap-6 justify-center items-center"
                        variants={itemVariants}
                    >
                        <motion.div
                            whileHover={{ scale: 1.02, x: 5 }}
                            transition={{ duration: 0.2 }}
                        >
                            <a 
                                href="https://purdue0-my.sharepoint.com/:w:/g/personal/spushpa_purdue_edu/EZm7Z_PgrZlGmrzaz22eTakBxWx92LKsC73_Hp3ERQexaQ?rtime=2Y9k3_ny3Ug"
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="border-2 border-green-400 text-green-400 px-10 py-4 rounded-xl font-bold text-lg hover:bg-green-400 hover:text-gray-900 transition-all duration-300 flex items-center justify-center"
                            >
                                Amber's Research Thoughts
                            </a>
                        </motion.div>
                        <motion.div
                            whileHover={{ scale: 1.02, x: 5 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Link 
                                to="/calendar"
                                className="bg-gradient-to-r from-green-600 to-green-700 text-white px-10 py-4 rounded-xl font-bold text-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-2xl flex items-center justify-center"
                            >
                                View Research Calendar
                            </Link>
                        </motion.div>
                    </motion.div>
                </motion.div>
            </div>

            <motion.div 
                className="bg-black/50 backdrop-blur-sm pb-16 flex-1 flex flex-col justify-center"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.45 }}
            >
                <div className="max-w-7xl mx-auto px-6 pt-12">
                    <motion.div 
                        className="text-center"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                    >
                        <h2 className="text-3xl font-bold text-white mb-4">Connect with USB</h2>
                        <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-6">
                            Still have questions about undergraduate research or want to reach out? Check out our Instagram and website for more about Purdue USB.
                        </p>
                        <div className="flex justify-center items-center space-x-12">
                            <motion.a
                                href="https://purdueusb.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-yellow-400 hover:text-yellow-300 text-xl font-semibold transition-colors duration-300 flex items-center space-x-2"
                                whileHover={{ scale: 1.1, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Globe className="w-6 h-6"/>
                                <span>USB Website</span>
                            </motion.a>
                            <motion.a
                                href="https://www.instagram.com/purdueusb/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-pink-400 hover:text-pink-300 text-xl font-semibold transition-colors duration-300 flex items-center space-x-2"
                                whileHover={{ scale: 1.1, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Camera className="w-6 h-6"/>
                                <span>USB Instagram</span>
                            </motion.a>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </motion.div>
    )
}