document.addEventListener('DOMContentLoaded', () => {
    loadFilms();
    startPolling();
});

let currentPage = 1;
const filmsPerPage = 6;
let latestFilmTimestamp = 0;

function loadFilms(searchQuery = '', page = 1) {
    const allFilms = getFilms(); 
    const filteredFilms = allFilms.filter(film => 
        film.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        film.director.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const totalPages = Math.ceil(filteredFilms.length / filmsPerPage);
    const filmsToShow = filteredFilms.slice((page - 1) * filmsPerPage, page * filmsPerPage);

    displayFilms(filmsToShow);
    displayPagination(totalPages, page);
}

function displayFilms(films) {
    const filmsContainer = document.getElementById('films-container');
    filmsContainer.innerHTML = '';
    films.forEach(film => {
        const filmCard = document.createElement('div');
        filmCard.classList.add('film-card');
        filmCard.innerHTML = `
            <img src="${film.image}" alt="${film.name}">
            <h3>${film.name}</h3>
            <p>Director: ${film.director}</p>
        `;
        filmsContainer.appendChild(filmCard);
    });
}

function displayPagination(totalPages, currentPage) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.innerText = i;
        if (i === currentPage) {
            pageButton.style.backgroundColor = '#777';
        }
        pageButton.onclick = () => loadFilms(document.getElementById('search-box').value, i);
        pagination.appendChild(pageButton);
    }
}

function searchFilms() {
    const searchQuery = document.getElementById('search-box').value;
    // console.log('mencari: '+searchQuery);
    loadFilms(searchQuery, 1);
}

function startPolling() {
    longPoll();
}

function longPoll() {
    fetch('/api/get-latest-films?since=' + latestFilmTimestamp)
        .then(response => response.json())
        .then(data => {
            if (data.newFilms.length > 0) {
                latestFilmTimestamp = data.newFilms[data.newFilms.length - 1].timestamp; // Update the latest timestamp
                console.log('Films diload ulg');
                loadFilms();
            }
            longPoll(); 
        })
        .catch(error => {
            console.error('Error in polling hv to reset:', error);
            setTimeout(longPoll, 5000);
        });
}

function getFilms() {
    return [
        { name: 'Dummy 1', director: 'Director 1', image: 'img/Dummy1.jpg' },
        { name: 'Dummy 2', director: 'Director 2', image: 'img/Dummy2.jpg' },
        { name: 'Dummy 3', director: 'Director 3', image: 'img/Dummy3.jpg' },
        { name: 'Dummy 4', director: 'Director 4', image: 'img/Dummy4.jpg' },
        { name: 'Dummy 5', director: 'Director 5', image: 'img/Dummy5.jpg' },
        { name: 'Dummy 6', director: 'Director 6', image: 'img/Dummy6.jpg' },
        { name: 'Dummy 7', director: 'Director 7', image: 'img/Dummy7.jpg' },
        { name: 'Dummy 8', director: 'Director 8', image: 'img/Dummy8.jpg' },
        { name: 'Dummy 9', director: 'Director 9', image: 'img/Dummy9.jpg' },
    ];
}
