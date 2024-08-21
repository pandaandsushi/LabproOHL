class Film {
    constructor(id, title, description, director, releaseYear, genre, price, duration, coverImage, video, createdAt, updatedAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.director = director;
        this.releaseYear = releaseYear;
        this.genre = genre;
        this.price = price;
        this.duration = duration;
        this.coverImage = coverImage;
        this.video = video;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}

class FilmFetchingStrategy {
    async fetchFilms() {
        throw new Error("fetchFilms method should be implemented");
    }

    filterFilms(films, searchQuery) {
        return films.filter(film =>
            film.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            film.director.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }
}

class BrowseFilmStrategy extends FilmFetchingStrategy {
    constructor() {
        super();
        this.apiUrl = 'http://localhost:3001/api/films';
    }

    async fetchFilms() {
        try {
            const response = await fetch(this.apiUrl);
            const filmsData = await response.json();
            return filmsData.map(filmData => new Film(
                filmData.id,
                filmData.title,
                filmData.description,
                filmData.director,
                filmData.releaseYear,
                filmData.genre,
                filmData.price,
                filmData.duration,
                filmData.coverImage,
                filmData.video,
                filmData.createdAt,
                filmData.updatedAt
            ));
        } catch (error) {
            console.error('Failed to fetch films', error);
            return [];
        }
    }
}

class PurchasedFilmStrategy extends FilmFetchingStrategy {
    constructor(userId) {
        super();
        this.apiUrl = 'http://localhost:3001/api/purchase';
        this.userId = userId;
    }

    async fetchFilms() {
        try {
            const response = await fetch(`${this.apiUrl}?userId=${this.userId}`);
            return await response.json();
        } catch (error) {
            console.error('Failed to fetch purchased films', error);
            return [];
        }
    }
}

class WishlistFilmStrategy extends FilmFetchingStrategy {
    constructor(userId) {
        super();
        this.apiUrl = 'http://localhost:3001/api/wishlist';
        this.userId = userId;
    }

    async fetchFilms() {
        try {
            const response = await fetch(`${this.apiUrl}?userId=${this.userId}`);
            return await response.json();
        } catch (error) {
            console.error('Failed to fetch purchased films', error);
            return [];
        }
    }
}


class FilmUI {
    constructor(containerId, paginationId) {
        this.container = document.getElementById(containerId);
        this.pagination = document.getElementById(paginationId);
    }

    displayFilms(films) {
        const filmsContainer = document.getElementById('films-container');
        filmsContainer.innerHTML = '';

        if (films.length === 0) {
            const noFilmsMessage = document.createElement('p');
            noFilmsMessage.textContent = 'No films to display';
            noFilmsMessage.classList.add('no-films-message'); 
            filmsContainer.appendChild(noFilmsMessage);
            return;
        }

        films.forEach(film => {
            const filmCard = document.createElement('div');
            filmCard.classList.add('film-card');
            filmCard.innerHTML = `
                <img src="../public/${film.coverImage}" alt="${film.title}">
                <h3 style="padding-top: 10px;">${film.title}</h3>
                <p style="margin:0; padding-top:5px;">Director: ${film.director}</p>
            `;
            filmCard.onclick = () => {
                window.location.href = `/filmdetails/${film.id}`;
            };
            filmsContainer.appendChild(filmCard);
        });
    }

    displayPagination(totalPages, currentPage, onPageClick) {
        this.pagination.innerHTML = '';
        if (totalPages <= 1) return; 
        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement('button');
            pageButton.innerText = i;
            if (i === currentPage) {
                pageButton.style.backgroundColor = '#777';
            }
            pageButton.onclick = () => onPageClick(i);
            this.pagination.appendChild(pageButton);
        }
    }
}


class Observer {
    update(data) {
    }
}

class ObserverController {
    constructor() {
        this.observers = [];
    }

    addObserver(observer) {
        this.observers.push(observer);
    }

    removeObserver(observer) {
        this.observers = this.observers.filter(obs => obs !== observer);
    }

    notifyObservers(data) {
        this.observers.forEach(observer => observer.update(data));
    }
}

class Polling extends ObserverController {
    constructor(apiUrl) {
        super();
        this.apiUrl = apiUrl;
        this.latestFilmTimestamp = 0;
    }

    startPolling() {
        this.longPoll();
    }

    async longPoll() {
        try {
            const response = await fetch (this.apiUrl);
            const data = await response.json();
            if (data.newFilms.length > 0) {
                this.latestFilmTimestamp = data.newFilms[data.newFilms.length - 1].timestamp;
                this.notifyObservers(data.newFilms);
            }
            this.longPoll();
        } catch (error) {
            console.error('Error in polling, resetting:', error);
            setTimeout(() => this.longPoll(), 5000);
        }
    }
}


class ReloadObserver extends Observer {
    constructor(filmUI, filmService, searchQuery, page) {
        super();
        this.filmUI = filmUI;
        this.filmService = filmService;
        this.searchQuery = searchQuery;
        this.page = page;
    }

    async update(newFilms) {
        console.log("MASUK UPDATE")
        const allFilms = await this.filmService.fetchFilms();
        const filteredFilms = this.filmService.filterFilms(allFilms, this.searchQuery);
        const totalPages = Math.ceil(filteredFilms.length / filmsPerPage);
        const filmsToShow = filteredFilms.slice((this.page - 1) * filmsPerPage, this.page * filmsPerPage);

        this.filmUI.displayFilms(filmsToShow);
        this.filmUI.displayPagination(totalPages, this.page, (page) => this.loadFilms(this.searchQuery, page));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const filmUI = new FilmUI('films-container', 'pagination');
    const userId = localStorage.getItem('id');
    let filmService;

    const isBrowsePage = window.location.pathname.includes('/browse');
    const isPurchasedPage = window.location.pathname.includes('/mylist');
    const isWishlistPage = window.location.pathname.includes('/wishlist');

    if (isBrowsePage) {
        filmService = new BrowseFilmStrategy();
    } else if (isPurchasedPage) {
        filmService = new PurchasedFilmStrategy(userId);
    } else if (isWishlistPage) {
        filmService = new WishlistFilmStrategy(userId);
    }

    let currentPage = 1;
    const filmsPerPage = 6;

    async function loadFilms(searchQuery = '', page = 1) {
        const allFilms = await filmService.fetchFilms();
        const filteredFilms = filmService.filterFilms(allFilms, searchQuery);
        const totalPages = Math.ceil(filteredFilms.length / filmsPerPage);
        const filmsToShow = filteredFilms.slice((page - 1) * filmsPerPage, page * filmsPerPage);
        filmUI.displayFilms(filmsToShow);
        filmUI.displayPagination(totalPages, page, (page) => loadFilms(searchQuery, page));
    }

    const filmReloadObserver = new ReloadObserver(filmUI, filmService,'', currentPage);
    const pollingService = new Polling('http://localhost:3001/api/films');
    pollingService.addObserver(filmReloadObserver);
    pollingService.startPolling();
    loadFilms();

    document.getElementById('search-box').addEventListener('input', () => {
        const searchQuery = document.getElementById('search-box').value;
        loadFilms(searchQuery, 1);
    });
});
