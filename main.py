import json

from app.job_parser import fetch_job_markdown, analyze_job_markdown

from dotenv import load_dotenv

load_dotenv()


if __name__ == "__main__":
    job_url = (
        "https://www.bmwgroup.jobs/de/de/"
        "jobfinder/job-description.197410.content.html"
        #"https://www.freelancermap.de/projekt/ai-engineer-softwareentwickler-fuer-agentische-softwarewartung-und-self-hosted-llms-m-w-d"
    )
    markdown = fetch_job_markdown(job_url)

    job_data = analyze_job_markdown(markdown)
    print(json.dumps(job_data, ensure_ascii=False, indent=2))