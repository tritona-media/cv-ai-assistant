from bs4 import BeautifulSoup
from markdownify import markdownify
from playwright.sync_api import sync_playwright


def fetch_job_markdown(url: str) -> str:
    """Fetch a job page in Chromium and return its main content as Markdown."""
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        page = browser.new_page()
        response = page.goto(url, wait_until="domcontentloaded", timeout=30_000)
        if response is None:
            raise RuntimeError(f"Navigation did not return a response for {url}")
        if not response.ok:
            raise RuntimeError(f"Request for {url} failed with HTTP {response.status}")
        html = response.body()
        browser.close()

    soup = BeautifulSoup(html, "html.parser")
    main_content = soup.find("main") or soup.find("article") or soup.body or soup

    for image in main_content.find_all("img"):
        alt_text = image.get("alt")
        if isinstance(alt_text, str) and alt_text.strip():
            image.replace_with(alt_text)
        else:
            image.decompose()

    for element in main_content.find_all(
        [
            "header",
            "footer",
            "link",
            "script",
            "noscript",
            "style",
            "meta",
            "svg",
            "canvas",
            "iframe",
            "form",
            "input",
            "button",
            "nav",
            "aside",
            "figcaption",
        ]
    ):
        element.decompose()

    for element in main_content.find_all():
        if not element.contents or not element.get_text(strip=True):
            element.decompose()

    return markdownify(str(main_content)).strip()