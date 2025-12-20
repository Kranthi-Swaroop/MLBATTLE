const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: Array<{ msg: string }>;
}

class ApiService {
    private token: string | null = null;

    setToken(token: string) {
        this.token = token;
        if (typeof window !== 'undefined') {
            localStorage.setItem('mlbattle_token', token);
        }
    }

    getToken(): string | null {
        if (this.token) return this.token;
        if (typeof window !== 'undefined') {
            return localStorage.getItem('mlbattle_token');
        }
        return null;
    }

    clearToken() {
        this.token = null;
        if (typeof window !== 'undefined') {
            localStorage.removeItem('mlbattle_token');
        }
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        const token = this.getToken();
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        };

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...options,
                headers,
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API Error:', error);
            return { success: false, message: 'Network error' };
        }
    }

    // Auth endpoints
    async register(email: string, password: string, name: string, kaggleUsername: string) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, name, kaggleUsername }),
        });
    }

    async login(email: string, password: string) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    }

    async getProfile() {
        return this.request('/auth/me');
    }

    // Events endpoints
    async getEvents(active?: boolean) {
        const query = active !== undefined ? `?active=${active}` : '';
        return this.request(`/events${query}`);
    }

    async getEvent(id: string) {
        return this.request(`/events/${id}`);
    }

    async createEvent(data: {
        name: string;
        description?: string;
        startDate: string;
        endDate: string;
    }) {
        return this.request('/events', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // Competitions endpoints
    async getCompetition(id: string) {
        return this.request(`/competitions/${id}`);
    }

    async createCompetition(data: {
        kaggleSlug: string;
        title: string;
        description?: string;
        eventId: string;
    }) {
        return this.request('/competitions', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async registerForCompetition(competitionId: string, type: 'solo' | 'team', teamId?: string) {
        return this.request(`/competitions/${competitionId}/register`, {
            method: 'POST',
            body: JSON.stringify({ type, teamId }),
        });
    }

    async getCompetitionRegistrations(competitionId: string) {
        return this.request(`/competitions/${competitionId}/registrations`);
    }

    async syncLeaderboard(competitionId: string) {
        return this.request(`/competitions/${competitionId}/sync`, {
            method: 'POST',
        });
    }

    // Teams endpoints
    async createTeam(name: string) {
        return this.request('/teams', {
            method: 'POST',
            body: JSON.stringify({ name }),
        });
    }

    async getMyTeams() {
        return this.request('/teams');
    }

    async joinTeam(inviteCode: string) {
        return this.request('/teams/join', {
            method: 'POST',
            body: JSON.stringify({ inviteCode }),
        });
    }

    async leaveTeam(teamId: string) {
        return this.request(`/teams/${teamId}/leave`, {
            method: 'DELETE',
        });
    }
}

export const api = new ApiService();
export default api;
