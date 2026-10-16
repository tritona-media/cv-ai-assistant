import unittest
from unittest.mock import patch

from fastapi import HTTPException

from app.api import JobParseRequest, parse_job


class ParseJobTests(unittest.TestCase):
    @patch("app.api.analyze_job_markdown")
    @patch("app.api.fetch_job_markdown", return_value="# Job")
    @patch("app.api.validate_public_url")
    def test_returns_structured_job_data(
        self, validate_url, fetch_markdown, analyze_markdown
    ):
        expected = {
            "document_type": "job_posting",
            "job_title": "Software Engineer",
            "company": "Example",
            "job_summary": "Build software.",
            "job_role": "Develop services.",
            "responsibilities": ["Build services"],
            "job_details": {
                "location": "Remote",
                "employment_type": "Full-time",
                "work_model": "remote",
            },
            "salary": {
                "min": None,
                "max": None,
                "currency": None,
                "period": None,
            },
            "requirements": [],
            "open_questions": [],
        }
        analyze_markdown.return_value = expected

        result = parse_job(JobParseRequest(url="https://example.com/jobs/1"))

        self.assertEqual(result.model_dump(mode="json"), expected)
        validate_url.assert_called_once()
        fetch_markdown.assert_called_once_with("https://example.com/jobs/1")
        analyze_markdown.assert_called_once_with("# Job")

    @patch(
        "app.api.validate_public_url",
        side_effect=ValueError("Only URLs hosted on public IP addresses are allowed."),
    )
    def test_rejects_non_public_targets(self, _validate_url):
        with self.assertRaises(HTTPException) as raised:
            parse_job(JobParseRequest(url="https://example.com/jobs/1"))

        self.assertEqual(raised.exception.status_code, 422)
        self.assertIn("public IP", raised.exception.detail)


if __name__ == "__main__":
    unittest.main()
