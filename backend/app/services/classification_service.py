import time
from datasets import load_dataset
from sklearn.model_selection import train_test_split

from app import VectorizerManager
from app import ClassificationModelManager
from app import preprocess_text
from app import ClassificationResponse, ModelPrediction, TrainingStatus

class ClassificationService:
    def __init__(self):
        # Define categories
        self.categories = ['astro-ph', 'cond-mat', 'cs', 'math', 'physics']
        self.label_to_id = {label: i for i, label in enumerate(self.categories)}
        self.id_to_label = {i: label for i, label in enumerate(self.categories)}
        
        # Initialize managers
        self.vectorizer_manager = VectorizerManager()
        self.model_manager = ClassificationModelManager(self.label_to_id, self.id_to_label)
        
        self.is_initialized = False

    async def initialize(self, sample_size: int = 2000):
        """Initialize the service by loading data and training models"""
        if self.is_initialized:
            return

        print("Loading dataset...")
        # Load dataset
        ds = load_dataset("UniverseTBD/arxiv-abstracts-large")
        
        print("Preparing samples...")
        # Prepare samples
        samples = []
        for s in ds['train']:
            if len(s['categories'].split(' ')) != 1:
                continue

            cur_category = s['categories'].strip().split('.')[0]
            if cur_category not in self.categories:
                continue

            samples.append(s)

            if len(samples) >= sample_size:
                break

        print(f"Preprocessing {len(samples)} samples...")
        # Preprocess samples
        preprocessed_samples = []
        for s in samples:
            abstract = preprocess_text(s['abstract'])
            category = s['categories'].split(' ')[0].split('.')[0]
            
            preprocessed_samples.append({
                "text": abstract,
                "label": category
            })

        # Prepare training data
        X_full = [sample['text'] for sample in preprocessed_samples]
        y_full = [self.label_to_id[sample['label']] for sample in preprocessed_samples]

        X_train, X_test, y_train, y_test = train_test_split(
            X_full, y_full, test_size=0.2, random_state=42, stratify=y_full
        )

        print("Fitting vectorizers...")
        # Fit vectorizers
        self.vectorizer_manager.fit_vectorizers(X_train)

        print("Training models...")
        # Train models for each vectorization method
        for method in ['bow', 'tfidf', 'embeddings']:
            print(f"Training models with {method}...")
            
            # Transform training data
            if method == 'bow':
                X_train_vec = self.vectorizer_manager.bow_vectorizer.transform(X_train).toarray()
            elif method == 'tfidf':
                X_train_vec = self.vectorizer_manager.tfidf_vectorizer.transform(X_train).toarray()
            else:  # embeddings
                X_train_vec = self.vectorizer_manager.embedding_vectorizer.fit_transform(X_train)

            # Train each model
            for model_name in ['kmeans', 'knn', 'decision_tree', 'naive_bayes']:
                model_key = f"{model_name}_{method}"
                
                # Create separate model instance for each combination
                if model_name == 'kmeans':
                    from sklearn.cluster import KMeans
                    model = KMeans(n_clusters=len(self.categories), random_state=42)
                elif model_name == 'knn':
                    from sklearn.neighbors import KNeighborsClassifier
                    model = KNeighborsClassifier(n_neighbors=5)
                elif model_name == 'decision_tree':
                    from sklearn.tree import DecisionTreeClassifier
                    model = DecisionTreeClassifier(random_state=42)
                else:  # naive_bayes
                    from sklearn.naive_bayes import GaussianNB
                    model = GaussianNB()

                self.model_manager.models[model_key] = model
                self.model_manager.train_model(X_train_vec, y_train, model_key)

        self.is_initialized = True
        print("Classification service initialized successfully!")

    def classify_text(self, text: str, vectorization_method: str = 'embeddings', model_name: str = None) -> ClassificationResponse:
        """Classify a single text"""
        start_time = time.time()
        
        if not self.is_initialized:
            raise ValueError("Service not initialized. Please call initialize() first.")

        # Preprocess text
        processed_text = preprocess_text(text)
        
        # Vectorize text
        try:
            X = self.vectorizer_manager.transform_text(processed_text, vectorization_method)
        except Exception as e:
            raise ValueError(f"Vectorization failed: {str(e)}")

        predictions = {}
        
        if model_name:
            # Use specific model
            model_key = f"{model_name}_{vectorization_method}"
            if model_key in self.model_manager.models and self.model_manager.is_trained.get(model_key, False):
                try:
                    pred_label, confidence = self.model_manager.predict_single(X, model_key)
                    predictions[model_name] = ModelPrediction(
                        prediction=pred_label,
                        confidence=confidence
                    )
                except Exception as e:
                    predictions[model_name] = ModelPrediction(
                        prediction="Error",
                        confidence=0.0,
                        error=str(e)
                    )
            else:
                predictions[model_name] = ModelPrediction(
                    prediction="Error",
                    confidence=0.0,
                    error="Model not available or not trained"
                )
        else:
            # Use all models for this vectorization method
            for base_model_name in ['kmeans', 'knn', 'decision_tree', 'naive_bayes']:
                model_key = f"{base_model_name}_{vectorization_method}"
                
                if model_key in self.model_manager.models and self.model_manager.is_trained.get(model_key, False):
                    try:
                        pred_label, confidence = self.model_manager.predict_single(X, model_key)
                        predictions[base_model_name] = ModelPrediction(
                            prediction=pred_label,
                            confidence=confidence
                        )
                    except Exception as e:
                        predictions[base_model_name] = ModelPrediction(
                            prediction="Error",
                            confidence=0.0,
                            error=str(e)
                        )

        processing_time = time.time() - start_time

        return ClassificationResponse(
            input_text=text,
            vectorization_method=vectorization_method,
            predictions=predictions,
            processing_time=processing_time
        )

    def get_status(self) -> TrainingStatus:
        """Get the current status of the service"""
        return TrainingStatus(
            models_trained=self.model_manager.get_model_status(),
            vectorizers_fitted=self.vectorizer_manager.is_fitted,
            available_categories=self.categories
        )

# Global instance
classification_service = ClassificationService()