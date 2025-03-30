import { useState } from 'react';

function ValidationForm() {
  // Questions stored in JSON format
  const questions = [
    {
      id: 1,
      text: "Does the project align with our organization's strategic goals?",
    },
    {
      id: 2,
      text: "Is the budget estimate realistic and properly justified?",
    },
    {
      id: 3,
      text: "Does the project team have the necessary skills and experience?",
    },
    {
      id: 4,
      text: "Are the project timelines realistic and achievable?",
    },
    {
      id: 5,
      text: "Does the project have measurable success criteria?",
    },
  ];

  // Initialize answers as null (unanswered)
  const initialAnswers = questions.reduce((acc, question) => {
    acc[question.id] = null;
    return acc;
  }, {});

  const [answers, setAnswers] = useState(initialAnswers);
  const [submission, setSubmission] = useState(null);

  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convert answers to binary string (1 for yes, 0 for no)
    const binaryString = questions.map(question => 
      answers[question.id] === true ? '1' : '0'
    ).join('');
    
    setSubmission({
      binaryString,
      answers: { ...answers }
    });
    
    // Here you would typically send to an API
    console.log('Submitted answers:', {
      binaryString,
      answers
    });
  };

  const resetForm = () => {
    setAnswers(initialAnswers);
    setSubmission(null);
  };

  return (
    <>
      <h1 className="text-2xl font-bold mb-6 text-white">Project Approval Assessment</h1>
      {!submission ? (
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {questions.map(question => (
              <div key={question.id} className="border-b border-gray-700 pb-6">
                <p className="text-lg font-medium text-gray-300 mb-4">
                  {question.id}. {question.text}
                </p>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => handleAnswer(question.id, true)}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      answers[question.id] === true 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAnswer(question.id, false)}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      answers[question.id] === false 
                        ? 'bg-red-600 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>
            ))}
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
              disabled={Object.values(answers).some(answer => answer === null)}
              className={`px-4 py-2 rounded-md transition-colors ${
                Object.values(answers).some(answer => answer === null) 
                  ? 'bg-blue-800 text-blue-300 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              Submit Assessment
            </button>
          </div>
        </form>

      ) : (
        <div className="bg-gray-700 p-6 rounded-md border border-gray-600">
          <h2 className="text-xl font-semibold mb-4 text-white">Assessment Submitted</h2>
          <p className="mb-2 text-gray-400">Binary result:</p>
          <code className="block mb-6 p-3 bg-gray-800 text-green-400 rounded-md overflow-x-auto font-mono">
            {submission.binaryString}
          </code>
          
          <div className="space-y-3">
            {questions.map(question => (
              <div key={question.id} className="flex items-start">
                <span className="font-medium text-gray-300 w-8">{question.id}.</span>
                <div className="flex-1">
                  <span className={`inline-block px-2 py-1 rounded text-sm mr-3 ${
                    submission.answers[question.id] 
                      ? 'bg-green-900 text-green-300' 
                      : 'bg-red-900 text-red-300'
                  }`}>
                    {submission.answers[question.id] ? 'Yes' : 'No'}
                  </span>
                  <span className="text-gray-400">{question.text}</span>
                </div>
              </div>
            ))}
          </div>
          
          <button
            onClick={resetForm}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Start New Assessment
          </button>
        </div>
      )}
    </>
  );
}

export default ValidationForm;