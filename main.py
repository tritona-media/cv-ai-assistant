import json

from app.job_parser import fetch_job_markdown, analyze_job_markdown
from app.cv_parser import analyze_cv_markdown, pdf_to_markdown

from dotenv import load_dotenv

load_dotenv()

def test_job_parser():
    job_url = (
        "https://www.bmwgroup.jobs/de/de/"
        "jobfinder/job-description.197410.content.html"
        #"https://www.freelancermap.de/projekt/ai-engineer-softwareentwickler-fuer-agentische-softwarewartung-und-self-hosted-llms-m-w-d"
    )
    markdown = fetch_job_markdown(job_url)

    job_data = analyze_job_markdown(markdown)
    print(json.dumps(job_data, ensure_ascii=False, indent=2))

def test_pdf_to_markdown():
    pdf_path = "raw/Lebenslauf_Minh_Ngo.pdf"
    markdown = pdf_to_markdown(pdf_path)
    print(markdown)

def test_markdown_to_json():
    markdown = "raw/CV.md"
    cv_data = analyze_cv_markdown(markdown)
    print(json.dumps(cv_data, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    test_job_parser()
    #test_pdf_to_markdown()
    #test_markdown_to_json()
