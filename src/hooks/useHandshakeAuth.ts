import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { AppUser } from '../context/AppContext';
import { useAppContext } from '../context/AppContext';

// ─── Backend contract ────────────────────────────────────────────────────────
// POST /auth/verify-handshake
// Body:    { "token": "<TEMP_JWT>" }
// Success: { "valid": true,  "user": { id, name, email, role } }
// Failure: { "valid": false, "message": "Token expirado o inválido" }
// ─────────────────────────────────────────────────────────────────────────────

interface HandshakeResponse {
  valid: boolean;
  user?: AppUser;
  message?: string;
}

/**
 * TODO: Set VITE_API_BASE_URL in your .env to point to the real backend.
 * While undefined, the mock intercept below is used automatically.
 *
 * Example .env:
 *   VITE_API_BASE_URL=https://api.linkgps.com
 */
const API_BASE = import.meta.env.VITE_API_BASE_URL as string | undefined;

// ─── Mock intercept (active when VITE_API_BASE_URL is not set) ───────────────
const MOCK_DELAY_MS = 1800; // simulate realistic network latency

const mockFetch = (token: string): Promise<HandshakeResponse> =>
  new Promise((resolve) =>
    setTimeout(() => {
      // Simulate: any token longer than 4 chars = valid session
      if (token && token.length > 4) {
        resolve({
          valid: true,
          user: {
            id: 'mock-001',
            name: 'Carlos Méndez',
            email: 'carlos@linkgps.com',
            role: 'admin',
          },
        });
      } else {
        resolve({
          valid: false,
          message: 'Token expirado o inválido (mock)',
        });
      }
    }, MOCK_DELAY_MS),
  );

// ─── Real fetch (used when VITE_API_BASE_URL is set) ────────────────────────
const realFetch = async (token: string): Promise<HandshakeResponse> => {
  const res = await fetch(`${API_BASE}/auth/verify-handshake`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });

  if (!res.ok) {
    return { valid: false, message: `HTTP ${res.status}` };
  }

  return res.json() as Promise<HandshakeResponse>;
};

// ─── Hook ────────────────────────────────────────────────────────────────────
export const useHandshakeAuth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser, setIsAuthenticated, setIsAuthLoading } = useAppContext();

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setIsAuthLoading(false);
      navigate('/unauthorized', { replace: true });
      return;
    }

    const verifyToken = API_BASE ? realFetch : mockFetch;

    verifyToken(token)
      .then(({ valid, user }) => {
        setIsAuthLoading(false);
        if (valid && user) {
          setIsAuthenticated(true);
          setUser(user);
          navigate('/home', { replace: true });
        } else {
          navigate('/unauthorized', { replace: true });
        }
      })
      .catch(() => {
        setIsAuthLoading(false);
        navigate('/unauthorized', { replace: true });
      });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
