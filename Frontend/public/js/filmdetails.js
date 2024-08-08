class FilmDetailsService {
    constructor(apiUrl) {
        this.apiUrl = apiUrl;
    }

    async fetchFilmDetails(id, userId) {
        try {
            const response = await fetch(`${this.apiUrl}${id}?userId=${userId}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const filmData = await response.json();
            console.log('Fetched film data:', filmData);
            return filmData; 
        } catch (error) {
            console.error('Failed to fetch film details', error);
            return null;
        }
    }
}

class FilmDetailsUI {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
    }

    displayFilmDetails(film) {
        if (!film) {
            this.container.innerHTML = '<p>Film not found.</p>';
            return;
        }

        document.getElementById('film-title').textContent = film.title;
        document.getElementById('film-description').textContent = film.description;
        document.getElementById('film-director').textContent = `Director: ${film.director}`;
        document.getElementById('film-release-year').textContent = `Release Year: ${film.releaseYear}`;
        document.getElementById('film-genre').textContent = `Genre: ${film.genre}`;
        document.getElementById('film-price').textContent = `Price: $${film.price}`;
        document.getElementById('film-duration').textContent = `Duration: ${film.duration} minutes`;

        this.setupButton(film);
    }

    setupButton(film) {
        const button = document.getElementById('purchase-button');
        console.log("ngecek ispurchased di js")
        console.log(film.isPurchased)
        if (film.isPurchased) {
            button.textContent = 'Watch';
            button.onclick = () => {
                alert('Watching the film!');
            };
        } else {
            button.textContent = 'Purchase';
            button.onclick = async () => {
                const balance = Number(localStorage.getItem('balance'));
                try {
                    const response = await fetch('http://localhost:3001/api/purchase', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            userId: localStorage.getItem('id'),
                            filmId: film.id,
                        }),
                    });

                    const result = await response.json();
                    if (response.ok) {
                        alert('Purchase successful!');
                        localStorage.setItem('balance', balance - film.price);
                        this.setupButton({ ...film, isPurchased: true }); // Update button to "Watch" after purchase
                    } else {
                        alert(result.message);
                    }
                } catch (error) {
                    console.error('Error during purchase:', error);
                    alert('Failed to complete purchase');
                }
            };
        }
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const userId = localStorage.getItem('id'); // Retrieve the user ID from local storage
    const filmService = new FilmDetailsService(`http://localhost:3001/api/films/`);
    const filmDetailsUI = new FilmDetailsUI('film-details-container');

    try {
        const desiredFilm = await filmService.fetchFilmDetails(filmId, userId);
        filmDetailsUI.displayFilmDetails(desiredFilm);
    } catch (error) {
        console.error('Error in fetching and displaying film details:', error);
    }
});
