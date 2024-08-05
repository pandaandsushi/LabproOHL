document.getElementById('register-form').addEventListener('submit', async function (e) {
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

    const response = await fetch('http://localhost:3001/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, username, firstName, lastName, password })
    });

    const result = await response.json();
    if (response.ok) {
        alert('User registered successfully!');
        window.location.href = '/browse';
    } else {
        alert('Error: ' + result.error);
    }
});
