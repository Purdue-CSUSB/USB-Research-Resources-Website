import { useState } from "react";
import { CalendarIcon, ChevronDownIcon } from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import Button from '../components/ui/Button.jsx';
import PageHeader, { PageShell } from '../components/ui/PageHeader.jsx';
import { fadeUp } from '../components/ui/motion.js';

const accordionData = [
    {
        title: 'Why should I join a research project?',
        content: 'A research project can provide you with a lot of experiences and skills. Similar to a job or internship, you will be working with different resources and technologies which you can use to gain experience and add to your resume. As well, you can explore other disciplines at Purdue like Biology, Astronomy, History, and much more!'
    },
    {
        title: 'How do I find a research project?',
        content: 'You can check out our page here to find more about all the possible opportunities available! We have listed the different research orgs/programs available. If you want to find a project on your own, you can search up professors working in the field in which you want to and email them with your CV/Resume and a message.'
    },
    {
        title: 'What is CS research?',
        content: 'CS Research can vary. It can be theoretical, analytical, or anything you can think of. Since CS is so versatile, it can be applied to any discipline. If you like digging into the theoretical concept of CS, that\'s a route that is available. Or if you like to leverage CS to discover trends, patterns, etc, that\'s also another route available. Depending on your preference, there is something for everyone in CS research'
    },
    {
        title: 'What are the different types of research I can be involved in?',
        content: 'At Purdue, there are a vast amount of openings for all different openings. You can do only coding, you can do hands-on work with tech, or you can do something not related to CS! It\'s mainly about finding what kind of research you are interested in. Almost any type of research is available at Purdue.'
    },
    {
        title: 'Do I need a lot of experience to join a project?',
        content: 'Depending on the project, experience level may matter. However, for most projects, a lot of people are looking for motivated students. If you see a project and you believe you have relevant skills, you should definitely apply!'
    },
    {
        title: 'How can I present my research?',
        content: 'Purdue holds Undergraduate Research Conferences every semester for students to present their research. You can showcase your work in a panel or to judges walking by. As well, you can publish your completed Research Paper to the Journal of Purdue Undergraduate Research to make it available to the public.'
    },
    {
        title: 'Can I get credits/paid for my Research?',
        content: 'Yes! Some research projects require you to sign up for 1-3 credits to add to your schedule, and some may be transferable to your plan of study. Talk to your advisor more about whether credits from research can be applied towards your graduation. As well, you can get paid for some research projects. Make sure to read the description of the projects to see if they will pay you.'
    }
];

// An open item is marked with a gold left rule rather than a lift, so a page with several
// answers expanded still reads as a calm list instead of a stack of floating panels.
function AccordionItem({ title, content, isOpen, onToggle, index }) {
    return (
        <motion.div
            {...fadeUp(index)}
            className={`bg-white border rounded-xl overflow-hidden transition-colors duration-300 ${
                isOpen ? 'border-usb-gold shadow-md' : 'border-usb-border'
            }`}
        >
            <button
                className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-usb-zebra transition-colors duration-200 cursor-pointer"
                onClick={onToggle}
                aria-expanded={Boolean(isOpen)}
            >
                <span className="font-heading font-bold text-lg text-usb-charcoal">{title}</span>
                <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="shrink-0"
                >
                    <ChevronDownIcon className="w-5 h-5 text-usb-gold" />
                </motion.span>
            </button>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeOut', opacity: { duration: 0.2 } }}
                        className="overflow-hidden"
                    >
                        <div className="px-6 pb-5 pt-1 border-t border-usb-rule">
                            <p className="font-body text-usb-charcoal leading-relaxed pt-4">{content}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default function FAQPage() {
    const [openItems, setOpenItems] = useState({});

    const toggleItem = (index) => {
        setOpenItems(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    return (
        <PageShell width="max-w-4xl">
            <PageHeader
                title="Frequently Asked"
                accent="Questions"
                lead="Find answers to common questions about undergraduate research at Purdue University."
            />

            <div className="space-y-4">
                {accordionData.map((item, index) => (
                    <AccordionItem
                        key={item.title}
                        index={index}
                        title={item.title}
                        content={item.content}
                        isOpen={openItems[index]}
                        onToggle={() => toggleItem(index)}
                    />
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="mt-16 bg-usb-charcoal rounded-2xl p-8 sm:p-10 text-center"
            >
                <h2 className="font-heading font-bold text-2xl sm:text-3xl text-white mb-4">
                    Need More Help? Schedule an Appointment!
                </h2>
                <p className="font-body text-lg text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed">
                    Still have some questions that weren't answered on this page or in our FAQ Section?
                </p>
                <Button
                    href="https://calendly.com/csstudentaffairs"
                    target="_blank"
                    rel="noopener noreferrer"
                    size="lg"
                >
                    <CalendarIcon className="w-5 h-5" />
                    Schedule an Appointment with Amber Stanley
                </Button>
            </motion.div>
        </PageShell>
    );
}
