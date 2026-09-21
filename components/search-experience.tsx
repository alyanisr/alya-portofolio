"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Results = { projects: { title: string; slug: string; overview: string }[]; experiences: { company: string; role: string; slug: string; summary: string }[]; skills: { name: string; slug: string; description: string | null }[]; achievements: { title: string; slug: string; result: string | null }[] };
const empty: Results = { projects: [], experiences: [], skills: [], achievements: [] };
export function SearchExperience() {
  const [query, setQuery] = useState(""); const [results, setResults] = useState<Results>(empty); const [loading, setLoading] = useState(false);
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, { signal: controller.signal });
        const body = await response.json() as { data: Results };
        setResults(body.data);
      } finally { setLoading(false); }
    }, 220);
    return () => { controller.abort(); clearTimeout(timer); };
  }, [query]);
  function updateQuery(value: string) {
    setQuery(value);
    if (value.trim().length < 2) { setResults(empty); setLoading(false); }
  }
  const hasResults = Object.values(results).some((items) => items.length > 0);
  return <div className="search-experience"><label htmlFor="archive-search">Search projects, skills, experience, awards…</label><input id="archive-search" value={query} onChange={(event) => updateQuery(event.target.value)} placeholder="Try: BPMN, Odoo, Kotlin" autoComplete="off" />{loading && <p className="search-status">Searching…</p>}{query.trim().length >= 2 && !loading && !hasResults && <p className="search-status">No public content found for “{query}”.</p>}{hasResults && <div className="search-results">{results.projects.map((item) => <Link href={`/work/${item.slug}`} key={`project-${item.slug}`}><span>Project</span><b>{item.title}</b><small>{item.overview}</small></Link>)}{results.experiences.map((item) => <Link href={`/experience/${item.slug}`} key={`experience-${item.slug}`}><span>Experience</span><b>{item.company} — {item.role}</b><small>{item.summary}</small></Link>)}{results.skills.map((item) => <Link href="/capabilities" key={`skill-${item.slug}`}><span>Capability</span><b>{item.name}</b><small>{item.description ?? "Explore related capability evidence."}</small></Link>)}{results.achievements.map((item) => <Link href="/archive" key={`achievement-${item.slug}`}><span>Achievement</span><b>{item.title}</b><small>{item.result ?? "View in archive."}</small></Link>)}</div>}</div>;
}
