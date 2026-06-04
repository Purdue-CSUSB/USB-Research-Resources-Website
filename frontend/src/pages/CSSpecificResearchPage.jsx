import React, { useState } from "react";

import { ExternalLinkIcon, CodeIcon, UsersIcon, BookOpenIcon, CalendarIcon, LaptopIcon } from "lucide-react";
import { motion } from 'framer-motion';

const researchResources = [
    {
        title: "USB Student Projects Board",
        link: "/projects", 
        description: "A live, centralized database of approved student research projects, tech initiatives, and collaborative opportunities within the department.",
        help: "If you want to apply to join research on campus.",
        icon: <LaptopIcon className="w-5 h-5" />
    },
    {
        title: "Undergraduate Research Opportunities with CS Professor",
        link: "https://www.cs.purdue.edu/corporate/employment/cs%20research.html",
        description: "An updated list of research projects with CS professors who are seeking undergraduate researchers.",
        help: "If you already have an interest in a specific research area or would like to work with a certain professor on a project.",
        icon: <UsersIcon className="w-5 h-5" />
    },
    {
        title: "CS Departmental Research Areas",
        link: "https://www.cs.purdue.edu/research/index.html",
        description: "A summary of the 14 major research areas within the CS Department and the supporting faculty for each.",
        help: "If you do not have a specific research area or professor in mind yet but want to explore all the options available in the Department.",
        icon: <CodeIcon className="w-5 h-5" />
    },
    {
        title: "Research Seminars",
        link: "https://www.cs.purdue.edu/research/seminars.html",
        description: "An updated list of various CS-Related seminar series and colloquiums.",
        help: "If you want to hear about the latest CS Department research directly from faculty.",
        icon: <CalendarIcon className="w-5 h-5" />
    },
    {
        title: "Computational Science Undergrad Research Brightspace Page",
        link: "https://purdue.brightspace.com/d2l/login?sessionExpired=1&target=%2fd2l%2fle%2fcontent%2f910376%2fviewContent%2f13784501%2fView",
        description: "A list of all the undergraduate research programs that offer CS-related projects.",
        help: "If you want an overview of all the possible CS-related research opportunities across the university.",
        icon: <BookOpenIcon className="w-5 h-5" />
    }
];

export default function CSSpecificResearchPage() {
    return (
        <motion.div 
            className="min-h-screen pt-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <div className="max-w-4xl mx-auto px-6 py-12">
                <motion.div 
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }}
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        CS-Specific <span className="text-green-400">Research</span>
                    </h1>
                    <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                        Interested in doing undergraduate research related to your CS/DS/AI Degree but don't know where to start? 
                        Check out this list of helpful resources to learn more!
                    </p>
                </motion.div>

                <div className="space-y-8 mb-12">
                    {researchResources.map((resource, index) => {
                        const [isHovered, setIsHovered] = useState(false);
                        return (
                            <motion.div 
                                key={index} 
                                className="bg-black/40 rounded-lg p-6 card-hover"
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ 
                                    opacity: 1, 
                                    x: 0,
                                    scale: isHovered ? 1.05 : 1,
                                    y: isHovered ? -6 : 0,
                                }}
                                transition={{ 
                                    duration: 0.5,
                                    ease: [0.04, 0.62, 0.23, 0.98],
                                    delay: index * 0.07,
                                    scale: { delay: 0, duration: 0.5, ease: [0.04, 0.62, 0.23, 0.98] },
                                    y: { delay: 0, duration: 0.5, ease: [0.04, 0.62, 0.23, 0.98] }
                                }}
                                onHoverStart={() => setIsHovered(true)}
                                onHoverEnd={() => setIsHovered(false)}
                            >
                                <div className="flex items-center mb-4">
                                    <motion.div 
                                        className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mr-4 text-white"
                                        whileHover={{ scale: 1.15, y: -3 }}
                                        transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                                    >
                                        {resource.icon}
                                    </motion.div>
                                    <motion.a 
                                        href={resource.link} 
                                        // If it's an internal link, you can optionally remove target="_blank" so it doesn't open a new tab!
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-xl font-bold text-green-400 hover:text-green-300 transition-colors flex items-center underline"
                                        whileHover={{ x: 3, scale: 1.03, y: -2 }}
                                        transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                                    >
                                        {resource.title}
                                        <ExternalLinkIcon className="w-5 h-5 ml-2" />
                                    </motion.a>
                                </div>
                            
                                <div className="mb-4">
                                    <h4 className="text-green-400 font-semibold mb-2">Description:</h4>
                                    <p className="text-gray-300 leading-relaxed">{resource.description}</p>
                                </div>
                                
                                <div>
                                    <h4 className="text-green-400 font-semibold mb-2">How it can help:</h4>
                                    <p className="text-gray-300 leading-relaxed">{resource.help}</p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
}