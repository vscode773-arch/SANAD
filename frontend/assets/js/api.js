const API_URL = '/api';

class Api {
    static get token() {
        return localStorage.getItem('token');
    }

    static async request(endpoint, method = 'GET', body = null) {
        const headers = {
            'Content-Type': 'application/json'
        };
        const token = this.token;
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            method,
            headers,
        };

        if (body) {
            config.body = JSON.stringify(body);
        }

        try {
            const res = await fetch(`${API_URL}${endpoint}`, config);

            if (res.status === 401) {
                // Unauthorized
                localStorage.removeItem('token');
                window.location.href = '/login.html';
                return;
            }

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Error occurred');
            }
            return data;
        } catch (error) {
            console.error(error);
            alert(error.message);
            throw error;
        }
    }

    static login(username, password) {
        return this.request('/auth/login', 'POST', { username, password });
    }

    static getMe() {
        return this.request('/auth/me');
    }

    static getVouchers(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/vouchers?${query}`);
    }

    static createVoucher(data) {
        return this.request('/vouchers', 'POST', data);
    }

    static updateVoucher(id, data) {
        return this.request(`/vouchers/${id}`, 'PUT', data);
    }

    static deleteVoucher(id) {
        return this.request(`/vouchers/${id}`, 'DELETE');
    }

    static getAuditLogs() {
        return this.request('/reports/audit-logs');
    }

    static getSummary(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/reports/summary?${query}`);
    }

    // Suppliers
    static getSuppliers() {
        return this.request('/suppliers');
    }
    static createSupplier(data) {
        return this.request('/suppliers', 'POST', data);
    }
    static updateSupplier(id, data) {
        return this.request(`/suppliers/${id}`, 'PUT', data);
    }
    static deleteSupplier(id) {
        return this.request(`/suppliers/${id}`, 'DELETE');
    }

    // Users
    static getUsers() {
        return this.request('/users');
    }
    static createUser(data) {
        return this.request('/users', 'POST', data);
    }
    static updateUser(id, data) {
        return this.request(`/users/${id}`, 'PUT', data);
    }
    static deleteUser(id) {
        return this.request(`/users/${id}`, 'DELETE');
    }
}
