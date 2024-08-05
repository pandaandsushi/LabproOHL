document.getElementById('login-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const emailOrUsername = document.getElementById('email-or-username').value;
    const password = document.getElementById('password').value;

    const response = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ emailOrUsername, password })
    });

    const result = await response.json();
    if (response.ok) {
        localStorage.setItem('token', result.token);
        localStorage.setItem('isAdmin', result.isAdmin);
        localStorage.setItem('username', result.username);
        alert('User registered successfully!');
        if (result.isAdmin) {
            window.location.href = '/films';
        } else {
            window.location.href = '/browse';
        }
    } else {
        alert('Error: ' + result.error);
    }
});
