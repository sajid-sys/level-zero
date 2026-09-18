import type { OptimizeEnergyRequest, OptimizeEnergyResponse } from '../types/energy';

const API_BASE = '';

export async function checkApiHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) return false;
    const data = await res.json();
    return data.status === 'ok';
  } catch {
    return false;
  }
}

export interface OptimizationResultWithTiming {
  data: OptimizeEnergyResponse;
  durationMs: number;
}

export async function postOptimizeEnergy(
  request: OptimizeEnergyRequest
): Promise<OptimizationResultWithTiming> {
  const startTime = performance.now();
  const res = await fetch(`${API_BASE}/optimize-energy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  const durationMs = Math.round(performance.now() - startTime);

  if (!res.ok) {
    let errorDetail = 'Optimization request failed';
    try {
      const errJson = await res.json();
      errorDetail = errJson.message || errJson.detail || JSON.stringify(errJson);
    } catch {
      errorDetail = `HTTP ${res.status} ${res.statusText}`;
    }
    throw new Error(errorDetail);
  }

  const data: OptimizeEnergyResponse = await res.json();
  return { data, durationMs };
}
