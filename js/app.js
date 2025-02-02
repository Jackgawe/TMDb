// Main Application Logic
class App {
    constructor() {
        this.currentType = 'movie';
        this.currentPage = 1;
        this.currentGenre = '';
        this.currentView = 'grid';
        this.isLoading = false;
        this.searchTimeout = null;
        
        this.initializeEventListeners();
        this.loadInitialContent();
    }

    async initializeEventListeners() {
        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            const savedTheme = localStorage.getItem('theme') || 'dark';
            document.documentElement.setAttribute('data-theme', savedTheme);
            
            themeToggle.addEventListener('click', () => {
                const currentTheme = document.documentElement.getAttribute('data-theme');
                const newTheme = currentTheme === 'light' ? 'dark' : 'light';
                document.documentElement.setAttribute('data-theme', newTheme);
                localStorage.setItem('theme', newTheme);
                
                const icon = themeToggle.querySelector('i');
                icon.className = newTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
            });
        }

        // Search
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                clearTimeout(this.searchTimeout);
                const query = e.target.value.trim();
                
                this.searchTimeout = setTimeout(() => {
                    if (query) {
                        this.handleSearch(query);
                    } else {
                        this.resetAndLoad();
                    }
                }, 500);
            });
        }

        // Type Filter
        const typeFilter = document.getElementById('typeFilter');
        if (typeFilter) {
            typeFilter.addEventListener('change', (e) => {
                this.currentType = e.target.value;
                this.loadGenres();
                this.resetAndLoad();
            });
        }

        // Genre Filter
        const genreFilter = document.getElementById('genreFilter');
        if (genreFilter) {
            genreFilter.addEventListener('change', (e) => {
                this.currentGenre = e.target.value;
                this.resetAndLoad();
            });
        }

        // View Type
        const viewButtons = document.querySelectorAll('.view-type');
        viewButtons.forEach(button => {
            button.addEventListener('click', () => {
                const view = button.dataset.view;
                this.changeViewType(view);
                
                // Update active state
                viewButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
            });
        });

        // Load More
        const loadMoreButton = document.getElementById('loadMore');
        if (loadMoreButton) {
            loadMoreButton.addEventListener('click', () => this.loadMore());
        }

        // Close Modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });

        const modal = document.getElementById('modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }
    }

    async loadInitialContent() {
        await this.loadGenres();
        await this.loadContent();
    }

    async loadGenres() {
        try {
            const genres = await TMDbAPI.getGenres(this.currentType);
            const genreFilter = document.getElementById('genreFilter');
            
            if (genreFilter) {
                genreFilter.innerHTML = '<option value="">All Genres</option>' +
                    genres.map(genre => 
                        `<option value="${genre.id}">${genre.name}</option>`
                    ).join('');
            }
        } catch (error) {
            console.error('Error loading genres:', error);
        }
    }

    changeViewType(type) {
        this.currentView = type;
        const content = document.getElementById('content');
        if (content) {
            content.className = `${type}-view`;
        }
    }

    async handleSearch(query) {
        this.currentPage = 1;
        const content = document.getElementById('content');
        if (content) {
            content.innerHTML = '';
        }
        
        try {
            UI.showLoading();
            const results = await TMDbAPI.search(query, this.currentType);
            this.displayResults(results);
        } catch (error) {
            console.error('Error searching:', error);
        } finally {
            UI.hideLoading();
        }
    }

    async loadContent(append = false) {
        if (this.isLoading) return;
        this.isLoading = true;

        try {
            UI.showLoading();
            const data = await TMDbAPI.discover(this.currentType, {
                page: this.currentPage,
                with_genres: this.currentGenre
            });

            this.displayResults(data, append);
            this.currentPage++;
        } catch (error) {
            console.error('Error loading content:', error);
        } finally {
            this.isLoading = false;
            UI.hideLoading();
        }
    }

    displayResults(data, append = false) {
        const content = document.getElementById('content');
        if (!content) return;

        if (!append) {
            content.innerHTML = '';
        }

        data.results.forEach(item => {
            const card = UI.createMovieCard(item, this.currentView);
            card.addEventListener('click', () => this.showDetails(item.id));
            content.appendChild(card);
        });
    }

    async showDetails(id) {
        try {
            UI.showLoading();
            const details = await TMDbAPI.getDetails(id, this.currentType);
            const modal = document.getElementById('modal');
            if (modal) {
                await UI.showDetails(details, this.currentType);
                modal.classList.remove('hidden');
                document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
            }
        } catch (error) {
            console.error('Error loading details:', error);
        } finally {
            UI.hideLoading();
        }
    }

    closeModal() {
        const modal = document.getElementById('modal');
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = ''; // Restore scrolling
        }
    }

    async loadMore() {
        await this.loadContent(true);
    }

    resetAndLoad() {
        this.currentPage = 1;
        this.loadContent();
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});