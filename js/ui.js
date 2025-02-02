// UI Service
class UI {
    static createMovieCard(movie) {
        const card = document.createElement('div');
        card.className = 'bg-gray-800 rounded-lg overflow-hidden shadow-lg transform transition-transform hover:scale-105';
        card.dataset.movieId = movie.id;

        card.innerHTML = `
            <img src="${TMDbAPI.getImageUrl(movie.poster_path)}" 
                 alt="${movie.title}"
                 class="w-full h-96 object-cover">
            <div class="p-4">
                <h3 class="text-lg font-semibold mb-2">${movie.title}</h3>
                <div class="flex items-center space-x-2">
                    <span class="text-yellow-500">
                        <i class="fas fa-star"></i> ${movie.vote_average.toFixed(1)}
                    </span>
                    <span class="text-gray-400">${new Date(movie.release_date).getFullYear()}</span>
                </div>
            </div>
        `;

        return card;
    }

    static async showMovieDetails(movie) {
        const details = await TMDbAPI.getMovieDetails(movie.id);
        const modal = document.getElementById('movieModal');
        const content = document.getElementById('movieModalContent');

        content.innerHTML = `
            <div class="relative">
                <img src="${TMDbAPI.getImageUrl(details.backdrop_path, 'original')}" 
                     alt="${details.title}"
                     class="w-full h-64 object-cover rounded-t-lg">
                <button class="absolute top-4 right-4 text-white bg-gray-900 bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"
                        onclick="document.getElementById('movieModal').classList.add('hidden')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="mt-4">
                <h2 class="text-2xl font-bold mb-2">${details.title}</h2>
                <div class="flex items-center space-x-4 mb-4">
                    <span class="text-yellow-500">
                        <i class="fas fa-star"></i> ${details.vote_average.toFixed(1)}
                    </span>
                    <span>${new Date(details.release_date).getFullYear()}</span>
                    <span>${details.runtime} min</span>
                </div>
                <p class="text-gray-300 mb-4">${details.overview}</p>
                <div class="mb-4">
                    <h3 class="text-lg font-semibold mb-2">Cast</h3>
                    <div class="flex space-x-4 overflow-x-auto pb-4">
                        ${details.credits.cast.slice(0, 5).map(actor => `
                            <div class="flex-shrink-0">
                                <img src="${TMDbAPI.getImageUrl(actor.profile_path, 'w185')}" 
                                     alt="${actor.name}"
                                     class="w-24 h-24 object-cover rounded-full">
                                <p class="text-center mt-2 text-sm">${actor.name}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ${details.videos.results.length ? `
                    <div class="mb-4">
                        <h3 class="text-lg font-semibold mb-2">Trailer</h3>
                        <iframe width="100%" 
                                height="315" 
                                src="https://www.youtube.com/embed/${details.videos.results[0].key}"
                                frameborder="0"
                                allowfullscreen
                                class="rounded-lg"></iframe>
                    </div>
                ` : ''}
            </div>
        `;

        modal.classList.remove('hidden');
    }

    static toggleLoadingSpinner(show = true) {
        const spinner = document.getElementById('loadingSpinner');
        spinner.classList.toggle('hidden', !show);
    }

    static showError(message) {
        // You can implement a more sophisticated error handling UI here
        alert(message);
    }
}
