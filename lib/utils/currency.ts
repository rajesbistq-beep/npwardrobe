/** NPR formatting for display only. Do financial calculations in integer paisa or in the database. */
const nprNumber = new Intl.NumberFormat("ne-NP", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatNpr(amount: number): string {
  if (!Number.isFinite(amount)) return "—";
  return `रु. ${nprNumber.format(amount)}`;
}
