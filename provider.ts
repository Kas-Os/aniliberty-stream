/// <reference path="./custom-source.d.ts" />
/// <reference path="./app.d.ts" />

const anime: Record<number, $app.AL_CompleteAnime> = {}
const animeMetadata: Record<number, $app.Metadata_AnimeMetadata> = {}

class Provider implements CustomSource {
    api = "https://yuzuki.kagane.org/api/v2"

    getSettings(): Settings {
        return {
            supportsAnime: true,
            supportsManga: false,
        }
    }

    // Returns all requested anime objects.
    async getAnime(ids: number[]): Promise<$app.AL_BaseAnime[]> {
        let ret: $app.AL_BaseAnime[] = []
        for (const id of ids) {
            if (anime[id]) {
                // Here we make a deep copy and remove the 'relations' attribute
                // this turn AL_CompleteAnime into AL_BaseAnime
                const a = $clone(media[id]) as $app.AL_CompleteAnime
                delete a["relations"]
                ret.push(a)
            }
            console.log(ids)
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
        if (media[id]) {
            return media[id] as $app.AL_CompleteAnime
        }
        throw new Error("not found.")
    }
}