import { useState } from 'react';

function ResearchApplicationForm() {
  const [formData, setFormData] = useState({
    projectTitle: '',
    budget: 50000,
    documents: null
  });

  const [submission, setSubmission] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    setFormData(prev => ({
      ...prev,
      documents: files
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmission({ ...formData });
    console.log('Form submitted:', formData);
  };

  const resetForm = () => {
    setFormData({
      projectTitle: '',
      budget: 50000,
      documents: null
    });
    setSubmission(null);
  };

  return (
    <>
      <h1 className="text-2xl font-bold mb-6 text-white">Research Project Application</h1>
      {!submission ? (
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Project Title Field */}
            <div className="border-b border-gray-700 pb-6">
              <p className="text-lg font-medium text-gray-300 mb-4">
                1. Project Title
              </p>
              <input
                type="text"
                name="projectTitle"
                value={formData.projectTitle}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your research project title"
              />
            </div>

            {/* Budget Slider */}
            <div className="border-b border-gray-700 pb-6">
              <p className="text-lg font-medium text-gray-300 mb-4">
                2. Estimated Budget
              </p>
              <div className="space-y-4">
                <div className="flex justify-between text-gray-300">
                  <span>${formData.budget.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  name="budget"
                  min="10000"
                  max="100000"
                  step="5000"
                  value={formData.budget}
                  onChange={handleChange}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>$10K</span>
                  <span>$100K</span>
                </div>
              </div>
            </div>

            {/* Document Upload */}
            <div className="border-b border-gray-700 pb-6">
              <p className="text-lg font-medium text-gray-300 mb-4">
                3. Supporting Documents
              </p>
              <div className="flex items-center">
                <label className="cursor-pointer">
                  <span className={`px-4 py-2 rounded-md transition-colors ${
                    formData.documents 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}>
                    {formData.documents ? 'Change Documents' : 'Upload Documents'}
                  </span>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <span className="ml-3 text-gray-400">
                  {formData.documents 
                    ? `${formData.documents.length} file(s) selected` 
                    : "No files selected"}
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Accepted formats: PDF, DOC, PPT (max 10MB each)
              </p>
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-4">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 transition-colors"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={!formData.projectTitle}
              className={`px-4 py-2 rounded-md transition-colors ${
                !formData.projectTitle
                  ? 'bg-blue-800 text-blue-300 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              Submit Application
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-gray-700 p-6 rounded-md border border-gray-600">
          <h2 className="text-xl font-semibold mb-4 text-white">Application Submitted</h2>
          
          <div className="space-y-3">
            <div className="flex items-start">
              <span className="font-medium text-gray-300 w-8">1.</span>
              <div className="flex-1">
                <span className="inline-block px-2 py-1 rounded text-sm mr-3 bg-gray-800 text-gray-300">
                  {submission.projectTitle}
                </span>
                <span className="text-gray-400">Project Title</span>
              </div>
            </div>

            <div className="flex items-start">
              <span className="font-medium text-gray-300 w-8">2.</span>
              <div className="flex-1">
                <span className="inline-block px-2 py-1 rounded text-sm mr-3 bg-gray-800 text-gray-300">
                  ${submission.budget.toLocaleString()}
                </span>
                <span className="text-gray-400">Estimated Budget</span>
              </div>
            </div>

            <div className="flex items-start">
              <span className="font-medium text-gray-300 w-8">3.</span>
              <div className="flex-1">
                <span className="inline-block px-2 py-1 rounded text-sm mr-3 bg-gray-800 text-gray-300">
                  {submission.documents ? `${submission.documents.length} file(s)` : 'None'}
                </span>
                <span className="text-gray-400">Supporting Documents</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={resetForm}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Start New Application
          </button>
        </div>
      )}
    </>
  );
}

export default ResearchApplicationForm;