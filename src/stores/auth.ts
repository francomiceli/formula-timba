// src/stores/auth.ts
import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';
import type { AxiosError } from "axios";

interface User {
    id: number;
    username: string;
    email: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    loading: boolean;
    error: string | null;
}

export const useAuthStore = defineStore('auth', {
    state: (): AuthState => ({
        user: null,
        token: localStorage.getItem('token'),
        loading: false,
        error: null,
    }),

    getters: {
        isAuthenticated: (state) => !!state.token,
        currentUser: (state) => state.user,
    },

    actions: {
        async login(email: string, password: string) {
            this.loading = true;
            this.error = null;

            try {
                const response = await api.post('/api/auth/login', { email, password });

                this.token = response.data.token;
                this.user = response.data.user;

                // Guardar token en localStorage
                if (this.token) {
                    // Guardar token en localStorage

                    localStorage.setItem('token', this.token);
                    // Configurar header de autorización

                    api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
                }



                return true;
            } catch (error) {
                const err = error as AxiosError<{ message: string }>;
                this.error = err.response?.data?.message || 'Error al iniciar sesión';
                return false;
            } finally {
                this.loading = false;
            }
        },

        async register(username: string, email: string, password: string) {
            this.loading = true;
            this.error = null;

            try {
                const response = await api.post('/api/auth/register', {
                    username,
                    email,
                    password
                });

                this.token = response.data.token;
                this.user = response.data.user;

                if (this.token) {
                    localStorage.setItem('token', this.token);
                    api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
                }

                console.log('✅ Usuario registrado y token configurado');

                return true;
            } catch (error) {
                const err = error as AxiosError<{ message: string }>;
                this.error = err.response?.data?.message || 'Error al registrarse';
                return false;
            } finally {
                this.loading = false;
            }
        },

        async fetchUser() {
            if (!this.token) return;

            try {
                const response = await api.get('/api/auth/me');
                this.user = response.data;
            } catch (error) {
                if (error) {
                    this.logout();
                }
            }
        },

        logout() {
            this.user = null;
            this.token = null;
            localStorage.removeItem('token');
            delete api.defaults.headers.common['Authorization'];
        },

        async initAuth() {
            const token = localStorage.getItem('token');
            if (token) {
                this.token = token;
                // Configurar el header inmediatamente
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                console.log('🔐 Token restaurado de localStorage');
                await this.fetchUser();
            }
        },
    },
});