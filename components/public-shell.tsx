import Link from "next/link";
import type { ReactNode } from "react";

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <>
      <a className="skip-link" href="#content">Skip to content</a>
      <header className="site-header">
        <Link className="wordmark" href="/" aria-label="Alya Nisrina, home">ALYA<span>⌁</span></Link>
        <nav aria-label="Primary navigation">
          <Link href="/work">Projects</Link>
          <Link href="/experience">Experience</Link>
          <Link href="/capabilities">Skills</Link>
          <Link href="/achievements">Achievements</Link>
          <Link href="/about">About</Link>
          <details className="nav-more">
            <summary>More <span aria-hidden="true">+</span></summary>
            <div>
              <Link href="/learning">Learning</Link>
              <Link href="/beyond">Organizations</Link>
              <Link href="/archive">Archive</Link>
              <Link href="/contact">Contact</Link>
              <Link href="/search">Search</Link>
            </div>
          </details>
        </nav>
        <Link className="nav-lens" href="/recruiter">Recruiter View ↗</Link>
      </header>
      <main id="content">{children}</main>
      <footer className="site-footer">
        <p>Built around a simple belief: solving the right problem matters.</p>
        <div><Link href="/contact">Let&apos;s talk</Link><Link href="/archive">More evidence</Link></div>
      </footer>
    </>
  );
}
