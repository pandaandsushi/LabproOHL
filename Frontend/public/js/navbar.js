document.addEventListener("DOMContentLoaded", function() {
    const path = window.location.pathname;
    const navList = document.getElementById("nav-list");
    if (path === "/") {
        navList.style.display = "none";
    } else {
        navList.style.display = "flex";
    }
});
