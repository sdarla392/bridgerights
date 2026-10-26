export const tier = (s: number) => (s >= 70 ? 'bg-success' : s >= 45 ? 'bg-warning' : 'bg-danger');
export const tierText = (s: number) => (s >= 70 ? 'Strong fit' : s >= 45 ? 'Partial fit' : 'Weak fit');
