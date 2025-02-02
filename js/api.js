// TMDb API Service
class TMDbAPI {
    static async getPopularMovies(page = 1) {
        const url = `${CONFIG.API_BASE_URL}/movie/popular?api_key=${CONFIG.API_KEY}&page=${page}`;
        const response = await fetch(url);
        return await response.json();
    }

    static async searchMovies(query, page = 1) {
        const url = `${CONFIG.API_BASE_URL}/search/movie?api_key=${CONFIG.API_KEY}&query=${encodeURIComponent(query)}&page=${page}`;
        const response = await fetch(url);
        return await response.json();
    }

    static async getMovieDetails(movieId) {
        const url = `${CONFIG.API_BASE_URL}/movie/${movieId}?api_key=${CONFIG.API_KEY}&append_to_response=credits,videos`;
        const response = await fetch(url);
        return await response.json();
    }

    static getImageUrl(path, size = CONFIG.POSTER_SIZE) {
        if (!path) return 'https://via.placeholder.com/500x750?text=No+Image';
        return `${CONFIG.IMAGE_BASE_URL}/${size}${path}`;
    }
}