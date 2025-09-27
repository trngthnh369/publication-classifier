from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime
import logging

from app import classification_service
from app import (
    ClassificationRequest,
    ClassificationResponse,
    TrainingStatus,
    HealthResponse,
    ErrorResponse
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Publication Classification API",
    description="API for classifying academic publication abstracts into categories",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://frontend:3000"],  # Add your frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global initialization flag
is_initializing = False
initialization_complete = False

@app.on_event("startup")
async def startup_event():
    """Initialize the classification service on startup"""
    global is_initializing, initialization_complete
    
    if not initialization_complete and not is_initializing:
        is_initializing = True
        logger.info("Starting classification service initialization...")
        
        try:
            await classification_service.initialize(sample_size=1000)
            initialization_complete = True
            logger.info("Classification service initialized successfully!")
        except Exception as e:
            logger.error(f"Failed to initialize classification service: {str(e)}")
        finally:
            is_initializing = False

@app.get("/", response_model=HealthResponse)
async def root():
    """Health check endpoint"""
    return HealthResponse(
        status="ok",
        message="Publication Classification API is running",
        timestamp=datetime.now().isoformat()
    )

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Detailed health check"""
    global initialization_complete, is_initializing
    
    if initialization_complete:
        status = "ready"
        message = "Service is ready to accept requests"
    elif is_initializing:
        status = "initializing"
        message = "Service is still initializing, please wait..."
    else:
        status = "not_ready"
        message = "Service initialization failed or not started"
    
    return HealthResponse(
        status=status,
        message=message,
        timestamp=datetime.now().isoformat()
    )

@app.get("/status", response_model=TrainingStatus)
async def get_status():
    """Get the current training status"""
    try:
        return classification_service.get_status()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/classify", response_model=ClassificationResponse)
async def classify_text(request: ClassificationRequest):
    """Classify publication abstract"""
    global initialization_complete
    
    if not initialization_complete:
        raise HTTPException(
            status_code=503,
            detail="Service is still initializing, please wait and try again"
        )
    
    # Validate vectorization method
    valid_methods = ['bow', 'tfidf', 'embeddings']
    if request.vectorization_method not in valid_methods:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid vectorization method. Must be one of: {valid_methods}"
        )
    
    # Validate model name if provided
    valid_models = ['kmeans', 'knn', 'decision_tree', 'naive_bayes']
    if request.model_name and request.model_name not in valid_models:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid model name. Must be one of: {valid_models}"
        )
    
    try:
        result = classification_service.classify_text(
            text=request.text,
            vectorization_method=request.vectorization_method,
            model_name=request.model_name
        )
        return result
    except Exception as e:
        logger.error(f"Classification error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/initialize")
async def initialize_service(background_tasks: BackgroundTasks):
    """Manually trigger service initialization"""
    global is_initializing, initialization_complete
    
    if initialization_complete:
        return {"message": "Service already initialized"}
    
    if is_initializing:
        return {"message": "Service is already initializing"}
    
    async def init_task():
        global is_initializing, initialization_complete
        is_initializing = True
        try:
            await classification_service.initialize(sample_size=1000)
            initialization_complete = True
            logger.info("Manual initialization completed successfully!")
        except Exception as e:
            logger.error(f"Manual initialization failed: {str(e)}")
        finally:
            is_initializing = False
    
    background_tasks.add_task(init_task)
    return {"message": "Initialization started in background"}

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    logger.error(f"Global exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content=ErrorResponse(
            error="Internal Server Error",
            message=str(exc),
            timestamp=datetime.now().isoformat()
        ).dict()
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)