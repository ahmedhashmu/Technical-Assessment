"""LLM client for bounded agent analysis."""
import json
import time
from typing import Dict, Any
from app.core.config import settings
from app.models.schemas import AnalysisSignals
from pydantic import ValidationError


class LLMClient:
    """Client for LLM API calls with bounded agent design."""
    
    def __init__(self):
        self.provider = settings.LLM_PROVIDER
        self.model = settings.LLM_MODEL
        
        if self.provider == "openai":
            from openai import OpenAI
            self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        elif self.provider == "xai":
            from openai import OpenAI
            # xAI uses OpenAI-compatible API
            self.client = OpenAI(
                api_key=settings.XAI_API_KEY,
                base_url="https://api.x.ai/v1"
            )
        else:
            raise ValueError(f"Unsupported LLM provider: {self.provider}")
    
    def extract_signals(self, transcript: str, max_retries: int = 3) -> AnalysisSignals:
        """
        Extract structured signals from transcript using bounded agent.
        
        Args:
            transcript: Meeting transcript text
            max_retries: Maximum number of retry attempts
            
        Returns:
            Validated structured signals
            
        Raises:
            Exception: If all retries fail
        """
        prompt = self._build_prompt(transcript)
        
        for attempt in range(max_retries):
            try:
                # Call LLM API
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": "You are a meeting analysis assistant. You extract structured information from meeting transcripts."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0,
                    max_tokens=1000
                )
                
                # Extract response content
                content = response.choices[0].message.content
                
                # Parse JSON
                data = json.loads(content)
                
                # Validate against schema
                signals = AnalysisSignals(**data)
                
                return signals
                
            except (json.JSONDecodeError, ValidationError) as e:
                if attempt < max_retries - 1:
                    # Exponential backoff
                    time.sleep(2 ** attempt)
                    continue
                else:
                    raise Exception(f"Failed to extract valid signals after {max_retries} attempts: {str(e)}")
            
            except Exception as e:
                if attempt < max_retries - 1:
                    time.sleep(2 ** attempt)
                    continue
                else:
                    raise Exception(f"LLM API error: {str(e)}")
    
    def _build_prompt(self, transcript: str) -> str:
        """Build structured prompt with JSON schema."""
        return f"""Analyze the following meeting transcript and extract structured information.

You must respond with valid JSON matching this exact schema:
{{
  "sentiment": "positive" | "neutral" | "negative",
  "topics": ["topic1", "topic2", ...],
  "objections": ["objection1", ...],
  "commitments": ["commitment1", ...],
  "outcome": "closed" | "follow_up" | "no_interest" | "unknown",
  "summary": "brief summary"
}}

Rules:
- sentiment: Overall tone of the meeting
- topics: Main subjects discussed (3-5 items)
- objections: Concerns or hesitations raised (0-5 items)
- commitments: Promises or next steps agreed upon (0-5 items)
- outcome: Meeting result classification
- summary: 2-3 sentence summary

Transcript:
{transcript}

Respond only with valid JSON, no additional text."""
