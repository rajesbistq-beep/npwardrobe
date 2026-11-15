import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found">
      <p className="eyebrow">NP Wardrobe</p>
      <h1>Page not found</h1>
      <p>The page you’re looking for isn’t available.</p>
      <Link href="/">Return to home</Link>
    </main>
  );
}
