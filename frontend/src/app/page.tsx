'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, RefreshCw, Zap, Brain, BarChart3 } from 'lucide-react';
import { ClassificationResponse, healthCheck, initializeService, HealthResponse } from '@/lib/api';
import { ClassificationForm } from '@/components/ClassificationForm';
import { ResultDisplay } from '@/components/ResultDisplay';
import { FullPageLoader, LoadingSpinner } from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function HomePage() {
  const [serviceStatus, setServiceStatus] = useState<'loading' | 'ready' | 'initializing' | 'error'>('loading');
  const [result, setResult] = useState<ClassificationResponse | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  const checkServiceHealth = async () => {
    try {
      const health: HealthResponse = await healthCheck();
      
      if (health.status === 'ready') {
        setServiceStatus('ready');
      } else if (health.status === 'initializing') {
        setServiceStatus('initializing');
        // Poll again in 2 seconds
        setTimeout(checkServiceHealth, 2000);
      } else {
        setServiceStatus('error');
      }
    } catch (error) {
      console.error('Health check failed:', error);
      setServiceStatus('error');
    }
  };

  const handleInitialize = async () => {
    if (isInitializing) return;
    
    setIsInitializing(true);
    try {
      await initializeService();
      setServiceStatus('initializing');
      toast.success('Initialization started. Please wait...');
      
      // Start polling for status
      setTimeout(checkServiceHealth, 2000);
    } catch (error: any) {
      console.error('Initialization failed:', error);
      toast.error('Failed to initialize service');
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    checkServiceHealth();
  }, []);

  // Show loading screen while checking service status
  if (serviceStatus === 'loading') {
    return <FullPageLoader text="Checking service status..." />;
  }

  // Show initialization screen
  if (serviceStatus === 'initializing') {
    return <FullPageLoader text="Initializing AI models and vectorizers..." />;
  }

  // Service error or not ready
  if (serviceStatus === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md mx-auto text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Service Unavailable</h1>
          <p className="text-gray-600 mb-6">
            The classification service is not available. Please try initializing the service or check back later.
          </p>
          <button
            onClick={handleInitialize}
            disabled={isInitializing}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200"
          >
            {isInitializing ? (
              <LoadingSpinner size="sm" className="mr-2" />
            ) : (
              <RefreshCw className="h-5 w-5 mr-2" />
            )}
            Initialize Service
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="flex items-center space-x-4">
                <Brain className="h-12 w-12 text-blue-200" />
                <Zap className="h-8 w-8 text-yellow-300" />
                <BarChart3 className="h-12 w-12 text-purple-200" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              AI-Powered Publication
              <span className="block bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                Classification
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-8">
              Classify academic abstracts using advanced machine learning techniques including 
              Bag of Words, TF-IDF, and Sentence Embeddings
            </p>
            
            {/* Status Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              <CheckCircle className="h-4 w-4 mr-2" />
              Service Ready
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Form */}
          <div className="space-y-6">
            <ClassificationForm onResult={setResult} />
            
            {/* Features */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Brain className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Multiple Algorithms</h4>
                    <p className="text-sm text-gray-600">K-NN, Decision Tree, Naive Bayes, K-Means</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Zap className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Fast Processing</h4>
                    <p className="text-sm text-gray-600">Real-time classification results</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Confidence Scores</h4>
                    <p className="text-sm text-gray-600">Reliability metrics for each prediction</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">5 Categories</h4>
                    <p className="text-sm text-gray-600">Astro, Cond-Mat, CS, Math, Physics</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            {result ? (
              <ResultDisplay result={result} />
            ) : (
              <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Ready for Classification
                </h3>
                <p className="text-gray-600 mb-6">
                  Enter an academic abstract to see AI-powered classification results with confidence scores and multiple algorithm comparisons.
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div className="text-center p-3 bg-gray-50 rounded-md">
                    <p className="font-medium text-gray-900">Vectorization</p>
                    <p>3 Methods</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-md">
                    <p className="font-medium text-gray-900">Algorithms</p>
                    <p>4 Models</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}