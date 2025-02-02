// TMDb API Service
class TMDbAPI {
    static get API_KEY() { return CONFIG.API_KEY; }
    static get API_BASE_URL() { return CONFIG.API_BASE_URL; }
    static get IMAGE_BASE_URL() { return CONFIG.IMAGE_BASE_URL; }

    static async discover(type = 'movie', options = {}) {
        try {
            const { page = 1, with_genres } = options;
            let url = `${this.API_BASE_URL}/discover/${type}?api_key=${this.API_KEY}&page=${page}&sort_by=popularity.desc`;
            
            if (with_genres) {
                url += `&with_genres=${with_genres}`;
            }
            
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to fetch ${type}s`);
            return await response.json();
        } catch (error) {
            console.error(`Error fetching ${type}s:`, error);
            throw error;
        }
    }

    static async search(query, type = 'movie', page = 1) {
        try {
            const url = `${this.API_BASE_URL}/search/${type}?api_key=${this.API_KEY}&query=${encodeURIComponent(query)}&page=${page}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to search');
            return await response.json();
        } catch (error) {
            console.error('Error searching:', error);
            throw error;
        }
    }

    static async getDetails(id, type = 'movie') {
        try {
            // Get details, credits, videos, and watch providers in parallel
            const [details, watchProviders] = await Promise.all([
                fetch(`${this.API_BASE_URL}/${type}/${id}?api_key=${this.API_KEY}&append_to_response=credits,videos`)
                    .then(res => {
                        if (!res.ok) throw new Error(`Failed to fetch ${type} details`);
                        return res.json();
                    }),
                this.getWatchProviders(id, type)
            ]);

            return {
                ...details,
                watch_providers: watchProviders
            };
        } catch (error) {
            console.error(`Error fetching ${type} details:`, error);
            throw error;
        }
    }

    static async getWatchProviders(id, type = 'movie') {
        try {
            const url = `${this.API_BASE_URL}/${type}/${id}/watch/providers?api_key=${this.API_KEY}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch watch providers');
            const data = await response.json();
            
            // Get user's country results (you might want to make this configurable)
            const countryCode = 'US'; // Default to US
            return data.results[countryCode] || null;
        } catch (error) {
            console.error('Error fetching watch providers:', error);
            return null;
        }
    }

    static async getGenres(type = 'movie') {
        try {
            const url = `${this.API_BASE_URL}/genre/${type}/list?api_key=${this.API_KEY}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch genres');
            const data = await response.json();
            return data.genres;
        } catch (error) {
            console.error('Error fetching genres:', error);
            throw error;
        }
    }

    static getImageUrl(path, size = 'w500') {
        if (!path) return 'https://via.placeholder.com/500x750?text=No+Image';
        return `${this.IMAGE_BASE_URL}/${size}${path}`;
    }
}