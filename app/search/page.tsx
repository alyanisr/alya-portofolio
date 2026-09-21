import { PublicShell } from "@/components/public-shell";
import { SearchExperience } from "@/components/search-experience";

export const metadata = { title: "Search" };
export default function SearchPage() { return <PublicShell><section className="page-intro wrap"><p className="eyebrow">Archive search</p><h1>Find the evidence.</h1><p>Search across published projects, experience, capabilities, and achievements without needing to know where the evidence lives.</p></section><section className="wrap section-space"><SearchExperience /></section></PublicShell>; }
