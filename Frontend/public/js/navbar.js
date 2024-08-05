document.addEventListener('DOMContentLoaded', function () {
    const loginContainer = document.querySelector('.login_container');

    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username'); 

    if (token && username) {
        loginContainer.innerHTML = `<span class="welcome_message">Welcome! ${username}!</span>`;
    }
});
