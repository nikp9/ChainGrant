import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ValidationForm from './ValidationForm';
import ResearchApplicationForm from './ResearchApplicationForm';
import { useUser } from './UserContext';
import { UserTypes } from './walletUtils';

function ProjectPage() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const { userType } = useUser();

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const response = await fetch('/data/grants.json');
        if (!response.ok) {
          throw new Error('Failed to fetch project data');
        }
        const data = await response.json();
        const foundProject = data.find(p => p.id === id);
        if (!foundProject) {
          throw new Error('Project not found');
        }
        setProject(foundProject);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [id]);

  if (loading) {
    return <div className="text-center py-8 text-gray-400">Loading project data...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">Project Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div>
                <div className="mb-4">
                  <p className="text-gray-400 text-sm">Grant ID</p>
                  <p className="text-white">{project.id}</p>
                </div>
                <div className="mb-4">
                  <p className="text-gray-400 text-sm">Description</p>
                  <p className="text-white">{project.overview.description}</p>
                </div>
                <div className="mb-4">
                  <p className="text-gray-400 text-sm">Focus Areas</p>
                  <div className="flex flex-wrap gap-2">
                    {project.overview.focusAreas.map((area, index) => (
                      <span key={index} className="bg-blue-900 text-blue-100 px-3 py-1 rounded-full text-sm">
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-gray-400 text-sm">Duration</p>
                  <p className="text-white">{project.overview.duration}</p>
                </div>
              </div>

              {/* Right Column */}
              <div>
                <div className="mb-4">
                  <p className="text-gray-400 text-sm">Key Dates</p>
                  <ul className="text-white space-y-2">
                    <li>• Application Open: {project.overview.keyDates.applicationOpen}</li>
                    <li>• Application Close: {project.overview.keyDates.applicationClose}</li>
                    <li>• Award Announcement: {project.overview.keyDates.awardAnnouncement}</li>
                    <li>• Project Start: {project.overview.keyDates.projectStart}</li>
                  </ul>
                </div>
                <div className="mb-4">
                  <p className="text-gray-400 text-sm">Contact</p>
                  <p className="text-white">{project.overview.contact}</p>
                </div>
                <div className="mb-4">
                  <p className="text-gray-400 text-sm">Application Fee</p>
                  <p className="text-white">{project.fee}</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'requirements':
        return (
          <div className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">Requirements</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div>
                <div className="mb-4">
                  <p className="text-gray-400 text-sm">Eligible Applicants</p>
                  <ul className="text-white list-disc list-inside space-y-1">
                    {project.requirements.eligibility.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="mb-4">
                  <p className="text-gray-400 text-sm">Ineligible Applicants</p>
                  <ul className="text-white list-disc list-inside space-y-1">
                    {project.requirements.ineligible.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="mb-4">
                  <p className="text-gray-400 text-sm">Matching Funds</p>
                  <p className="text-white">{project.requirements.matchingFunds}</p>
                </div>
              </div>

              {/* Right Column */}
              <div>
                <div className="mb-4">
                  <p className="text-gray-400 text-sm">Required Documentation</p>
                  <ul className="text-white list-disc list-inside space-y-1">
                    {project.requirements.documentation.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="mb-4">
                  <p className="text-gray-400 text-sm">Special Requirements</p>
                  <ul className="text-white list-disc list-inside space-y-1">
                    {project.requirements.specialRequirements.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );
      case 'funded':
        return (
          <div className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">Funded Projects</h2>
            <p className="text-gray-400">Information about previously funded projects will be displayed here.</p>
          </div>
        );
      case 'form':
      return (
        <div className="p-6">
          {userType === UserTypes.VALIDATOR ? (
              <ValidationForm />
            ) : (
              <ResearchApplicationForm />
            )}
        </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="bg-[#1e293b] rounded-2xl border border-[#2d3748] p-6 mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          {/* Left Column - Project Info */}
          <div className="mb-4 md:mb-0">
            <h1 className="text-3xl font-bold text-white mb-2">{project.name}</h1>
            <div className="flex flex-wrap gap-4">
              <div>
                <p className="text-gray-400 text-sm">Agency</p>
                <p className="text-white font-medium">{project.agency}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Budget</p>
                <p className="text-white font-medium">{project.budget}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Success Rate</p>
                <p className="text-white font-medium">{project.successRate}</p>
              </div>
            </div>
          </div>

          {/* Right Column - Apply Button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('form')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Apply for Funding
          </motion.button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Quarterly Expenditure */}
        <div className="bg-[#1e293b] rounded-xl border border-[#2d3748] p-4">
          <p className="text-gray-400 text-sm">Quarterly Expenditure</p>
          <p className="text-2xl font-bold text-white">{project.qtrExpenditure}</p>
          <div className={`text-sm ${project.qtrChange.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
            {project.qtrChange} from last quarter
          </div>
        </div>

        {/* YTD Expenditure */}
        <div className="bg-[#1e293b] rounded-xl border border-[#2d3748] p-4">
          <p className="text-gray-400 text-sm">YTD Expenditure</p>
          <p className="text-2xl font-bold text-white">{project.ytdExpenditure}</p>
          <div className={`text-sm ${project.ytdChange.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
            {project.ytdChange} from last year
          </div>
        </div>

        {/* Proposals */}
        <div className="bg-[#1e293b] rounded-xl border border-[#2d3748] p-4">
          <p className="text-gray-400 text-sm">Proposals Received</p>
          <p className="text-2xl font-bold text-white">{project.proposals}</p>
          <p className="text-gray-400 text-sm">Total applications</p>
        </div>
      </div>

      {/* Project Details */}
      <div className="bg-[#1e293b] rounded-2xl border border-[#2d3748] overflow-hidden mb-6">
        {/* Tabs */}
        <div className="flex border-b border-[#2d3748]">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-4 text-center font-medium ${activeTab === 'overview' ? 'text-white border-b-2 border-blue-500' : 'text-gray-400'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('requirements')}
            className={`flex-1 py-4 text-center font-medium ${activeTab === 'requirements' ? 'text-white border-b-2 border-blue-500' : 'text-gray-400'}`}
          >
            Requirements
          </button>
          <button
            onClick={() => setActiveTab('funded')}
            className={`flex-1 py-4 text-center font-medium ${activeTab === 'funded' ? 'text-white border-b-2 border-blue-500' : 'text-gray-400'}`}
          >
            Funded Projects
          </button>
          <button
            onClick={() => setActiveTab('form')}
            className={`flex-1 py-4 text-center font-medium ${activeTab === 'form' ? 'text-white border-b-2 border-blue-500' : 'text-gray-400'}`}
          >
            Application Form
          </button>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </>
  );
}

export default ProjectPage;