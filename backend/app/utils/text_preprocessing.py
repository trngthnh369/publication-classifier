import re
from typing import List

def preprocess_text(text: str) -> str:
    """
    Preprocess text by removing special characters, digits, and extra spaces.
    Convert to lowercase.
    """
    # Remove \n characters and leading/trailing spaces
    text = text.strip().replace("\n", " ")
    
    # Remove special characters
    text = re.sub(r'[^\w\s]', '', text)
    
    # Remove digits
    text = re.sub(r'\d+', '', text)
    
    # Remove extra spaces
    text = re.sub(r'\s+', ' ', text).strip()
    
    # Convert to lowercase
    text = text.lower()
    
    return text

def preprocess_batch(texts: List[str]) -> List[str]:
    """
    Preprocess a batch of texts.
    """
    return [preprocess_text(text) for text in texts]