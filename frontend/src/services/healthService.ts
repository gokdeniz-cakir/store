import type { HealthResponse } from '../types/health'
import api from './api'

export async function getHealthStatus() {
  const response = await api.get<HealthResponse>('/health')
  return response.data
}
