import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const apiUrl =
    process.env.API_URL ??
    (process.env.NODE_ENV === "development"
      ? "http://127.0.0.1:8000"
      : undefined);

  if (!apiUrl) {
    console.error("API_URL is not configured for the frontend server.");
    return NextResponse.json(
      { detail: "The job analysis service is not configured." },
      { status: 503 },
    );
  }

  try {
    console.info("Forwarding job parse request to FastAPI.");
    const response = await fetch(`${apiUrl}/api/jobs/parse`, {
      method: "POST",
      headers: {
        "Content-Type": request.headers.get("content-type") ?? "application/json",
      },
      body: await request.text(),
      cache: "no-store",
    });
    console.info(`FastAPI responded to job parse request with ${response.status}.`);
    const body = await response.text();

    return new NextResponse(body, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") ?? "application/json",
        "Cache-Control": "no-store",
        "X-Job-Parser-Status": String(response.status),
      },
    });
  } catch (error) {
    console.error("Could not reach the FastAPI job parser.", error);
    return NextResponse.json(
      { detail: "The job analysis service is unavailable. Please try again." },
      { status: 502 },
    );
  }
}
