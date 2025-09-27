"""
Publication Classification API
A FastAPI-based service for classifying academic publication abstracts.
"""

from .utils import preprocess_text, preprocess_batch
from .models import ClassificationModelManager, VectorizerManager
from .schemas import (
    ClassificationRequest,
    ClassificationResponse,
    ModelPrediction,
    TrainingStatus,
    HealthResponse,
    ErrorResponse
)
from .services import classification_service