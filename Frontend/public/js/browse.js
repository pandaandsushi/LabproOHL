document.addEventListener('DOMContentLoaded', () => {
    loadFilms();
    startPolling();
});

let currentPage = 1;
const filmsPerPage = 6;
let latestFilmTimestamp = 0;

async function loadFilms(searchQuery = '', page = 1) {
    const allFilms = await fetchFilms();
    const filteredFilms = allFilms.filter(film => 
        film.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        film.director.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const totalPages = Math.ceil(filteredFilms.length / filmsPerPage);
    const filmsToShow = filteredFilms.slice((page - 1) * filmsPerPage, page * filmsPerPage);

    displayFilms(filmsToShow);
    displayPagination(totalPages, page);
}

async function fetchFilms() {
    try {
        const response = await fetch('http://localhost:3001/api/films');
        const films = await response.json();
        return films;
    } catch (error) {
        console.error('Failed to fetch films', error);
        return [];
    }
}

function displayFilms(films) {
    const filmsContainer = document.getElementById('films-container');
    filmsContainer.innerHTML = '';
    films.forEach(film => {
        const filmCard = document.createElement('div');
        filmCard.classList.add('film-card');
        filmCard.innerHTML = `
            <img src="${film.coverImage}" alt="${film.title}">
            <h3>${film.title}</h3>
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
                loadFilms();
            }
            longPoll(); 
        })
        .catch(error => {
            console.error('Error in polling hv to reset:', error);
            setTimeout(longPoll, 5000);
        });
}
