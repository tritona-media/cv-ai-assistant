import logging

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field, HttpUrl

from app.job_parser import (
    JobPostingExtraction,
    analyze_job_markdown,
    fetch_job_markdown,
    validate_public_url,
)

load_dotenv()

logger = logging.getLogger(__name__)
app = FastAPI(title="Job Scorecard API", version="1.0.0")


class JobParseRequest(BaseModel):
    url: HttpUrl = Field(description="Public URL of a job posting.")


@app.get("/healthz")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/jobs/parse", response_model=JobPostingExtraction)
def parse_job(request: JobParseRequest) -> JobPostingExtraction:
    url = str(request.url)
    logger.info("Received request to parse job posting from host %s", request.url.host)
    try:
        validate_public_url(url)
    except ValueError as exc:
        logger.warning(
            "Rejected job posting URL from host %s: %s",
            request.url.host,
            exc,
        )
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    try:
        markdown = fetch_job_markdown(url)
        if not markdown:
            raise RuntimeError("The page did not contain readable job content.")
        return JobPostingExtraction.model_validate(analyze_job_markdown(markdown))
    except Exception as exc:
        logger.exception(
            "Failed to analyze job posting from host %s", request.url.host
        )
        raise HTTPException(
            status_code=502,
            detail="Could not retrieve or analyze this job posting. Check that the URL is publicly accessible and try again.",
        ) from exc
