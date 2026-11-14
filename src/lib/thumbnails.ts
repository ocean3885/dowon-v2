import fs from 'fs/promises';
import path from 'path';
import { Readable, Writable } from 'stream';
import * as PImage from 'pureimage';

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

    const sourceBuffer = typeof source === 'string' ? await fs.readFile(source) : source;
    const input = Readable.from([sourceBuffer]);
    const isPng = sourceBuffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    const isJpeg = sourceBuffer[0] === 0xff && sourceBuffer[1] === 0xd8 && sourceBuffer[2] === 0xff;

    if (!isPng && !isJpeg) {
        throw new Error('Thumbnail input must be a PNG or JPEG image');
    }

    const image = isPng
        ? await PImage.decodePNGFromStream(input)
        : await PImage.decodeJPEGFromStream(input);
    const canvas = PImage.make(width, height);
    const scale = Math.max(width / image.width, height / image.height);
    const scaledWidth = image.width * scale;
    const scaledHeight = image.height * scale;
    canvas.getContext('2d').drawImage(
        image,
        (width - scaledWidth) / 2,
        (height - scaledHeight) / 2,
        scaledWidth,
        scaledHeight,
    );

    const chunks: Buffer[] = [];
    const output = new Writable({
        write(chunk: Buffer, _encoding, callback) {
            chunks.push(Buffer.from(chunk));
            callback();
        },
    });
    await PImage.encodeJPEGToStream(canvas, output, quality);
    return Buffer.concat(chunks);
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
