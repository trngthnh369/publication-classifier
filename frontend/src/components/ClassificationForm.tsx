import { useState } from 'react';
import { Send, FileText, Settings, Sparkles } from 'lucide-react';
import { ClassificationRequest, classifyText, ClassificationResponse } from '@/lib/api';
import { LoadingSpinner } from './LoadingSpinner';
import { getVectorizationName, getModelName } from '@/lib/utils';
import toast from 'react-hot-toast';

interface ClassificationFormProps {
  onResult: (result: ClassificationResponse) => void;
}

const vectorizationMethods = [
  { value: 'embeddings', label: 'Sentence Embeddings', description: 'Modern neural embeddings (Recommended)' },
  { value: 'tfidf', label: 'TF-IDF', description: 'Term frequency-inverse document frequency' },
  { value: 'bow', label: 'Bag of Words', description: 'Simple word occurrence counting' },
];

const models = [
  { value: '', label: 'All Models', description: 'Run all available models' },
  { value: 'knn', label: 'K-Nearest Neighbors', description: 'Instance-based learning algorithm' },
  { value: 'decision_tree', label: 'Decision Tree', description: 'Tree-based classification' },
  { value: 'naive_bayes', label: 'Naive Bayes', description: 'Probabilistic classifier' },
  { value: 'kmeans', label: 'K-Means', description: 'Clustering-based classification' },
];

const sampleTexts = [
  {
    title: "Astrophysics Sample",
    text: "We present observations of a newly discovered exoplanet orbiting a nearby star. The planet shows characteristics similar to Earth with a similar mass and orbital period. Spectroscopic analysis reveals the presence of water vapor in its atmosphere, suggesting potential habitability. Our photometric measurements indicate regular transit events with a depth consistent with theoretical predictions."
  },
  {
    title: "Computer Science Sample", 
    text: "We propose a novel deep learning architecture for natural language processing tasks. Our model combines attention mechanisms with convolutional layers to achieve better performance on text classification benchmarks. Experimental results show significant improvements over existing baseline methods, with faster training times and higher accuracy scores."
  },
  {
    title: "Mathematics Sample",
    text: "In this paper, we establish new bounds for the convergence of iterative algorithms in Banach spaces. We prove that under certain conditions, the sequence of approximations converges to the unique fixed point with exponential rate. Our theoretical results extend previous work and provide better convergence guarantees for a wider class of problems."
  }
];

export function ClassificationForm({ onResult }: ClassificationFormProps) {
  const [text, setText] = useState('');
  const [vectorizationMethod, setVectorizationMethod] = useState<'bow' | 'tfidf' | 'embeddings'>('embeddings');
  const [selectedModel, setSelectedModel] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!text.trim()) {
      toast.error('Please enter an abstract to classify');
      return;
    }

    setIsLoading(true);
    
    try {
      const request: ClassificationRequest = {
        text: text.trim(),
        vectorization_method: vectorizationMethod,
        ...(selectedModel && { model_name: selectedModel as any }),
      };

      const result = await classifyText(request);
      onResult(result);
      toast.success('Classification completed successfully!');
    } catch (error: any) {
      console.error('Classification error:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Classification failed';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSampleText = (sampleText: string) => {
    setText(sampleText);
    toast.success('Sample text loaded');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center mb-6">
        <FileText className="h-6 w-6 text-blue-600 mr-3" />
        <h2 className="text-xl font-semibold text-gray-900">Classify Publication Abstract</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Text Input */}
        <div>
          <label htmlFor="abstract" className="block text-sm font-medium text-gray-700 mb-2">
            Abstract Text
          </label>
          <textarea
            id="abstract"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste the abstract of a scientific publication here..."
            className="w-full h-40 px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
            disabled={isLoading}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-500">
              {text.length} characters
            </span>
            {text.length < 100 && text.length > 0 && (
              <span className="text-xs text-orange-600">
                ⚠ Consider adding more content for better accuracy
              </span>
            )}
          </div>
        </div>

        {/* Sample Texts */}
        <div className="bg-gray-50 rounded-md p-4">
          <p className="text-sm font-medium text-gray-700 mb-3">Try sample texts:</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {sampleTexts.map((sample, index) => (
              <button
                key={index}
                type="button"
                onClick={() => loadSampleText(sample.text)}
                className="text-left p-3 bg-white rounded border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
                disabled={isLoading}
              >
                <p className="text-sm font-medium text-gray-900">{sample.title}</p>
                <p className="text-xs text-gray-600 mt-1">{sample.text.slice(0, 80)}...</p>
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Options */}
        <div>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200"
          >
            <Settings className="h-4 w-4 mr-1" />
            Advanced Options
            <span className="ml-2 transform transition-transform duration-200" style={{
              transform: showAdvanced ? 'rotate(180deg)' : 'rotate(0deg)'
            }}>
              ▼
            </span>
          </button>

          {showAdvanced && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md space-y-4 animate-slide-in">
              {/* Vectorization Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vectorization Method
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {vectorizationMethods.map((method) => (
                    <div
                      key={method.value}
                      className={`p-3 border rounded-md cursor-pointer transition-all duration-200 ${
                        vectorizationMethod === method.value
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setVectorizationMethod(method.value as any)}
                    >
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="vectorization"
                          value={method.value}
                          checked={vectorizationMethod === method.value}
                          onChange={(e) => setVectorizationMethod(e.target.value as any)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          disabled={isLoading}
                        />
                        <label className="ml-2 text-sm font-medium text-gray-900">
                          {method.label}
                        </label>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 ml-6">{method.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Model Selection */}
              <div>
                <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-2">
                  Model Selection
                </label>
                <select
                  id="model"
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                >
                  {models.map((model) => (
                    <option key={model.value} value={model.value}>
                      {model.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-600 mt-1">
                  {models.find(m => m.value === selectedModel)?.description}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !text.trim()}
          className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-md hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {isLoading ? (
            <LoadingSpinner size="sm" className="text-white" />
          ) : (
            <>
              <Sparkles className="h-5 w-5 mr-2" />
              Classify Abstract
              <Send className="h-4 w-4 ml-2" />
            </>
          )}
        </button>
      </form>

      {/* Info */}
      <div className="mt-6 p-4 bg-blue-50 rounded-md border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> For best results, paste the complete abstract including technical details. 
          The system can classify abstracts into: Astrophysics, Condensed Matter, Computer Science, Mathematics, and Physics.
        </p>
      </div>
    </div>
  );
}