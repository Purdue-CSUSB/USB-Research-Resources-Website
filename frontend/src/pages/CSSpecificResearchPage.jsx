import { Link } from "react-router-dom";
import { ExternalLinkIcon, CodeIcon, UsersIcon, BookOpenIcon, CalendarIcon, LaptopIcon } from "lucide-react";
import Card from '../components/ui/Card.jsx';
import PageHeader, { PageShell } from '../components/ui/PageHeader.jsx';
import UnderlineSwipe from '../components/ui/UnderlineSwipe.jsx';

const researchResources = [
    {
        title: "USB Student Projects Board",
        link: "/projects",
        // The only entry that points inside this app, so it routes rather than opening a tab.
        internal: true,
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

function ResourceTitle({ resource }) {
    const label = (
        <>
            <span className="relative font-heading font-bold text-xl">
                {resource.title}
                <UnderlineSwipe color="gold" />
            </span>
            {!resource.internal && <ExternalLinkIcon className="w-5 h-5 shrink-0 text-usb-muted" />}
        </>
    )

    // items-center so the external-link glyph rides with the last line of the title rather
    // than being nudged down by a hand-tuned margin.
    const className = "group inline-flex items-center gap-2 text-usb-charcoal no-underline"

    return resource.internal ? (
        <Link to={resource.link} className={className}>{label}</Link>
    ) : (
        <a href={resource.link} target="_blank" rel="noopener noreferrer" className={className}>{label}</a>
    )
}

export default function CSSpecificResearchPage() {
    return (
        <PageShell width="max-w-4xl">
            <PageHeader
                title="CS-Specific"
                accent="Research"
                lead="Interested in doing undergraduate research related to your CS/DS/AI Degree but don't know where to start? Check out this list of helpful resources to learn more!"
            />

            <div className="space-y-6">
                {researchResources.map((resource, index) => (
                    <Card key={resource.title} index={index} padding="p-6 sm:p-8">
                        {/* items-center so the title sits level with the icon tile instead of
                            top-aligned against it, which read as misaligned. */}
                        <div className="flex items-center gap-4 mb-5">
                            <div className="w-11 h-11 shrink-0 bg-usb-gold rounded-lg flex items-center justify-center text-usb-charcoal">
                                {resource.icon}
                            </div>
                            <ResourceTitle resource={resource} />
                        </div>

                        <div className="mb-4">
                            <h4 className="font-heading font-bold text-xs uppercase tracking-wide text-usb-muted mb-1">Description</h4>
                            <p className="font-body text-usb-charcoal leading-relaxed">{resource.description}</p>
                        </div>

                        <div>
                            <h4 className="font-heading font-bold text-xs uppercase tracking-wide text-usb-muted mb-1">How it can help</h4>
                            <p className="font-body text-usb-charcoal leading-relaxed">{resource.help}</p>
                        </div>
                    </Card>
                ))}
            </div>
        </PageShell>
    );
}
