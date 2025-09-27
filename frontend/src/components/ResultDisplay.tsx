import { Clock, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';
import { ClassificationResponse, ModelPrediction } from '@/lib/api';
import { 
  formatConfidence, 
  getCategoryColor, 
  getCategoryName, 
  getModelName, 
  getVectorizationName,
  truncateText 
} from '@/lib/utils';

interface ResultDisplayProps {
  result: ClassificationResponse;
}

export function ResultDisplay({ result }: ResultDisplayProps) {
  const predictions = Object.entries(result.predictions) as [string, ModelPrediction][];
  const hasErrors = predictions.some(([_, pred]) => pred.error);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Classification Results
            </h3>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Method:</span> {getVectorizationName(result.vectorization_method)}
            </p>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-1" />
            {(result.processing_time * 1000).toFixed(0)}ms
          </div>
        </div>

        {/* Input Text Display */}
        <div className="bg-gray-50 rounded-md p-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Input Abstract:</p>
          <p className="text-sm text-gray-600 leading-relaxed">
            {truncateText(result.input_text, 200)}
          </p>
        </div>
      </div>

      {/* Predictions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {predictions.map(([modelName, prediction]) => (
          <div key={modelName} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-start justify-between mb-4">
              <h4 className="font-semibold text-gray-900">{getModelName(modelName)}</h4>
              {prediction.error ? (
                <AlertCircle className="h-5 w-5 text-red-500" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
            </div>

            {prediction.error ? (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                <p className="font-medium">Error occurred:</p>
                <p className="mt-1">{prediction.error}</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium border ${getCategoryColor(prediction.prediction)}`}>
                  {getCategoryName(prediction.prediction)}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Confidence:</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${prediction.confidence * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {formatConfidence(prediction.confidence)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary */}
      {!hasErrors && predictions.length > 1 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border">
          <div className="flex items-center mb-3">
            <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
            <h4 className="font-semibold text-gray-900">Summary</h4>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {predictions.filter(([_, pred]) => !pred.error).length}
              </p>
              <p className="text-sm text-gray-600">Successful</p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {(() => {
                  const successfulPreds = predictions.filter(([_, pred]) => !pred.error);
                  if (successfulPreds.length === 0) return '0';
                  const avgConfidence = successfulPreds.reduce((sum, [_, pred]) => sum + pred.confidence, 0) / successfulPreds.length;
                  return (avgConfidence * 100).toFixed(0);
                })()}%
              </p>
              <p className="text-sm text-gray-600">Avg. Confidence</p>
            </div>

            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {new Set(predictions
                  .filter(([_, pred]) => !pred.error)
                  .map(([_, pred]) => pred.prediction)
                ).size}
              </p>
              <p className="text-sm text-gray-600">Unique Predictions</p>
            </div>

            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {predictions.filter(([_, pred]) => pred.error).length}
              </p>
              <p className="text-sm text-gray-600">Errors</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}