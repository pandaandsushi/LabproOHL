class AuthService {
    constructor(apiUrl) {
        this.apiUrl = apiUrl;
    }

    async login(emailOrUsername, password) {
        return this._sendRequest('login', { emailOrUsername, password });
    }

    async register(emailOrUsername, password) {
        return this._sendRequest('register', { emailOrUsername, password });
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

    document.getElementById('login-form').addEventListener('submit', async function (e) {
        e.preventDefault();

        console.log("NGELOGIN")
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

   
});
