import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Publication Classifier | AI-Powered Academic Abstract Classification',
  description: 'Classify academic publication abstracts using advanced machine learning techniques including Bag of Words, TF-IDF, and Sentence Embeddings.',
  keywords: 'machine learning, text classification, academic papers, NLP, publication classifier',
  authors: [{ name: 'Publication Classifier Team' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-gradient-to-br from-blue-50 via-white to-purple-50`}>
        <div className="min-h-full">
          {/* Header */}
          <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Publication Classifier
                    </h1>
                  </div>
                  <div className="hidden md:block ml-4">
                    <span className="text-sm text-gray-600">
                      AI-Powered Academic Abstract Classification
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <a
                    href="/docs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors duration-200"
                  >
                    API Docs
                  </a>
                  <div className="h-4 w-px bg-gray-300"></div>
                  <span className="text-xs text-gray-500">v1.0.0</span>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-white border-t mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                    Classification Methods
                  </h3>
                  <ul className="mt-4 space-y-2">
                    <li className="text-sm text-gray-600">Bag of Words</li>
                    <li className="text-sm text-gray-600">TF-IDF Vectorization</li>
                    <li className="text-sm text-gray-600">Sentence Embeddings</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                    ML Algorithms
                  </h3>
                  <ul className="mt-4 space-y-2">
                    <li className="text-sm text-gray-600">K-Nearest Neighbors</li>
                    <li className="text-sm text-gray-600">Decision Tree</li>
                    <li className="text-sm text-gray-600">Naive Bayes</li>
                    <li className="text-sm text-gray-600">K-Means Clustering</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                    Categories
                  </h3>
                  <ul className="mt-4 space-y-2">
                    <li className="text-sm text-gray-600">Astrophysics</li>
                    <li className="text-sm text-gray-600">Condensed Matter</li>
                    <li className="text-sm text-gray-600">Computer Science</li>
                    <li className="text-sm text-gray-600">Mathematics</li>
                    <li className="text-sm text-gray-600">Physics</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-8 pt-8 border-t border-gray-200">
                <p className="text-center text-sm text-gray-600">
                  © 2024 Publication Classifier. Built with FastAPI, Next.js, and advanced ML techniques.
                </p>
              </div>
            </div>
          </footer>
        </div>

        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}