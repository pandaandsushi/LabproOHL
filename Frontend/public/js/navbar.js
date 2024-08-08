document.addEventListener('DOMContentLoaded', function () {
    const loginContainer = document.querySelector('.login_container');

    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username'); 
    const balance = localStorage.getItem('balance'); 
    const films = localStorage.getItem('films'); 

    console.log(balance)
    if (token && username) {
        loginContainer.innerHTML = `
            <div class="welcome_container">
                <div class="welcome_text">
                    <span class="welcome_message">${username}</span>
                    <span class="username">${balance} $</span>
                </div>
                <img src="/img/PROFILE_ICON.png" alt="Profile Icon" class="profile_icon" id="profile-icon">
                <div class="profile_menu" id="profile-menu">
                    <button id="logout-button">Logout</button>
                    <button id="logout-button">Profile</button>
                </div>
            </div>`;
    }

    const profileIcon = document.getElementById('profile-icon');
    const profileMenu = document.getElementById('profile-menu');
    const logoutButton = document.getElementById('logout-button');

    if (profileIcon) {
        profileIcon.addEventListener('click', () => {
            profileMenu.classList.toggle('show');
        });
    }

    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('isAdmin');
            localStorage.removeItem('username');
            window.location.href = '/login';
        });
    }

    document.addEventListener('click', (event) => {
        if (!event.target.closest('.welcome_container')) {
            profileMenu.classList.remove('show');
        }
    });
});
