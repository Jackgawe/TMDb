// UI Service
class UI {
    static createMovieCard(data, viewType = 'grid') {
        const card = document.createElement('div');
        card.className = 'movie-card';
        
        const imageUrl = TMDbAPI.getImageUrl(data.poster_path);
        const title = data.title || data.name;
        const year = (data.release_date || data.first_air_date || '').split('-')[0];
        const rating = data.vote_average?.toFixed(1) || 'N/A';
        const overview = data.overview || 'No overview available';
        
        if (viewType === 'grid') {
            card.innerHTML = `
                <div class="relative overflow-hidden rounded-lg bg-gray-800 shadow-lg">
                    <img src="${imageUrl}" alt="${title}" class="w-full h-auto object-cover" loading="lazy">
                    <div class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
                        <h3 class="text-lg font-semibold mb-1">${title}</h3>
                        <div class="flex items-center justify-between text-sm text-gray-300">
                            <span>${year}</span>
                            <span class="flex items-center">
                                <i class="fas fa-star text-yellow-500 mr-1"></i>
                                ${rating}
                            </span>
                        </div>
                    </div>
                </div>
            `;
        } else if (viewType === 'list') {
            card.innerHTML = `
                <div class="flex bg-gray-800 rounded-lg overflow-hidden">
                    <img src="${imageUrl}" alt="${title}" class="w-40 object-cover" loading="lazy">
                    <div class="flex-1 p-4">
                        <div class="flex justify-between items-start mb-2">
                            <h3 class="text-lg font-semibold">${title}</h3>
                            <span class="flex items-center bg-yellow-500 text-black px-2 py-1 rounded">
                                <i class="fas fa-star mr-1"></i>
                                ${rating}
                            </span>
                        </div>
                        <p class="text-sm text-gray-400 mb-2">${year}</p>
                        <p class="text-gray-300 text-sm line-clamp-2">${overview}</p>
                    </div>
                </div>
            `;
        } else if (viewType === 'compact') {
            card.innerHTML = `
                <div class="flex items-center p-2 bg-gray-800 rounded-lg">
                    <img src="${imageUrl}" alt="${title}" class="w-12 h-18 object-cover rounded" loading="lazy">
                    <div class="flex-1 ml-3">
                        <h3 class="font-medium text-sm">${title}</h3>
                        <p class="text-xs text-gray-400">${year}</p>
                    </div>
                    <span class="flex items-center text-sm">
                        <i class="fas fa-star text-yellow-500 mr-1"></i>
                        ${rating}
                    </span>
                </div>
            `;
        }
        
        return card;
    }

    static async showDetails(data, type = 'movie') {
        const modal = document.getElementById('modal');
        const genres = data.genres?.map(g => g.name).join(', ') || 'N/A';
        const runtime = data.runtime ? `${data.runtime} min` : (data.episode_run_time ? `${data.episode_run_time[0]} min/ep` : 'N/A');
        const releaseDate = (data.release_date || data.first_air_date || '').split('-')[0];
        const rating = data.vote_average?.toFixed(1) || 'N/A';
        const overview = data.overview || 'No overview available';
        
        const modalContent = `
            <div class="modal-content bg-gray-800 rounded-lg overflow-hidden">
                <div class="modal-header">
                    <img src="${TMDbAPI.getImageUrl(data.backdrop_path || data.poster_path, 'original')}" 
                         alt="${data.title || data.name}" 
                         class="w-full h-auto">
                    <button onclick="app.closeModal()" class="modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body p-6">
                    <h2 class="text-2xl font-bold mb-4">${data.title || data.name}</h2>
                    <div class="grid grid-cols-2 gap-4 mb-6 text-sm">
                        <div>
                            <p><span class="text-gray-400">Release Year:</span> ${releaseDate}</p>
                            <p><span class="text-gray-400">Rating:</span> ${rating}</p>
                            <p><span class="text-gray-400">Runtime:</span> ${runtime}</p>
                        </div>
                        <div>
                            <p><span class="text-gray-400">Genres:</span> ${genres}</p>
                            <p><span class="text-gray-400">Status:</span> ${data.status || 'N/A'}</p>
                        </div>
                    </div>
                    <p class="text-gray-300 mb-6">${overview}</p>
                    ${this.createCastSection(data.credits?.cast)}
                    ${this.createVideoSection(data.videos?.results)}
                </div>
            </div>
        `;

        modal.innerHTML = modalContent;
        modal.classList.remove('hidden');
        modal.classList.add('fade-in');
    }

    static createCastSection(cast) {
        if (!cast || cast.length === 0) return '';
        
        const castMembers = cast.slice(0, 5).map(member => `
            <div class="text-center">
                <img src="${TMDbAPI.getImageUrl(member.profile_path)}" 
                     alt="${member.name}"
                     class="w-20 h-20 rounded-full object-cover mx-auto mb-2">
                <p class="font-semibold text-sm">${member.name}</p>
                <p class="text-xs text-gray-400">${member.character}</p>
            </div>
        `).join('');

        return `
            <div class="mb-6">
                <h3 class="text-xl font-semibold mb-4">Cast</h3>
                <div class="grid grid-cols-5 gap-4">
                    ${castMembers}
                </div>
            </div>
        `;
    }

    static createVideoSection(videos) {
        if (!videos || videos.length === 0) return '';
        
        const trailer = videos.find(video => video.type === 'Trailer') || videos[0];
        if (!trailer) return '';

        return `
            <div>
                <h3 class="text-xl font-semibold mb-4">Trailer</h3>
                <div class="relative pt-[56.25%] bg-black rounded-lg overflow-hidden">
                    <iframe src="https://www.youtube.com/embed/${trailer.key}"
                            class="absolute inset-0 w-full h-full"
                            frameborder="0"
                            allow="autoplay; encrypted-media"
                            allowfullscreen></iframe>
                </div>
            </div>
        `;
    }

    static async getWhereToWatch(id, type) {
        try {
            const response = await fetch(`https://api.watchmode.com/v1/title/${type === 'movie' ? 'movie' : 'tv'}-${id}/sources/?apiKey=${CONFIG.WATCHMODE_API_KEY}`);
            if (!response.ok) return null;
            
            const data = await response.json();
            const sources = {};
            
            data.forEach(source => {
                if (!sources[source.name]) {
                    sources[source.name] = {
                        type: source.type,
                        price: source.price,
                        icon: `https://cdn.watchmode.com/provider_logos/${source.name.toLowerCase().replace(/\s+/g, '_')}.png`
                    };
                }
            });
            
            return sources;
        } catch (error) {
            console.error('Error fetching streaming sources:', error);
            return null;
        }
    }

    static updateViewType(viewType) {
        const container = document.getElementById('popularMovies');
        const tvContainer = document.getElementById('trendingTVShows');
        
        // Remove old view type classes
        ['grid-view', 'list-view', 'compact-view'].forEach(cls => {
            container.classList.remove(cls);
            tvContainer.classList.remove(cls);
        });
        
        // Add new view type class
        container.classList.add(`${viewType}-view`);
        tvContainer.classList.add(`${viewType}-view`);
        
        // Update buttons
        document.querySelectorAll('.view-type-button').forEach(btn => {
            btn.classList.remove('active', 'text-yellow-500');
            btn.classList.add('text-gray-400');
        });
        
        const activeButton = document.getElementById(`${viewType}View`);
        if (activeButton) {
            activeButton.classList.add('active', 'text-yellow-500');
            activeButton.classList.remove('text-gray-400');
        }
    }

    static updateActiveGenre(genreId) {
        document.querySelectorAll('#genreFilter button').forEach(button => {
            if (button.dataset.genreId === genreId) {
                button.classList.remove('bg-gray-700', 'text-white');
                button.classList.add('bg-yellow-500', 'text-black');
            } else {
                button.classList.remove('bg-yellow-500', 'text-black');
                button.classList.add('bg-gray-700', 'text-white');
            }
        });
    }

    static createGenreTag(genre) {
        const tag = document.createElement('button');
        tag.className = 'px-4 py-2 rounded-full text-sm font-medium bg-gray-700 text-white hover:bg-yellow-500 hover:text-black transition-colors';
        tag.textContent = genre.name;
        tag.dataset.genreId = genre.id;
        return tag;
    }

    static toggleLoadingSpinner(show) {
        const spinner = document.getElementById('loadingSpinner');
        if (show) {
            spinner.classList.remove('hidden');
        } else {
            spinner.classList.add('hidden');
        }
    }

    static showError(message) {
        const errorElement = document.getElementById('errorMessage');
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
        setTimeout(() => {
            errorElement.classList.add('hidden');
        }, 3000);
    }

    static async showMovieDetails(item, type = 'movie') {
        try {
            UI.toggleLoadingSpinner(true);
            const details = await TMDbAPI.getDetails(item.id, type);
            const modal = document.getElementById('movieModal');
            const modalContent = modal.querySelector('.modal-content');
            
            const backdropPath = details.backdrop_path ? 
                `https://image.tmdb.org/t/p/original${details.backdrop_path}` : 
                'https://via.placeholder.com/1280x720?text=No+Image';

            modalContent.innerHTML = `
                <div class="relative">
                    <div class="absolute top-2 right-2">
                        <button class="bg-gray-900/50 hover:bg-gray-900 p-2 rounded-full transition-colors" onclick="app.closeModal()">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    
                    <div class="relative h-[40vh] bg-cover bg-center" 
                         style="background-image: url('${TMDbAPI.getBackdropUrl(details.backdrop_path)}')">
                        <div class="absolute inset-0 bg-gradient-to-t from-gray-800"></div>
                    </div>
                    
                    <div class="p-6">
                        <div class="flex flex-col md:flex-row gap-6">
                            <img src="${TMDbAPI.getImageUrl(details.poster_path)}" 
                                 alt="${details.title || details.name}" 
                                 class="w-64 rounded-lg shadow-lg -mt-32 relative z-10">
                             
                            <div class="flex-1">
                                <h2 class="text-3xl font-bold mb-2">${details.title || details.name}</h2>
                                <div class="flex items-center gap-4 text-gray-300 mb-4">
                                    <span>${details.release_date || details.first_air_date || 'N/A'}</span>
                                    <span>•</span>
                                    <span>${details.runtime || (details.episode_run_time?.[0] || 'N/A')} min</span>
                                    <span>•</span>
                                    <span class="bg-yellow-500 text-black px-2 py-1 rounded font-bold">
                                        ${(details.vote_average * 10).toFixed(0)}%
                                    </span>
                                </div>
                                
                                <div class="flex flex-wrap gap-2 mb-4">
                                    ${details.genres?.map(genre => 
                                        `<span class="px-3 py-1 bg-gray-700 rounded-full text-sm">${genre.name}</span>`
                                    ).join('') || 'N/A'}
                                </div>
                                
                                <p class="text-gray-300 mb-6">${details.overview}</p>
                                
                                <div class="mb-6">
                                    <h3 class="text-xl font-semibold mb-3">Cast</h3>
                                    <div class="flex gap-4 overflow-x-auto pb-4">
                                        ${details.credits.cast.slice(0, 6).map(actor => `
                                            <div class="flex-shrink-0 w-24">
                                                <img src="${TMDbAPI.getImageUrl(actor.profile_path, 'w185')}" 
                                                     alt="${actor.name}"
                                                     class="w-24 h-24 object-cover rounded-full mb-2">
                                                <p class="text-center text-sm font-medium">${actor.name}</p>
                                                <p class="text-center text-xs text-gray-400">${actor.character}</p>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                                
                                ${details.videos.results.length > 0 ? `
                                    <div class="mb-6">
                                        <h3 class="text-xl font-semibold mb-3">Trailers & Videos</h3>
                                        <div class="flex gap-4 overflow-x-auto pb-4">
                                            ${details.videos.results.slice(0, 3).map(video => `
                                                <a href="https://www.youtube.com/watch?v=${video.key}" 
                                                   target="_blank"
                                                   class="flex-shrink-0 relative group">
                                                    <img src="https://img.youtube.com/vi/${video.key}/mqdefault.jpg" 
                                                         alt="${video.name}"
                                                         class="w-64 rounded">
                                                    <div class="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <i class="fas fa-play text-2xl"></i>
                                                    </div>
                                                </a>
                                            `).join('')}
                                        </div>
                                    </div>
                                ` : ''}
                                
                                ${details.similar.results.length > 0 ? `
                                    <div>
                                        <h3 class="text-xl font-semibold mb-3">Similar ${type === 'tv' ? 'Shows' : 'Movies'}</h3>
                                        <div class="flex gap-4 overflow-x-auto pb-4">
                                            ${details.similar.results.slice(0, 6).map(item => `
                                                <div class="flex-shrink-0 w-36 cursor-pointer" onclick="app.showModal(${item.id}, '${type}')">
                                                    <img src="${TMDbAPI.getImageUrl(item.poster_path, 'w185')}" 
                                                         alt="${type === 'tv' ? item.name : item.title}"
                                                         class="w-full rounded mb-2">
                                                    <p class="text-sm font-medium line-clamp-2">${type === 'tv' ? item.name : item.title}</p>
                                                </div>
                                            `).join('')}
                                        </div>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            `;
            modal.classList.remove('hidden');
        } catch (error) {
            UI.showError('Error loading movie details');
            console.error(error);
        } finally {
            UI.toggleLoadingSpinner(false);
        }
    }

    static updateHeroSection(movie) {
        const hero = document.getElementById('heroSection');
        const backdropPath = movie.backdrop_path ? 
            `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : 
            'https://via.placeholder.com/1920x1080?text=No+Image';

        hero.style.backgroundImage = `url(${backdropPath})`;
        hero.querySelector('h1').textContent = movie.title;
        hero.querySelector('p').textContent = movie.overview;
    }

    static showLoading() {
        document.getElementById('loading').classList.remove('hidden');
    }

    static hideLoading() {
        document.getElementById('loading').classList.add('hidden');
    }
}
