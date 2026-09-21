import { LoginForm } from "@/components/login-form";
export const metadata = { title: "Admin login", robots: { index: false } };
export default function LoginPage() { return <main className="login-page"><div><p className="eyebrow">Alya CMS</p><h1>Welcome back.</h1><p>Manage the story, not the database.</p><LoginForm /></div></main>; }
