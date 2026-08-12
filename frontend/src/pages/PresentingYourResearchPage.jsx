import { ExternalLinkIcon, BookOpenIcon } from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import Card, { StaticCard } from '../components/ui/Card.jsx';
import PageHeader, { PageShell, SectionHeading } from '../components/ui/PageHeader.jsx';
import UnderlineSwipe from '../components/ui/UnderlineSwipe.jsx';
import { fadeUp } from '../components/ui/motion.js';

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

const showcase = [
    {
        src: "./presenting_1.jpeg",
        alt: "Students presenting their research posters at the fall undergraduate research expo.",
        text: "Students presenting their research posters at the fall undergraduate research expo.",
        imageClass: "h-64 object-cover"
    },
    {
        src: "./presenting_2.png",
        alt: "Research article cover page in JPUR journal, vol 13. 'Machine Learning of Big Data: A Gaussian Regression Model to Predict' by Jerry Gu.",
        text: "Research article cover page in JPUR journal, vol 13. \"Machine Learning of Big Data: A Gaussian Regression Model to Predict\" by Jerry Gu.",
        imageClass: "max-h-96 object-contain"
    }
];

const writingResources = [
    "Journal of Purdue Undergraduate Research - Tips for Authors",
    "Purdue Online Writing Lab (OWL)",
    "Research and Citation Resources",
    "Writing scientific abstracts presentation",
    "Writing a research paper"
];

// Shared by the conferences and resources lists - same card, different copy.
function LinkCard({ title, description, link, index }) {
    return (
        <Card index={index} padding="p-6 sm:p-8">
            {/* A gold bar beside the title, sized to the title's own height - the same
                treatment the Programs cards use, so the two pages read alike. */}
            <div className="flex items-stretch gap-3 mb-3">
                <span aria-hidden="true" className="w-1 shrink-0 rounded-full bg-usb-gold" />
                <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-start gap-2 text-usb-charcoal no-underline"
                >
                    <span className="relative font-heading font-bold text-xl">
                        {title}
                        <UnderlineSwipe color="gold" />
                    </span>
                    <ExternalLinkIcon className="w-5 h-5 shrink-0 mt-1 text-usb-muted" />
                </a>
            </div>
            <p className="font-body text-usb-charcoal leading-relaxed">{description}</p>
        </Card>
    );
}

export default function PresentingYourResearchPage() {
    return (
        <PageShell width="max-w-4xl">
            <PageHeader
                title="Presenting Your"
                accent="Research"
                lead="Share your research with the world! Discover opportunities to present your work and gain valuable feedback from peers and professionals."
            />

            <section className="mb-14">
                <SectionHeading title="Undergraduate Research" accent="Conferences" />
                <div className="space-y-6">
                    {conferences.map((conference, index) => (
                        <LinkCard key={conference.name} index={index} {...conference} title={conference.name} />
                    ))}
                </div>
            </section>

            <section className="mb-14">
                <SectionHeading title="Research" accent="Showcase" />
                <div className="grid md:grid-cols-2 gap-8">
                    {showcase.map((img, index) => (
                        <Card key={img.src} index={index}>
                            <img
                                src={img.src}
                                alt={img.alt}
                                className={`w-full ${img.imageClass} rounded-xl mb-4`}
                            />
                            <p className="font-body text-sm text-usb-muted text-center">{img.text}</p>
                        </Card>
                    ))}
                </div>
            </section>

            <section className="mb-14">
                <SectionHeading title="More" accent="Resources" />
                <div className="space-y-6">
                    {resources.map((resource, index) => (
                        <LinkCard key={resource.title} index={index} {...resource} />
                    ))}
                </div>
            </section>

            <section>
                <SectionHeading title="Need Help with" accent="Research Writing?" />
                <StaticCard padding="p-6 sm:p-8">
                    <p className="font-body text-usb-charcoal leading-relaxed mb-6">
                        Writing about your research can be challenging, but these resources are here to help you craft
                        compelling research papers and abstracts.
                    </p>
                    <ul className="space-y-3 list-none p-0 m-0">
                        {writingResources.map((resource, index) => (
                            <motion.li
                                key={resource}
                                {...fadeUp(index)}
                                className="flex items-center gap-3 p-3 bg-usb-zebra border border-usb-rule rounded-lg"
                            >
                                <BookOpenIcon className="w-5 h-5 shrink-0 text-usb-gold" />
                                <span className="font-body text-usb-charcoal">{resource}</span>
                            </motion.li>
                        ))}
                    </ul>
                </StaticCard>
            </section>
        </PageShell>
    );
}
