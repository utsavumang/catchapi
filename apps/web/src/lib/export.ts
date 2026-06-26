import { Payload } from '@/types';

export const exportPayloadsToJson = (
  payloads: Payload[],
  endpointName: string
): void => {
  const safeName = endpointName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const filename = `${safeName}-payloads-${date}.json`;

  const content = JSON.stringify(payloads, null, 2);
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};
