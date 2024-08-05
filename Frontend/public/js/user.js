class AuthService {
    constructor(apiUrl) {
        this.apiUrl = apiUrl;
    }

    async login(emailOrUsername, password) {
        return this._sendRequest('login', { emailOrUsername, password });
    }

    async register(email, username, firstName, lastName, password) {
        return this._sendRequest('register', { email, username, firstName, lastName, password });
    }

    async registerAndLogin(email, username, firstName, lastName, password) {
        await this.register(email, username, firstName, lastName, password);
        return this.login(email, password);
    }

    async _sendRequest(endpoint, data) {
        try {
            const response = await fetch(`${this.apiUrl}/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            if (response.ok) {
                return result;
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            throw error;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const authService = new AuthService('http://localhost:3001/api');

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const emailOrUsername = document.getElementById('email-or-username').value;
            const password = document.getElementById('password').value;
            try {
                const result = await authService.login(emailOrUsername, password);
                localStorage.setItem('token', result.token);
                localStorage.setItem('isAdmin', result.isAdmin);
                localStorage.setItem('username', result.username);
                alert('User logged in successfully!');
                if (result.isAdmin) {
                    window.location.href = '/films';
                } else {
                    window.location.href = '/browse';
                }
            } catch (error) {
                alert('Error: ' + error.message);
            }
        });
    }

    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const email = document.getElementById('email').value;
            const username = document.getElementById('username').value;
            const firstName = document.getElementById('first-name').value;
            const lastName = document.getElementById('last-name').value;
            const password = document.getElementById('password').value;
            const errorMessage = document.getElementById('error-message');
            errorMessage.textContent = '';

            if (password.length < 8) {
                errorMessage.textContent = 'Error: Password must be at least 8 characters long.';
                return;
            }

            try {
                const result = await authService.registerAndLogin(email, username, firstName, lastName, password);
                localStorage.setItem('token', result.token);
                localStorage.setItem('isAdmin', result.isAdmin);
                localStorage.setItem('username', result.username);
                alert('User registered and logged in successfully!');
                window.location.href = '/browse';
            } catch (error) {
                alert('Error: ' + error.message);
            }
        });
    }
});
