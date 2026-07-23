import React, { useState } from "react";
import { ExternalLinkIcon, BookOpenIcon } from "lucide-react";
import { motion } from 'framer-motion';

const conferences = [
    {
        name: "Fall Undergraduate Research Expo",
        description: "An excellent opportunity for undergraduate researchers to showcase their scholarly work and creative endeavors through poster presentations or research talks.",
        link: "https://www.purdue.edu/undergrad-research/conferences/index.php"
    },
    {
        name: "Spring Undergraduate Research Conference",
        description: "The largest showcase of undergraduate research at Purdue, featuring oral or poster presentations.",
        link: "https://www.purdue.edu/undergrad-research/conferences/index.php"
    },
    {
        name: "Summer Undergraduate Research Symposium",
        description: "An opportunity for undergraduate researchers to present their work through research talks or poster presentations.",
        link: "https://www.purdue.edu/undergrad-research/conferences/index.php"
    }
];

const resources = [
    {
        title: "Journal of Purdue Undergraduate Research (JPUR)",
        description: "Publish research snapshots or articles in JPUR to gain experience in scientific writing and share your work with a broader audience.",
        link: "https://docs.lib.purdue.edu/jpur/"
    },
    {
        title: "Undergraduate Research Seminar Series",
        description: "Great resources to share your work, attend others' presentations, and connect with faculty projects.",
        link: "https://www.purdue.edu/undergrad-research/seminar-series/index.php"
    }
];

const writingResources = [
    "Journal of Purdue Undergraduate Research - Tips for Authors",
    "Purdue Online Writing Lab (OWL)",
    "Research and Citation Resources",
    "Writing scientific abstracts presentation",
    "Writing a research paper"
];

export default function PresentingYourResearchPage() {
    return (
        <motion.div 
            className="min-h-screen pt-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
        >
            <div className="max-w-4xl mx-auto px-6 py-12">
                <motion.div 
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }}
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Presenting Your <span className="text-green-400">Research</span>
                    </h1>
                    <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                        Share your research with the world! Discover opportunities to present your work and gain
                        valuable feedback from peers and professionals.
                    </p>
                </motion.div>

                {/* Conferences Section */}
                <motion.div 
                    className="mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4 }}
                >
                    <h2 className="text-2xl font-bold text-white mb-6">
                        Undergraduate Research <span className="text-green-400">Conferences</span>
                    </h2>
                    <div className="space-y-6">
                        {conferences.map((conference, index) => {
                            const [isHovered, setIsHovered] = useState(false);
                            return (
                                <motion.div 
                                    key={index} 
                                    className="bg-black/40 rounded-lg p-6 card-hover"
                                    initial={{ opacity: 0, x: -30 }}
                                    whileInView={{ 
                                        opacity: 1, 
                                        x: 0,
                                        scale: isHovered ? 1.05 : 1,
                                        y: isHovered ? -6 : 0,
                                    }}
                                    viewport={{ once: true }}
                                    transition={{ 
                                        duration: 0.5,
                                        ease: [0.04, 0.62, 0.23, 0.98],
                                        delay: index * 0.07,
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
                                    <div className="mb-4">
                                        <motion.a
                                            href={conference.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xl font-bold text-green-400 hover:text-green-300 transition-colors flex items-center underline"
                                            whileHover={{ x: 3, scale: 1.03, y: -2 }}
                                            transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                                        >
                                            {conference.name}
                                            <ExternalLinkIcon className="w-5 h-5 ml-2"/>
                                        </motion.a>
                                    </div>
                                    <p className="text-gray-300 leading-relaxed">{conference.description}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Research Images */}
                <motion.div 
                    className="mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4 }}
                >
                    <h2 className="text-2xl font-bold text-white mb-6">
                        Research <span className="text-green-400">Showcase</span>
                    </h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        {[
                            { src: "./presenting_1.jpeg", alt: "Students presenting their research posters at the fall undergraduate research expo.", text: "Students presenting their research posters at the fall undergraduate research expo." },
                            { src: "./presenting_2.png", alt: "Research article cover page in JPUR journal, vol 13. 'Machine Learning of Big Data: A Gaussian Regression Model to Predict' by Jerry Gu.", text: "Research article cover page in JPUR journal, vol 13. \"Machine Learning of Big Data: A Gaussian Regression Model to Predict\" by Jerry Gu." }
                        ].map((img, index) => {
                            const [isHovered, setIsHovered] = useState(false);
                            return (
                                <motion.div 
                                    key={index}
                                    className="bg-black/40 rounded-lg p-6 card-hover"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ 
                                        opacity: 1, 
                                        scale: 1,
                                        y: isHovered ? -6 : 0,
                                    }}
                                    viewport={{ once: true }}
                                    transition={{ 
                                        duration: 0.5,
                                        ease: [0.04, 0.62, 0.23, 0.98],
                                        delay: index * 0.1,
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
                                    <motion.img
                                        src={img.src}
                                        alt={img.alt}
                                        className={`w-full ${index === 0 ? 'h-64 object-cover' : 'max-h-96 object-contain'} rounded-lg mb-4`}
                                        whileHover={{ scale: 1.02 }}
                                        transition={{ duration: 0.3 }}
                                    />
                                    <p className="text-gray-400 text-sm text-center">
                                        {img.text}
                                    </p>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Resources Section */}
                <motion.div 
                    className="mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4 }}
                >
                    <div className="space-y-6">
                        {resources.map((resource, index) => {
                            const [isHovered, setIsHovered] = useState(false);
                            return (
                                <motion.div 
                                    key={index} 
                                    className="bg-black/40 rounded-lg p-6 card-hover"
                                    initial={{ opacity: 0, x: -30 }}
                                    whileInView={{ 
                                        opacity: 1, 
                                        x: 0,
                                        scale: isHovered ? 1.05 : 1,
                                        y: isHovered ? -6 : 0,
                                    }}
                                    viewport={{ once: true }}
                                    transition={{ 
                                        duration: 0.5,
                                        ease: [0.04, 0.62, 0.23, 0.98],
                                        delay: index * 0.07,
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
                                    <div className="mb-4">
                                        <motion.a
                                            href={resource.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xl font-bold text-green-400 hover:text-green-300 transition-colors flex items-center underline"
                                            whileHover={{ x: 3, scale: 1.03, y: -2 }}
                                            transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                                        >
                                            {resource.title}
                                            <ExternalLinkIcon className="w-5 h-5 ml-2"/>
                                        </motion.a>
                                    </div>
                                    <p className="text-gray-300 leading-relaxed mb-4">{resource.description}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Writing Help Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4 }}
                >
                    <h2 className="text-2xl font-bold text-white mb-6">
                        Need Help with <span className="text-green-400">Research Writing?</span>
                    </h2>
                    <div className="bg-black/40 rounded-lg p-6 border" style={{ borderWidth: '1px', borderStyle: 'solid', borderColor: 'rgb(55, 65, 81)' }}>
                        <p className="text-gray-300 mb-6">
                            Writing about your research can be challenging, but these resources are here to help you craft
                            compelling research papers and abstracts.
                        </p>
                        <div className="space-y-3">
                            {writingResources.map((resource, index) => {
                                const [isHovered, setIsHovered] = useState(false);
                                return (
                                    <motion.div 
                                        key={index}
                                        className="flex items-center p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ 
                                            opacity: 1, 
                                            x: 0,
                                            scale: isHovered ? 1.02 : 1,
                                            y: isHovered ? -2 : 0,
                                        }}
                                        viewport={{ once: true }}
                                        transition={{ 
                                            duration: 0.4,
                                            ease: [0.04, 0.62, 0.23, 0.98],
                                            delay: index * 0.06,
                                            scale: { delay: 0, duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] },
                                            y: { delay: 0, duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }
                                        }}
                                        onHoverStart={() => setIsHovered(true)}
                                        onHoverEnd={() => setIsHovered(false)}
                                    >
                                        <BookOpenIcon className="w-5 h-5 text-green-400 mr-3 flex-shrink-0"/>
                                        <span className="text-gray-300">{resource}</span>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}