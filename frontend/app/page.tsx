"use client";

import { useState } from "react";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  Check,
  CircleHelp,
  ClipboardList,
  LoaderCircle,
  MapPin,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { JobPosting, JobRequirement } from "@/lib/job-posting";

function getErrorMessage(result: unknown) {
  if (typeof result !== "object" || result === null || !("detail" in result)) {
    return "Could not analyze this job posting. Please try again.";
  }

  const { detail } = result;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    const messages = detail.flatMap((item) => {
      if (typeof item !== "object" || item === null || !("msg" in item)) {
        return [];
      }
      if (typeof item.msg !== "string") return [];

      const location =
        "loc" in item && Array.isArray(item.loc)
          ? item.loc.filter((part: unknown): part is string | number =>
              typeof part === "string" || typeof part === "number",
            )
          : [];
      const field = location.length > 0 ? `${location.join(".")}: ` : "";
      return [`${field}${item.msg}`];
    });
    if (messages.length > 0) return messages.join(" ");
  }

  return "Could not analyze this job posting. Please try again.";
}

function displayValue(value: string | number | null | undefined) {
  return value === null || value === undefined || value === "" ? "Not specified" : value;
}

function formatCategory(category: string) {
  return category.replaceAll("_", " ");
}

function formatRequirementValue(requirement: JobRequirement) {
  if (requirement.value === null) return null;
  if (requirement.value === true) return requirement.operator.replaceAll("_", " ");
  if (requirement.value === false) return `No ${requirement.operator.replaceAll("_", " ")}`;
  return `${requirement.operator} ${requirement.value}${requirement.unit ? ` ${requirement.unit}` : ""}`;
}

function formatSalary(job: JobPosting) {
  const { min, max, currency, period } = job.salary;
  if (min === null && max === null) return "Not specified";

  const amount = [min, max]
    .filter((value): value is number => value !== null)
    .map((value) =>
      new Intl.NumberFormat(undefined, {
        maximumFractionDigits: 0,
      }).format(value),
    )
    .join(" – ");
  return [currency, amount, period].filter(Boolean).join(" ");
}

function RequirementCard({ requirement }: { requirement: JobRequirement }) {
  const isMustHave = requirement.importance === "must_have";
  const value = formatRequirementValue(requirement);

  return (
    <article className="rounded-lg border bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-medium leading-snug">{requirement.name}</h3>
          <p className="mt-1 text-sm capitalize text-muted-foreground">
            {formatCategory(requirement.category)}
          </p>
        </div>
        <Badge
          variant={isMustHave ? "default" : "secondary"}
          className={
            isMustHave
              ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
              : "bg-amber-100 text-amber-800 hover:bg-amber-100"
          }
        >
          {isMustHave ? "Must have" : "Nice to have"}
        </Badge>
      </div>
      {value && (
        <p className="mt-3 flex items-center gap-2 text-sm text-foreground/80">
          <Check className="size-4 shrink-0 text-primary" aria-hidden="true" />
          <span className="capitalize">{value}</span>
        </p>
      )}
      {requirement.source_text && (
        <blockquote className="mt-3 border-l-2 pl-3 text-sm italic text-muted-foreground">
          “{requirement.source_text}”
        </blockquote>
      )}
    </article>
  );
}

function Scorecard({ job }: { job: JobPosting }) {
  const details = [
    { icon: MapPin, label: "Location", value: job.job_details.location },
    {
      icon: BriefcaseBusiness,
      label: "Employment",
      value: job.job_details.employment_type,
    },
    {
      icon: Building2,
      label: "Work model",
      value: job.job_details.work_model,
    },
  ];

  return (
    <div className="mt-8 space-y-6" aria-live="polite">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <CardDescription className="mb-2 flex items-center gap-2">
                <Sparkles className="size-4 text-primary" aria-hidden="true" />
                Job scorecard
              </CardDescription>
              <CardTitle className="text-2xl leading-tight sm:text-3xl">
                {displayValue(job.job_title)}
              </CardTitle>
              {job.company && (
                <p className="mt-2 flex items-center gap-2 text-muted-foreground">
                  <Building2 className="size-4" aria-hidden="true" />
                  {job.company}
                </p>
              )}
            </div>
            <Badge variant="outline" className="capitalize">
              {job.requirements.length} requirements
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {job.job_summary && (
            <p className="max-w-3xl leading-relaxed text-muted-foreground">
              {job.job_summary}
            </p>
          )}
          {job.job_role && (
            <div className="rounded-lg bg-muted/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                The role
              </p>
              <p className="mt-2 leading-relaxed">{job.job_role}</p>
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {details.map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-lg border p-4">
                <p className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Icon className="size-4" aria-hidden="true" />
                  {label}
                </p>
                <p className="mt-2 font-medium">{displayValue(value)}</p>
              </div>
            ))}
            <div className="rounded-lg border p-4">
              <p className="text-xs font-medium text-muted-foreground">Salary</p>
              <p className="mt-2 font-medium">{formatSalary(job)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {job.responsibilities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="size-5 text-primary" aria-hidden="true" />
              Responsibilities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-3 sm:grid-cols-2">
              {job.responsibilities.map((responsibility, index) => (
                <li key={`${index}-${responsibility}`} className="flex gap-3">
                  <Check
                    className="mt-0.5 size-4 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  <span className="text-sm leading-relaxed">{responsibility}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Requirements</CardTitle>
          <CardDescription>
            Must-haves and preferred qualifications identified in the posting.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {job.requirements.length > 0 ? (
            <div className="grid gap-3 lg:grid-cols-2">
              {job.requirements.map((requirement, index) => (
                <RequirementCard
                  key={`${requirement.name}-${index}`}
                  requirement={requirement}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No requirements were identified in this posting.
            </p>
          )}
        </CardContent>
      </Card>

      {job.open_questions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CircleHelp className="size-5 text-primary" aria-hidden="true" />
              Points to clarify
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-inside list-disc space-y-2 text-sm">
              {job.open_questions.map((question, index) => (
                <li key={`${index}-${question}`}>{question}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [job, setJob] = useState<JobPosting | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function submitJob(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setJob(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/jobs/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const responseBody = await response.text();
      let result: unknown;
      try {
        result = JSON.parse(responseBody);
      } catch {
        result = null;
      }

      if (!response.ok) {
        const detail = getErrorMessage(result);
        throw new Error(
          detail === "Could not analyze this job posting. Please try again."
            ? `The request failed with HTTP ${response.status}. Check that the frontend API route is deployed.`
            : detail,
        );
      }
      if (result === null) {
        throw new Error("The job analysis service returned an invalid response.");
      }

      setJob(result as JobPosting);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "A network error occurred. Check your connection and try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="mx-auto max-w-2xl text-center">
        <div className="mx-auto mb-5 flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
          <BriefcaseBusiness className="size-6" aria-hidden="true" />
        </div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          Job search, made clearer
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
          Understand the role
          <span className="block text-primary">before you apply.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
          Paste a job posting link to turn the role, responsibilities, and
          requirements into one clear scorecard.
        </p>
      </header>

      <Card className="mx-auto mt-9 max-w-3xl">
        <CardContent className="p-5 sm:p-6">
          <form onSubmit={submitJob}>
            <label htmlFor="job-url" className="mb-2 block text-sm font-medium">
              Job posting URL
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                id="job-url"
                type="url"
                required
                placeholder="https://company.com/careers/job-title"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                disabled={isLoading}
                aria-describedby={error ? "form-error" : undefined}
              />
              <Button type="submit" disabled={isLoading} className="shrink-0">
                {isLoading ? (
                  <>
                    <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                    Analyzing…
                  </>
                ) : (
                  <>
                    Build scorecard
                    <ArrowUpRight className="size-4" aria-hidden="true" />
                  </>
                )}
              </Button>
            </div>
            {error && (
              <p id="form-error" role="alert" className="mt-3 text-sm text-destructive">
                {error}
              </p>
            )}
            <p className="mt-3 text-xs text-muted-foreground">
              Analysis may take a moment while the posting is read.
            </p>
          </form>
        </CardContent>
      </Card>

      {isLoading && (
        <p className="mt-8 text-center text-sm text-muted-foreground" role="status">
          Reading the posting and organizing its details…
        </p>
      )}
      {job && <Scorecard job={job} />}
      <footer className="mt-12 text-center text-xs text-muted-foreground">
        Job details are extracted from the source posting. Missing information
        is not guessed.
      </footer>
    </main>
  );
}
