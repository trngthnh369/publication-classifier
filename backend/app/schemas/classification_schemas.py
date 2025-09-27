from pydantic import BaseModel, Field
from typing import Dict, List, Optional

class ClassificationRequest(BaseModel):
    text: str = Field(..., description="Abstract text to classify")
    vectorization_method: str = Field(
        default="embeddings", 
        description="Vectorization method: bow, tfidf, or embeddings"
    )
    model_name: Optional[str] = Field(
        default=None,
        description="Specific model to use: kmeans, knn, decision_tree, naive_bayes. If None, use all models"
    )

class ModelPrediction(BaseModel):
    prediction: str
    confidence: float
    error: Optional[str] = None

class ClassificationResponse(BaseModel):
    input_text: str
    vectorization_method: str
    predictions: Dict[str, ModelPrediction]
    processing_time: float

class TrainingStatus(BaseModel):
    models_trained: Dict[str, bool]
    vectorizers_fitted: Dict[str, bool]
    available_categories: List[str]

class HealthResponse(BaseModel):
    status: str
    message: str
    timestamp: str

class ErrorResponse(BaseModel):
    error: str
    message: str
    timestamp: str