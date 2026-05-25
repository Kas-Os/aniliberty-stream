const anime: Record<number, $app.AL_CompleteAnime> = {}
const animeMetadata: Record<number, $app.Metadata_AnimeMetadata> = {}

class Provider implements CustomSource {
    private apiBase = "https://anilibria.top/api/v1";
    
    getSettings(): Settings {
        return {
            supportsAnime: true,
            supportsManga: false,
        }
    }

    // Returns all requested anime objects.
    async getAnime(ids: number[]): Promise<$app.AL_BaseAnime[]> {
        let ret: $app.AL_BaseAnime[] = []
        console.log(ids)
        for (const id of ids) {
            try {
                const res = await fetch(`${this.apiBase}/anime/releases/${id}`)
                if (!res.ok) continue;
                const data = await res.json();
                const a = data; 
                const anime: $app.AL_BaseAnime = {
                    type: "ANIME",
                    id: a.id,
                    siteUrl: `https://anilibria.top/anime/releases/release/${a.alias}`,
                    seasonYear: a.year,
                    title: {
                        userPreferred: a.name.main,
                        romaji: a.name.main,
                        english: a.name.english,
                        native: a.name.main,
                    },
                    format: a.type.value == "OAD" ? "TV" : a.type.value == "WEB" ? "TV" : a.type.value == "DORAMA" ? "TV" : a.type.value,
                    coverImage: {
                        extraLarge: "https://anilibria.top"+a.poster?.src,
                        large: "https://anilibria.top"+a.poster?.src,
                        medium: "https://anilibria.top"+a.poster?.preview,
                    },
                    bannerImage: "https://anilibria.top"+a.poster?.src,
                    episodes: a.episodes.length,
                    duration: 24,
                    description: a.description,
                    genres: [''],
                    isAdult: a.age_rating.is_adult,
                };
                ret.push(anime);
            } catch (error) {
                console.log('')
            }
        } 
        return ret
    }

    // Optionally returns the details for an anime (genres, trailer, etc.)
    // Note that not all the fields are used by the client.
    async getAnimeDetails(id: number): Promise<$app.AL_AnimeDetailsById_Media | null> {
        return null
    }

    // Returns the metadata for an anime.
    // This is used for episodes.
    async getAnimeMetadata(id: number): Promise<$app.Metadata_AnimeMetadata | null> {
        return animeMetadata[id]
    }

    // Returns the anime object with its 'relations'.
    // This is only used by the library scanner to build a relation tree.
    async getAnimeWithRelations(id: number): Promise<$app.AL_CompleteAnime> {
        if (anime[id]) {
            return anime[id] as $app.AL_CompleteAnime
        }
        throw new Error("not found.")
    }

    // Returns all anime available on the extension.
    async listAnime(search: string, page: number, perPage: number): Promise<ListResponse<$app.AL_BaseAnime>> {
        const safePerPage = Math.min(perPage, 50);
        let url:string;
        if (search) {
            url = `https://anilibria.top/api/v1/anime/catalog/releases?page=${page}&limit=${safePerPage}&f%5Bsearch%5D=${encodeURIComponent(search)}`
        } else {
            url = `https://anilibria.top/api/v1/anime/catalog/releases?page=${page}&limit=${safePerPage}`
        }
        const res = await fetch(url);
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        
        const json = await res.json();
        const items = json.data || json.list || json.items || [];

        const data = items.map((a: any) => ({
            id: a.id,
            idMal: a.id,
            siteUrl: `https://anilibria.top/anime/releases/release/${a.alias}`,
            title: {
                userPreferred: a.name.main,
                romaji: a.name.main,
                english: a.name.english,
                native: a.name.main,
            },
            format: a.type.value == "OAD" ? "TV" : a.type.value == "WEB" ? "TV" : a.type.value == "DORAMA" ? "TV" : a.type.value,
            coverImage: {
                extraLarge: "https://anilibria.top"+a.poster?.src,
                large: "https://anilibria.top"+a.poster?.src,
                medium: "https://anilibria.top"+a.poster?.preview,
            },
            bannerImage: "https://anilibria.top"+a.poster?.src,
            episodes: a.episodes_total,
            description: a.description,
            genres: [''],
            isAdult: a.age_rating.is_adult,
        })) as $app.AL_BaseAnime[];
        
        return {
            media: data,
            total: json.meta.pagination.total,
            page: json.meta.pagination.current_page,
            totalPages: json.meta.pagination.total_pages,
        }
    }
}
