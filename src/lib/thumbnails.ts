import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

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

async function renderThumbnail(source: Buffer | string, options: ThumbnailOptions = {}): Promise<Buffer> {
    const width = options.width ?? DEFAULT_THUMBNAIL_WIDTH;
    const height = options.height ?? DEFAULT_THUMBNAIL_HEIGHT;
    const quality = options.quality ?? DEFAULT_THUMBNAIL_QUALITY;

    return sharp(source).resize(width, height, { fit: 'cover' }).jpeg({ quality }).toBuffer();
}

async function writeThumbnail(source: Buffer | string, thumbnailPath: string, options?: ThumbnailOptions) {
    const outputBuffer = await renderThumbnail(source, options);
    await fs.mkdir(path.dirname(thumbnailPath), { recursive: true });
    await fs.writeFile(thumbnailPath, outputBuffer);
}

export async function createThumbnailFromBuffer(sourceBuffer: Buffer, thumbnailPath: string, options?: ThumbnailOptions) {
    await writeThumbnail(sourceBuffer, thumbnailPath, options);
}

export async function createThumbnailFromFile(sourcePath: string, thumbnailPath: string, options?: ThumbnailOptions) {
    await writeThumbnail(sourcePath, thumbnailPath, options);
}

export async function createThumbnailBuffer(sourceBuffer: Buffer, options: ThumbnailOptions = {}): Promise<Buffer> {
    return renderThumbnail(sourceBuffer, options);
}
