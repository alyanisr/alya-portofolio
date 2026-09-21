import Link from "next/link";
import { PublicShell } from "@/components/public-shell";
export default function NotFound() { return <PublicShell><section className="not-found wrap"><p className="eyebrow">404</p><h1>That trail ends here.</h1><Link className="button" href="/work">Explore the work</Link></section></PublicShell>; }
