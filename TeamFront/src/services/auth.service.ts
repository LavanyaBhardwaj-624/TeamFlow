import { authClient, refreshClient, apiClient, getErrorMessage } from '@/lib/api';
import { ApiResponse, AuthSession, User } from '@/types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
  title?: string;
  description?: string
}

export interface ProfileUpdate {
  name?: string;
  title?: string;
  description?: string;
  image?: string;
}

export interface BackendAuthData {
  user?: {
    id: string;
    email: string;
    name?: string | null;
    createdAt?: string;
    image?: string;
    title?: string;
    description?: string;
    imageUrl?: string;
  };
  accesstoken?: string;
  accessToken?: string;
}
declare global{
export interface BackendAuthResponse {
  success: boolean;
  status: number;
  message: string;
  data?: BackendAuthData;
}
}

function mapBackendAuthData(data: BackendAuthData): AuthSession {
  const rawUser = data.user;
  const accessToken = data.accesstoken ?? data.accessToken;

  if (!rawUser || !accessToken) {
    throw new Error('The authentication response is missing a user or access token.');
  }

  const userName = rawUser.name?.trim() || rawUser.email.split('@')[0];
  const user: User = {
    id: rawUser.id,
    name: userName,
    email: rawUser.email,
    image:
      rawUser.image || rawUser.imageUrl ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userName)}`,
    title: rawUser.title || "Product Collaborator",
    description: rawUser.description || '',
    createdAt: rawUser.createdAt,
  };

  return {
    user,
    token: accessToken,
  };
}

class AuthService {
  /**
   * The backend also sets the HTTP-only refreshToken cookie here. Keeping
   * withCredentials enabled on authClient lets the browser retain it.
   */
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthSession>> {
    try {
      console.log("login api called")
      const res = await authClient.post<BackendAuthResponse>('/login', {
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password,
      });

      const session = mapBackendAuthData(res.data.data ?? {});
      return {
        data: session,
        message: res.data.message || 'Logged in successfully',
      };
    } catch (err) {
      throw new Error(getErrorMessage(err, 'Invalid credentials. Please verify your email and password.'));
    }
  }

  /**
   * Signup uses the same public client as login. The backend sets the
   * HTTP-only refreshToken cookie and returns the initial access token.
   */
  async signup(credentials: SignupCredentials): Promise<ApiResponse<AuthSession>> {
    try {
      const res = await authClient.post<BackendAuthResponse>('/signup', {
        name: credentials.name.trim(),
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password,
        title: credentials.title,
        description: credentials.description
      });

      const session = mapBackendAuthData(res.data.data ?? {});
      return {
        data: session,
        message: res.data.message || 'Account created successfully',
      };
    } catch (err) {
      throw new Error(getErrorMessage(err, 'Could not create account.'));
    }
  }

  /**
   * Authenticate the existing browser session using only the HTTP-only
   * refreshToken cookie. This request never reads or sends the access token.
   */
  async authenticate(): Promise<ApiResponse<AuthSession>> {
    const res = await refreshClient.post<BackendAuthResponse>('/refreshPoint');

    return {
      data: mapBackendAuthData(res.data.data ?? {}),
      message: res.data.message || 'Session authenticated successfully',
    };
  }

  /**
   * Restore the session only through the refresh endpoint. No access token is
   * read from localStorage or sent to this request; the browser sends the
   * HTTP-only refreshToken cookie because refreshClient uses credentials.
   */
  async getCurrentSession(): Promise<ApiResponse<AuthSession | null>> {
    try {
      return await this.authenticate();
    } catch {
      // No refresh token cookie, or session expired/invalid
      return { data: null };
    }
  }

  /**
   * Explicitly rotate the refresh token and return the new in-memory session.
   */
  async refreshToken(): Promise<AuthSession | null> {
    try {
      const res = await this.authenticate();
      return res.data;
    } catch {
      return null;
    }
  }

  /**
   * Logout: informs backend to revoke refresh token in Redis and clear cookie.
   */
  async logout(): Promise<ApiResponse<null>> {
    try {
      await authClient.post('/logout');
    } catch {
      // Ignore network errors or already cleared cookies on logout
    }
    return { data: null, message: 'Logged out successfully' };
  }

  async updateProfile(update: ProfileUpdate): Promise<ApiResponse<User>> {
    try {
      const response = await apiClient.patch<{ data: { user: User } }>('/api/auth/profile', update);
      return { data: response.data.data.user };
    } catch (err) {
      throw new Error(getErrorMessage(err, 'Failed to update profile.'));
    }
  }

  async getAllUsers(query = ''): Promise<ApiResponse<User[]>> {
    const params = query.trim() ? `?q=${encodeURIComponent(query.trim())}&limit=20` : '?limit=100';
    try {
      // User search is an authenticated application request. Use apiClient so
      // the current access token is attached by its request interceptor.
      const response = await apiClient.get<{ data: User[] }>(`/api/auth/getAllUsers${params}`);
      return { data: response.data.data };
    } catch (err) {
      throw new Error(getErrorMessage(err, 'Failed to load users.'));
    }
  }

}

export const authService = new AuthService();
