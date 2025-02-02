// Main Application Logic
class App {
    constructor() {
        this.currentPage = 1;
        this.isLoading = false;
        this.searchTimeout = null;
        this.init();
    }

    init() {
        this.loadPopularMovies();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Search Input
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', (e) => {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                const query = e.target.value.trim();
                if (query) {
                    this.searchMovies(query);
                } else {
                    this.loadPopularMovies();
                }
            }, 500);
        });

        // Movie Card Click
        document.getElementById('popularMovies').addEventListener('click', (e) => {
            const movieCard = e.target.closest('[data-movie-id]');
            if (movieCard) {
                const movieId = movieCard.dataset.movieId;
                this.showMovieDetails(movieId);
            }
        });

        // Infinite Scroll
        window.addEventListener('scroll', () => {
            if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 1000) {
                if (!this.isLoading) {
                    this.currentPage++;
                    this.loadPopularMovies(this.currentPage);
                }
            }
        });
    }

    async loadPopularMovies(page = 1) {
        try {
            if (this.isLoading) return;
            this.isLoading = true;
            UI.toggleLoadingSpinner(true);

            const data = await TMDbAPI.getPopularMovies(page);
            const container = document.getElementById('popularMovies');
            
            if (page === 1) {
                container.innerHTML = '';
            }

            data.results.forEach(movie => {
                const card = UI.createMovieCard(movie);
                container.appendChild(card);
            });
        } catch (error) {
            UI.showError('Error loading popular movies');
            console.error(error);
        } finally {
            this.isLoading = false;
            UI.toggleLoadingSpinner(false);
        }
    }

    async searchMovies(query) {
        try {
            UI.toggleLoadingSpinner(true);
            const data = await TMDbAPI.searchMovies(query);
            const container = document.getElementById('popularMovies');
            container.innerHTML = '';

            if (data.results.length === 0) {
                container.innerHTML = '<p class="text-center col-span-full text-gray-400">No movies found</p>';
                return;
            }

            data.results.forEach(movie => {
                const card = UI.createMovieCard(movie);
                container.appendChild(card);
            });
        } catch (error) {
            UI.showError('Error searching movies');
            console.error(error);
        } finally {
            UI.toggleLoadingSpinner(false);
        }
    }

    async showMovieDetails(movieId) {
        try {
            const movie = { id: movieId };
            await UI.showMovieDetails(movie);
        } catch (error) {
            UI.showError('Error loading movie details');
            console.error(error);
        }
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new App();
});