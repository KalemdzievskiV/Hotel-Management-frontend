export function formatCurrency(amount: number | undefined): string {
  if (amount === undefined || amount === null) return '$0.00';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[^0-9.-]+/g, '');
  return parseFloat(cleaned) || 0;
}
