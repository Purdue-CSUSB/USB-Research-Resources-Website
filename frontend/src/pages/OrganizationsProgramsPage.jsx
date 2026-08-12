import { ExternalLinkIcon } from "lucide-react";
import Card from '../components/ui/Card.jsx';
import PageHeader, { PageShell } from '../components/ui/PageHeader.jsx';
import UnderlineSwipe from '../components/ui/UnderlineSwipe.jsx';

const organizations = [
    {
        title: "Office of Undergraduate Research (OUR)",
        link: "https://www.purdue.edu/undergrad-research/",
        description: "OUR provides a lot of great information on their website. A few places to start include the 'Students' and 'Conferences' tabs. You can also Search Opportunities to find research opportunities available in the various colleges.",
        searchLink: "https://www.purdue.edu/undergrad-research/students/search-opportunities.php"
    },
    {
        title: "CURE-Purdue",
        link: "https://www.purdue.edu/undergrad-research/faculty/cure/index.php",
        description: "The CURE-Purdue Program aims to encourage the incorporation of research into new and existing courses through training and support in creating a course-based undergraduate research experience (CURE). CUREs offer more students opportunities to engage in research with a Purdue faculty/staff instructor for credit."
    },
    {
        title: "John Martinson Honors College (JMHC)",
        link: "https://honors.purdue.edu/current-students/Undergraduate-Research/index.php",
        description: "Students in the JMHC have access to many different resources and opportunities related to research - students may apply for grants, receive regular announcements about new research opportunities, and join communities that cultivate experiential learning in different interdisciplinary themes.",
        fellowshipLink: "https://honors.purdue.edu/current-students/Undergraduate-Research/Undergraduate%20Research%20Fellowship.php"
    },
    {
        title: "Engineering Undergraduate Research Office (EURO)",
        link: "https://engineering.purdue.edu/Engr/Research/EURO",
        description: "EURO provides more information on many undergraduate research opportunities at Purdue, including the First Time Researcher (FTR) Fellowship and the Summer Undergraduate Research Fellowship (SURF).",
        ftrLink: "https://engineering.purdue.edu/Engr/Research/EURO/programs/ftr",
        surfLink: "https://engineering.purdue.edu/Engr/Research/EURO/students/about-SURF"
    },
    {
        title: "Discovery Undergraduate Interdisciplinary Research Internship (DUIRI)",
        link: "https://www.purdue.edu/discoverypark/duri/about/index.php",
        description: "The DUIRI program gives students the opportunity to get involved in research combining two or more disciplinary strengths in the innovative and entrepreneurial environment of Purdue's Discovery Park District."
    },
    {
        title: "Summer Research Opportunities Program (SROP)",
        link: "https://www.purdue.edu/academics/ogsps/diversity/programs/summer-research-opportunities-program/index.php",
        description: "The SROP is an 8-week program intended to give equal access and opportunities to underrepresented students, preparing participants for their graduate studies."
    },
    {
        title: "Summer Stay Scholars",
        link: "https://www.purdue.edu/summerstay/",
        description: "Through the Summer Stay Scholars program, students can combine coursework with a research or internship experience."
    },
    {
        title: "ML@Purdue Projects",
        link: "https://mlpurdue.com/projects/",
        description: "Student-led machine learning research projects that you can apply to join, each run by a mentor who leads the team through a semester or more of hands-on work."
    }
];

export default function OrganizationsProgramsPage() {
    return (
        <PageShell width="max-w-4xl">
            <PageHeader
                title="Research"
                accent="Organizations & Programs"
                lead="Discover the various organizations and programs that support undergraduate research at Purdue University."
            />

            <div className="space-y-6">
                {organizations.map((org, index) => (
                    <Card key={org.title} index={index} padding="p-6 sm:p-8">
                        {/* A gold bar beside the title, sized to the title's own height, so the
                            heading reads as more than a run of black text. */}
                        <div className="flex items-stretch gap-3 mb-3">
                            <span aria-hidden="true" className="w-1 shrink-0 rounded-full bg-usb-gold" />
                            <a
                                href={org.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group inline-flex items-start gap-2 text-usb-charcoal no-underline"
                            >
                                <span className="relative font-heading font-bold text-xl">
                                    {org.title}
                                    <UnderlineSwipe color="gold" />
                                </span>
                                <ExternalLinkIcon className="w-5 h-5 shrink-0 mt-1 text-usb-muted" />
                            </a>
                        </div>
                        <p className="font-body text-usb-charcoal leading-relaxed">{org.description}</p>
                    </Card>
                ))}
            </div>
        </PageShell>
    );
}
