export function AccessDenied() {
  return (
    <section className="access-denied" aria-labelledby="access-title">
      <p className="eyebrow">Restricted area</p>
      <h1 id="access-title">Access not available</h1>
      <p>Your staff role does not include permission to view this section.</p>
    </section>
  );
}
