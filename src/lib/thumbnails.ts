import fs from 'fs/promises';
import path from 'path';
import { Jimp, JimpMime } from 'jimp';

const DEFAULT_THUMBNAIL_WIDTH = 320;
const DEFAULT_THUMBNAIL_HEIGHT = 320;
const DEFAULT_THUMBNAIL_QUALITY = 60;

type ThumbnailOptions = {
    width?: number;
    height?: number;
    quality?: number;
};

function normalizeAssetPath(assetPath: string) {
    return assetPath.startsWith('/') ? assetPath.slice(1) : assetPath;
}

export function buildThumbnailUrl(assetUrl: string) {
    const parsed = path.posix.parse(assetUrl);
    const directory = parsed.dir === '/' ? '' : parsed.dir;
    return `${directory}/${parsed.name}_thumb.jpg`;
}

export function getPublicFilePath(assetPath: string) {
    return path.join(process.cwd(), 'public', normalizeAssetPath(assetPath));
}

async function writeThumbnail(image: Jimp, thumbnailPath: string, options: ThumbnailOptions = {}) {
    const width = options.width ?? DEFAULT_THUMBNAIL_WIDTH;
    const height = options.height ?? DEFAULT_THUMBNAIL_HEIGHT;
    const quality = options.quality ?? DEFAULT_THUMBNAIL_QUALITY;

    image.cover({ w: width, h: height });

    const outputBuffer = await image.getBuffer(JimpMime.jpeg, { quality });

    await fs.mkdir(path.dirname(thumbnailPath), { recursive: true });
    await fs.writeFile(thumbnailPath, outputBuffer);
}

export async function createThumbnailFromBuffer(sourceBuffer: Buffer, thumbnailPath: string, options?: ThumbnailOptions) {
    const image = await Jimp.read(sourceBuffer);
    await writeThumbnail(image, thumbnailPath, options);
}

export async function createThumbnailFromFile(sourcePath: string, thumbnailPath: string, options?: ThumbnailOptions) {
    const image = await Jimp.read(sourcePath);
    await writeThumbnail(image, thumbnailPath, options);
}