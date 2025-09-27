from typing import List, Literal
import numpy as np
from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer
from sentence_transformers import SentenceTransformer

class EmbeddingVectorizer:
    def __init__(
        self,
        model_name: str = 'intfloat/multilingual-e5-base',
        normalize: bool = True
    ):
        self.model = SentenceTransformer(model_name)
        self.normalize = normalize

    def _format_inputs(
        self,
        texts: List[str],
        mode: Literal['query', 'passage']
    ):
        if mode not in ['query', 'passage']:
            raise ValueError("mode must be either 'query' or 'passage'")
        return [f"{mode}: {text.strip()}" for text in texts]

    def fit_transform(
        self,
        texts: List[str],
        mode: Literal['query', 'passage'] = 'query'
    ):
        if mode == 'raw':
            inputs = texts
        else:
            inputs = self._format_inputs(texts, mode)

        embeddings = self.model.encode(inputs, normalize_embeddings=self.normalize)
        return embeddings

    def transform_numpy(
        self,
        texts: List[str],
        mode: Literal['query', 'passage'] = 'query'
    ) -> np.ndarray:
        return np.array(self.fit_transform(texts, mode=mode))

class VectorizerManager:
    def __init__(self):
        self.bow_vectorizer = CountVectorizer()
        self.tfidf_vectorizer = TfidfVectorizer()
        self.embedding_vectorizer = EmbeddingVectorizer()
        self.is_fitted = {
            'bow': False,
            'tfidf': False,
            'embeddings': False
        }

    def fit_vectorizers(self, texts: List[str]):
        """Fit all vectorizers on training data"""
        self.bow_vectorizer.fit(texts)
        self.tfidf_vectorizer.fit(texts)
        # Embedding vectorizer doesn't need fitting
        self.is_fitted = {
            'bow': True,
            'tfidf': True,
            'embeddings': True
        }

    def transform_text(self, text: str, method: str = 'embeddings'):
        """Transform single text using specified method"""
        if not self.is_fitted.get(method, False):
            raise ValueError(f"Vectorizer {method} is not fitted")
        
        if method == 'bow':
            return self.bow_vectorizer.transform([text]).toarray()
        elif method == 'tfidf':
            return self.tfidf_vectorizer.transform([text]).toarray()
        elif method == 'embeddings':
            return self.embedding_vectorizer.fit_transform([text])
        else:
            raise ValueError(f"Unknown vectorization method: {method}")

    def get_feature_dimensions(self, method: str) -> int:
        """Get the number of features for a given method"""
        if method == 'bow':
            return len(self.bow_vectorizer.get_feature_names_out())
        elif method == 'tfidf':
            return len(self.tfidf_vectorizer.get_feature_names_out())
        elif method == 'embeddings':
            return 768  # Default dimension for multilingual-e5-base
        else:
            raise ValueError(f"Unknown vectorization method: {method}")