export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

export const WS_URL = BACKEND_URL.replace(/^http/, 'ws');

export const API_BASE = `${BACKEND_URL}/api/v1`;
export const WS_BASE = `${WS_URL}/api/v1`;
