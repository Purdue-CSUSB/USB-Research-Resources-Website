import React, { useState, useEffect } from 'react';

const ResearchProjects = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); 
  
  // State for live database projects
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    title: '', description: '', techStack: '', rolesNeeded: '', requirements: '', 
    timeCommitment: '', compensation: '', deadline: '', manager: '', email: ''
  });

  // Fetch projects from MongoDB on load
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects');
        const data = await response.json();
        if (response.ok) {
          setProjects(data);
        }
      } catch (error) {
        console.error("Failed to load projects:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    
    if (!formData.email.endsWith('@purdue.edu')) {
      alert("Nice try! You must use a valid @purdue.edu email to post a project.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit project.");
      }
      
      alert("Project passed moderation and was saved permanently!");
      
      // Instantly add the new project to the UI without refreshing the page
      const newProjectForBoard = {
        _id: Date.now().toString(), // Temp ID until refresh
        ...formData,
        techStack: formData.techStack.split(',').map(tech => tech.trim()), 
        linkedin: "#"
      };

      setProjects([newProjectForBoard, ...projects]);
      setIsModalOpen(false);
      setFormData({ 
        title: '', description: '', techStack: '', rolesNeeded: '', requirements: '', 
        timeCommitment: '', compensation: '', deadline: '', manager: '', email: '' 
      });
      
    } catch (error) {
      console.error("Submission Error:", error);
      alert(error.message || "Failed to send the project. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-emerald-950 text-gray-100 pt-32 pb-16 px-6 relative">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
            Research Projects
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl leading-relaxed">
            Looking to get involved in undergrad research? Browse open projects below, check out the tech stacks, and reach out directly to the project managers to join the team.
          </p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="mt-6 px-6 py-3 rounded-lg font-semibold bg-green-600 text-white shadow-lg hover:bg-green-500 hover:shadow-green-900/20 transition-all duration-200 transform hover:-translate-y-0.5"
          >
            Post a New Project
          </button>
        </div>

        {/* Loading State Check */}
        {isLoading ? (
          <div className="text-center text-green-400 py-20 font-semibold animate-pulse">
            Loading live projects from database...
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center text-gray-500 py-20">
            No active projects right now. Be the first to post one!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => {
              const mailtoLink = `mailto:${project.email}?subject=Application: ${project.title}&body=Hi ${project.manager},%0D%0A%0D%0AI am interested in joining your research team for the ${project.title} project. Please find my resume attached to this email.%0D%0A%0D%0A--- My Details ---%0D%0AName: %0D%0AMajor & Year: %0D%0A%0D%0AWhy I'm a good fit:%0D%0A[Write a brief sentence here about your experience or interest]%0D%0A`;

              return (
                <div key={project._id} className="bg-gray-900/40 backdrop-blur-md border border-gray-800 rounded-xl p-6 flex flex-col hover:border-green-600/50 transition-all duration-300 group shadow-xl">
                  <div className="flex justify-between items-start mb-3">
                     <h2 className="text-2xl font-bold text-white group-hover:text-green-400 transition-colors duration-200">
                       {project.title}
                     </h2>
                     <span className="text-xs font-semibold text-gray-400 bg-gray-800 px-2 py-1 rounded-md whitespace-nowrap ml-2">
                       Due: {project.deadline}
                     </span>
                  </div>
                  
                  <p className="text-gray-400 mb-6 flex-grow leading-relaxed text-sm">
                    {project.description}
                  </p>
                  
                  <div className="mb-4">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Tech Stack</h3>
                    <div className="flex flex-wrap gap-2">
                      {project.techStack?.map((tech, index) => (
                        <span key={index} className="px-3 py-1 bg-gray-800/60 border border-gray-700/50 text-xs font-medium rounded-md text-gray-300">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-6 bg-gray-950/50 p-3 rounded-lg border border-gray-800/50">
                    <div>
                      <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">Roles Needed</span>
                      <span className="text-sm text-green-400 font-medium">{project.rolesNeeded}</span>
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">Time (Weekly)</span>
                      <span className="text-sm text-blue-400 font-medium">{project.timeCommitment}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">Compensation</span>
                      <span className="text-sm text-purple-400 font-medium">{project.compensation}</span>
                    </div>
                  </div>

                  <div className="border-t border-gray-800 pt-5 mt-auto flex flex-col gap-4">
                    <p className="text-sm text-gray-400">
                      Led by: <span className="font-semibold text-white">{project.manager}</span>
                    </p>
                    <div className="flex items-center justify-between">
                      <a href={mailtoLink} className="px-4 py-2 bg-green-600/10 hover:bg-green-600 border border-green-600/30 hover:border-green-500 text-green-400 hover:text-white rounded-lg text-sm font-semibold transition-all duration-200 text-center">
                        Apply via Email
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Form Code (Unchanged) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center sticky top-0 bg-gray-900 z-10">
              <h2 className="text-2xl font-bold text-white">Post a Project</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Project Title</label>
                <input required type="text" name="title" value={formData.title} onChange={handleInputChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500 transition-colors" placeholder="e.g. AI Course Chatbot" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">What research are you doing?</label>
                <textarea required name="description" value={formData.description} onChange={handleInputChange} rows="3" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500 transition-colors resize-none" placeholder="Explain the project, goals, and what you are trying to solve..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Role Requirements <span className="text-xs text-gray-500 ml-1 font-normal">(Required skills, classes, etc.)</span></label>
                <textarea required name="requirements" value={formData.requirements} onChange={handleInputChange} rows="2" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500 transition-colors resize-none" placeholder="e.g. Must know Python, CS 251 completed..." />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-950/50 p-4 rounded-lg border border-gray-800/50">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Tech Stack</label>
                  <input required type="text" name="techStack" value={formData.techStack} onChange={handleInputChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500 transition-colors" placeholder="e.g. Python, PyTorch" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Roles Needed</label>
                  <input required type="text" name="rolesNeeded" value={formData.rolesNeeded} onChange={handleInputChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500 transition-colors" placeholder="e.g. 2 Undergrad RAs" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Time Commitment</label>
                  <select required name="timeCommitment" value={formData.timeCommitment} onChange={handleInputChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500 transition-colors">
                    <option value="" disabled>Select Hours...</option>
                    <option value="1-5 hrs/wk">1-5 hrs/wk</option>
                    <option value="5-10 hrs/wk">5-10 hrs/wk</option>
                    <option value="10-15 hrs/wk">10-15 hrs/wk</option>
                    <option value="15+ hrs/wk">15+ hrs/wk</option>
                    <option value="Flexible">Flexible</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Compensation</label>
                  <select required name="compensation" value={formData.compensation} onChange={handleInputChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500 transition-colors">
                    <option value="" disabled>Select Type...</option>
                    <option value="Volunteer">Volunteer (Unpaid)</option>
                    <option value="Course Credit">Course Credit</option>
                    <option value="Paid">Paid (Hourly/Stipend)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">App Deadline</label>
                  <input required type="date" name="deadline" value={formData.deadline} onChange={handleInputChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500 transition-colors [color-scheme:dark]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Project Manager</label>
                  <input required type="text" name="manager" value={formData.manager} onChange={handleInputChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500 transition-colors" placeholder="Pete Purdue" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Contact Email</label>
                  <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500 transition-colors" placeholder="pete@purdue.edu" />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-gray-800 mt-6 sticky bottom-0 bg-gray-900 pb-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className={`px-6 py-2 rounded-lg font-medium transition-colors shadow-lg ${isSubmitting ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500 text-white'}`}>
                  {isSubmitting ? 'Sending...' : 'Submit for Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResearchProjects;