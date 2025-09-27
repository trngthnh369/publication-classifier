import numpy as np
from collections import Counter
from typing import Dict, List, Tuple
from sklearn.cluster import KMeans
from sklearn.neighbors import KNeighborsClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.naive_bayes import GaussianNB

class ClassificationModelManager:
    def __init__(self, label_to_id: Dict[str, int], id_to_label: Dict[int, str]):
        self.label_to_id = label_to_id
        self.id_to_label = id_to_label
        self.models = {}
        self.is_trained = {}
        
        # Initialize models
        self.models['kmeans'] = KMeans(n_clusters=len(label_to_id), random_state=42)
        self.models['knn'] = KNeighborsClassifier(n_neighbors=5)
        self.models['decision_tree'] = DecisionTreeClassifier(random_state=42)
        self.models['naive_bayes'] = GaussianNB()
        
        self.cluster_to_label = {}  # For KMeans

    def train_model(self, X_train: np.ndarray, y_train: List[int], model_name: str):
        """Train a specific model"""
        if model_name not in self.models:
            raise ValueError(f"Unknown model: {model_name}")
        
        model = self.models[model_name]
        
        if model_name == 'kmeans':
            # KMeans requires special handling for labels
            cluster_ids = model.fit_predict(X_train)
            
            # Assign most common label to each cluster
            self.cluster_to_label = {}
            for cluster_id in set(cluster_ids):
                labels_in_cluster = [y_train[i] for i in range(len(y_train)) if cluster_ids[i] == cluster_id]
                most_common_label = Counter(labels_in_cluster).most_common(1)[0][0]
                self.cluster_to_label[cluster_id] = most_common_label
        else:
            model.fit(X_train, y_train)
        
        self.is_trained[model_name] = True

    def predict(self, X: np.ndarray, model_name: str) -> Tuple[List[int], List[float]]:
        """Make predictions with a specific model"""
        if model_name not in self.models:
            raise ValueError(f"Unknown model: {model_name}")
        
        if not self.is_trained.get(model_name, False):
            raise ValueError(f"Model {model_name} is not trained")
        
        model = self.models[model_name]
        
        if model_name == 'kmeans':
            cluster_ids = model.predict(X)
            predictions = [self.cluster_to_label[cluster_id] for cluster_id in cluster_ids]
            # For KMeans, we don't have confidence scores, so we use dummy values
            confidences = [0.5] * len(predictions)  # Placeholder
        else:
            predictions = model.predict(X).tolist()
            
            # Get confidence scores
            if hasattr(model, 'predict_proba'):
                probas = model.predict_proba(X)
                confidences = [max(proba) for proba in probas]
            else:
                confidences = [1.0] * len(predictions)  # Placeholder for models without proba
        
        return predictions, confidences

    def predict_single(self, X: np.ndarray, model_name: str) -> Tuple[str, float]:
        """Predict single sample and return label name and confidence"""
        predictions, confidences = self.predict(X, model_name)
        
        if len(predictions) == 0:
            raise ValueError("No predictions returned")
        
        pred_id = predictions[0]
        confidence = confidences[0]
        pred_label = self.id_to_label[pred_id]
        
        return pred_label, confidence

    def get_all_predictions(self, X: np.ndarray) -> Dict[str, Dict]:
        """Get predictions from all trained models"""
        results = {}
        
        for model_name in self.models.keys():
            if self.is_trained.get(model_name, False):
                try:
                    pred_label, confidence = self.predict_single(X, model_name)
                    results[model_name] = {
                        'prediction': pred_label,
                        'confidence': confidence
                    }
                except Exception as e:
                    results[model_name] = {
                        'prediction': 'Error',
                        'confidence': 0.0,
                        'error': str(e)
                    }
        
        return results

    def get_model_status(self) -> Dict[str, bool]:
        """Get training status of all models"""
        return self.is_trained.copy()