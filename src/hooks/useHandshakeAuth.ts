import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { AppUser } from '../context/AppContext';
import { useAppContext } from '../context/AppContext';

// ─── Backend contract ────────────────────────────────────────────────────────
// GET https://11tkrk1f2zwo.share.zrok.io/api/analytics/me
// Header:  Authorization: Bearer <TEMP_JWT>
// Success: { "user": { id, name, email, utype, ... } }
// ─────────────────────────────────────────────────────────────────────────────

interface HandshakeResponse {
  user?: AppUser;
  message?: string;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://11tkrk1f2zwo.share.zrok.io';

// ─── Mock intercept (active when VITE_API_BASE_URL is not set) ───────────────
const MOCK_DELAY_MS = 1800; // simulate realistic network latency

const mockFetch = (token: string): Promise<HandshakeResponse> =>
  new Promise((resolve) =>
    setTimeout(() => {
      // Simulate: any token longer than 4 chars = valid session
      if (token && token.length > 4) {
        resolve({
          user: {
            id: 13,
            name: 'Niconecone123',
            email: 'nicolascalleleyton123@gmail.com',
            mobile: '77712345',
            email_verified_at: null,
            utype: 'URS',
            fcm_token: 'cy0z9BeRRNiqOpZMWE80FK...',
            created_at: '2026-02-19T23:06:23.000000Z',
            updated_at: '2026-03-01T07:56:19.000000Z',
          },
        });
      } else {
        resolve({
          message: 'Token expirado o inválido (mock)',
        });
      }
    }, MOCK_DELAY_MS),
  );

// ─── Real fetch ──────────────────────────────────────────────────────────────
const realFetch = async (token: string): Promise<HandshakeResponse> => {
  const res = await fetch(`${API_BASE}/api/analytics/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
  });

  if (!res.ok) {
    return { message: `HTTP ${res.status}` };
  }

  return res.json() as Promise<HandshakeResponse>;
};

// ─── Hook ────────────────────────────────────────────────────────────────────
export const useHandshakeAuth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser, setAuthToken, setIsAuthenticated, setIsAuthLoading, authToken } = useAppContext();

  useEffect(() => {
    // If the URL has a token, we handle it as a handshake login
    const urlToken = searchParams.get('token');
    
    // If we don't have a URL token, but we DO have a stored token from a previous session,
    // we should try to validate that stored token.
    const tokenToValidate = urlToken || authToken;

    if (!tokenToValidate) {
      setIsAuthLoading(false);
      navigate('/unauthorized', { replace: true });
      return;
    }

    // In a production environment with a live token, we force the realFetch.
    // However, if we're testing locally without the live backend, we can still fall back over to mock.
    // For now, since the user gave the exact URL, let's use the real fetch directly,
    // unless the token is obviously a mock token.
    const isMock = tokenToValidate === 'test123';
    const verifyToken = isMock ? mockFetch : realFetch;

    verifyToken(tokenToValidate)
      .then(({ user }) => {
        setIsAuthLoading(false);
        if (user) {
          // Success! Save everything
          localStorage.setItem('auth_token', tokenToValidate);
          setAuthToken(tokenToValidate);
          setIsAuthenticated(true);
          setUser(user);
          
          // Only redirect to /home if we came in via a URL token handshake
          // Otherwise, we were just re-validating an existing session, stay where we are
          if (urlToken) {
            navigate('/home', { replace: true });
          }
        } else {
          // Token is invalid/expired
          localStorage.removeItem('auth_token');
          setAuthToken(null);
          setIsAuthenticated(false);
          setUser(null);
          navigate('/unauthorized', { replace: true });
        }
      })
      .catch((e) => {
        console.error("Auth validation error:", e);
        // Error during validation (e.g. network off)
        localStorage.removeItem('auth_token');
        setAuthToken(null);
        setIsAuthenticated(false);
        setUser(null);
        
        setIsAuthLoading(false);
        navigate('/unauthorized', { replace: true });
      });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
