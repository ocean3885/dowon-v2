const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const Database = require('better-sqlite3');
const { Jimp, JimpMime } = require('jimp');

const dbPath = path.join(process.cwd(), 'dowon.db');
const publicRoot = path.join(process.cwd(), 'public');
const thumbnailWidth = 320;
const thumbnailHeight = 320;
const thumbnailQuality = 60;

function buildThumbnailUrl(assetUrl) {
    const parsed = path.posix.parse(assetUrl);
    const directory = parsed.dir === '/' ? '' : parsed.dir;
    return `${directory}/${parsed.name}_thumb.jpg`;
}

function toPublicPath(assetUrl) {
    return path.join(publicRoot, assetUrl.replace(/^\//, ''));
}

async function createThumbnail(sourcePath, thumbnailPath) {
    const image = await Jimp.read(sourcePath);
    image.cover({ w: thumbnailWidth, h: thumbnailHeight });

    const buffer = await image.getBuffer(JimpMime.jpeg, { quality: thumbnailQuality });
    await fsp.mkdir(path.dirname(thumbnailPath), { recursive: true });
    await fsp.writeFile(thumbnailPath, buffer);
}

async function main() {
    const db = new Database(dbPath);
    const posts = db.prepare('SELECT id, imageUrl, thumbnailUrl FROM posts WHERE imageUrl IS NOT NULL').all();

    let updated = 0;
    let skipped = 0;
    let failed = 0;

    for (const post of posts) {
        try {
            const sourcePath = toPublicPath(post.imageUrl);

            if (!fs.existsSync(sourcePath)) {
                skipped += 1;
                continue;
            }

            const nextThumbnailUrl = buildThumbnailUrl(post.imageUrl);
            const nextThumbnailPath = toPublicPath(nextThumbnailUrl);

            if (!fs.existsSync(nextThumbnailPath)) {
                await createThumbnail(sourcePath, nextThumbnailPath);
            }

            if (post.thumbnailUrl !== nextThumbnailUrl) {
                db.prepare('UPDATE posts SET thumbnailUrl = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?').run(nextThumbnailUrl, post.id);
                updated += 1;
            } else {
                skipped += 1;
            }
        } catch (error) {
            failed += 1;
            console.error(`Failed to backfill thumbnail for post ${post.id}:`, error);
        }
    }

    db.close();

    console.log(JSON.stringify({ updated, skipped, failed, total: posts.length }, null, 2));
}

main().catch((error) => {
    console.error('Thumbnail backfill failed:', error);
    process.exitCode = 1;
});