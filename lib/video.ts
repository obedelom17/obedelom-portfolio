/** Constantes partagées entre l'administration (navigateur) et les routes serveur pour les vidéos importées. */

/** Taille d'un morceau envoyé (octets bruts). En base64 : ≈ 2,8 Mo, sous la limite de 4,5 Mo d'une fonction Vercel. */
export const VIDEO_CHUNK = 2 * 1024 * 1024

/** Taille maximale d'une vidéo importée (octets). Au-delà, héberger sur YouTube / Vimeo ou compresser. */
export const VIDEO_MAX = 80 * 1024 * 1024

export const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime", "video/ogg"]

export const isVideoUrl = (u: string) => u.startsWith("/api/video/")
