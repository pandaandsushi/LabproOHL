class FilmDetailsService {
    constructor(apiUrl) {
        this.apiUrl = apiUrl;
    }

    async fetchFilmDetails(id) {
        try {
            const response = await fetch(`${this.apiUrl}${id}`);
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

        console.log('Displaying film:', film);
        document.getElementById('film-title').textContent = film[0].title;
        document.getElementById('film-description').textContent = film[0].description;
        document.getElementById('film-director').textContent = `Director: ${film[0].director}`;
        document.getElementById('film-release-year').textContent = `Release Year: ${film[0].releaseYear}`;
        document.getElementById('film-genre').textContent = `Genre: ${film[0].genre}`;
        document.getElementById('film-price').textContent = `Price: $${film[0].price}`;
        document.getElementById('film-duration').textContent = `Duration: ${film[0].duration} minutes`;

        // DEBUG BELOM BISA MALAH NGEFETCH
        // const coverImageElement = document.getElementById('film-cover-image');
        // coverImageElement.src = film[0].coverImage;
        // console.log(film[0].coverImage);
        // coverImageElement.style.display = 'block';

        const purchaseButton = document.getElementById('purchase-button');
        purchaseButton.addEventListener('click', async () => {
            console.log("PURCHASE CLICKED");
            const balance = Number(localStorage.getItem('balance'));
                try {
                    console.log("MULAI MASUK KE JS");
                    const response = await fetch('http://localhost:3001/api/purchase', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            userId: localStorage.getItem('id'),
                            filmId: film[0].id,
                        }),
                    });
                    const result = await response.json();
                    console.log(result.message);

                    if (response.ok) {
                        alert('Purchase successful!');
                        localStorage.setItem('balance', balance - film[0].price);
                        document.getElementById('purchase-button').textContent = 'Watch';
                    } else {
                        alert(result.message);
                    }
                } catch (error) {
                    console.error('Error during purchase:', error);
                    alert('Failed to complete purchase');
                }
        });

        const wishlistButton = document.getElementById('wishlist-button');
        wishlistButton.addEventListener('click', () => {
            console.log("WISHLIST CLICKED");

        });
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const filmService = new FilmDetailsService('http://localhost:3001/api/films/');
    const filmDetailsUI = new FilmDetailsUI('film-details-container');

    console.log('Fetching film details for ID:', filmId);
    try {
        const desiredFilm = await filmService.fetchFilmDetails(filmId);
        console.log('Desired film:', desiredFilm);
        filmDetailsUI.displayFilmDetails(desiredFilm);
    } catch (error) {
        console.error('Error in fetching and displaying film details:', error);
    }
});
