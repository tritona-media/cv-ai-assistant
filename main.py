from app.job_parser import fetch_job_markdown


if __name__ == "__main__":
    job_url = (
        "https://www.bmwgroup.jobs/de/de/"
        "jobfinder/job-description.197410.content.html"
    )
    print(fetch_job_markdown(job_url))
