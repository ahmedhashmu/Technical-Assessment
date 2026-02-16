"""Application configuration."""
from pydantic_settings import BaseSettings
from typing import Literal


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Database
    DATABASE_URL: str
    
    # LLM Configuration
    LLM_PROVIDER: Literal["openai", "xai"] = "openai"
    LLM_MODEL: str = "gpt-4"
    OPENAI_API_KEY: str | None = None
    XAI_API_KEY: str | None = None
    
    # Authentication
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Application
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
