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
        const purchaseButton = document.getElementById('purchase-button');
        const wishlistButton = document.getElementById('wishlist-button');
        
        console.log('Setting up buttons, isWishlisted:', film.isWishlisted);
    
        // cek undefined supaya ga revert ke add state saat reload dan set ke local memory untuk fallback
        if (film.isWishlisted === undefined) {
            const storedWishlistState = localStorage.getItem(`film_${film.id}_wishlist`);
            film.isWishlisted = storedWishlistState === 'true'; 
        }
    
        if (film.isPurchased) {
            purchaseButton.textContent = 'Watch';
            purchaseButton.onclick = () => {
                alert('Watching the film!');
            };
        } else {
            purchaseButton.textContent = 'Purchase';
            purchaseButton.onclick = async () => {
                const balance = Number(localStorage.getItem('balance'));
                try {
                    const response = await fetch('http://localhost:3001/api/purchasestatus', {
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
                        this.setupButton({ ...film, isPurchased: true });
                    } else {
                        alert(result.message);
                    }
                } catch (error) {
                    console.error('Error during purchase:', error);
                    alert('Failed to complete purchase');
                }
            };
        }
    
        if (film.isWishlisted) {
            wishlistButton.textContent = 'Add to Wishlist';
            wishlistButton.onclick = async () => {
                try {
                    const response = await fetch('http://localhost:3001/api/wishliststatus', {
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
                        alert('Removed from Wishlist');
                        localStorage.setItem(`film_${film.id}_wishlist`, false);
                        this.setupButton({ ...film, isWishlisted: false });
                    } else {
                        alert(result.message);
                    }
                } catch (error) {
                    console.error('Error during wishlist removal:', error);
                    alert('Failed to remove from wishlist');
                }
            };
        } else {
            wishlistButton.textContent = 'Remove from Wishlist';
            wishlistButton.onclick = async () => {
                try {
                    const response = await fetch('http://localhost:3001/api/wishliststatus', {
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
                        alert('Added to Wishlist');
                        localStorage.setItem(`film_${film.id}_wishlist`, true);
                        this.setupButton({ ...film, isWishlisted: true });
                    } else {
                        alert(result.message);
                    }
                } catch (error) {
                    console.error('Error during wishlist addition:', error);
                    alert('Failed to add to wishlist');
                }
            };
        }
    }    
    
}

document.addEventListener('DOMContentLoaded', async () => {
    const userId = localStorage.getItem('id'); 
    const filmService = new FilmDetailsService(`http://localhost:3001/api/films/`);
    const filmDetailsUI = new FilmDetailsUI('film-details-container');

    try {
        const desiredFilm = await filmService.fetchFilmDetails(filmId, userId);
        filmDetailsUI.displayFilmDetails(desiredFilm);
    } catch (error) {
        console.error('Error in fetching and displaying film details:', error);
    }
});
