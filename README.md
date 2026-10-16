# Job Scorecard

Paste a public job-posting URL into the Next.js app to extract its role,
responsibilities, details, salary, requirements, and open questions. The
FastAPI endpoint uses the existing `app/job_parser.py` extraction pipeline and
returns its structured JSON for the page to render as a scorecard.

## Local development

1. Install Python dependencies with `pip install -r requirements.txt`.
2. Install Chromium for Playwright with `playwright install chromium`.
3. Set `OPENAI_API_KEY` and `OPENAI_MODEL` in `.env`.
4. Start the API with `uvicorn app.api:app --reload`.
5. In another terminal, install and start the frontend:

   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

   The Next.js API route forwards `/api/jobs/parse` to FastAPI at
   `http://127.0.0.1:8000`. Keep the API running in the other terminal.

The API endpoint is `POST /api/jobs/parse` with JSON body
`{"url":"https://example.com/job"}`. It returns the `JobPostingExtraction`
schema; invalid URLs receive a validation error, and retrieval or analysis
failures return an HTTP error rather than an empty scorecard.

## VPS deployment with Docker Compose and Caddy

The Compose stack runs the frontend, FastAPI backend, and Caddy reverse proxy
as separate services. Only Caddy publishes ports to the host. It routes HTTPS
requests to Next.js, whose server-side API route forwards job-analysis requests
to FastAPI over the private Compose network. Caddy obtains and renews HTTPS
certificates automatically.

1. Point the domain's DNS `A`/`AAAA` records to the VPS and allow inbound TCP
   ports 80 and 443 (UDP 443 is optional for HTTP/3).
2. Copy `.env.example` to `.env` and set `DOMAIN` to the DNS name and
   `OPENAI_API_KEY` to your API key. Set `OPENAI_MODEL` if you want a different
   model.
3. From the repository root, run:

   ```sh
   docker compose up --build -d
   ```

Caddy will serve the app at `https://$DOMAIN`. The backend does not publish a
host port and validates public HTTP(S) targets, including redirected browser
requests, before fetching job pages.
