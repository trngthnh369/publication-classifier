import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatConfidence(confidence: number): string {
  return `${(confidence * 100).toFixed(1)}%`;
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'astro-ph': 'bg-purple-100 text-purple-800 border-purple-200',
    'cond-mat': 'bg-blue-100 text-blue-800 border-blue-200',
    'cs': 'bg-green-100 text-green-800 border-green-200',
    'math': 'bg-orange-100 text-orange-800 border-orange-200',
    'physics': 'bg-red-100 text-red-800 border-red-200',
  };
  return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
}

export function getCategoryName(category: string): string {
  const names: Record<string, string> = {
    'astro-ph': 'Astrophysics',
    'cond-mat': 'Condensed Matter',
    'cs': 'Computer Science',
    'math': 'Mathematics',
    'physics': 'Physics',
  };
  return names[category] || category;
}

export function getModelName(model: string): string {
  const names: Record<string, string> = {
    'kmeans': 'K-Means',
    'knn': 'K-Nearest Neighbors',
    'decision_tree': 'Decision Tree',
    'naive_bayes': 'Naive Bayes',
  };
  return names[model] || model;
}

export function getVectorizationName(method: string): string {
  const names: Record<string, string> = {
    'bow': 'Bag of Words',
    'tfidf': 'TF-IDF',
    'embeddings': 'Sentence Embeddings',
  };
  return names[method] || method;
}

export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}