import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

let db: Database | null = null;

export async function getDb() {
  if (!db) {
    db = await open({
      filename: path.join(process.cwd(), 'dowon.db'),
      driver: sqlite3.Database
    });

    await db.exec(`
      CREATE TABLE IF NOT EXISTS consultations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        birthDate TEXT,
        contact TEXT NOT NULL,
        serviceType TEXT NOT NULL,
        notes TEXT,
        ipAddress TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS blog_posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        summary TEXT,
        contentUrl TEXT NOT NULL,
        thumbnailUrl TEXT,
        category TEXT,
        publishedDate TEXT,
        isSelected INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        displayOrder INTEGER DEFAULT 0,
        postLimit INTEGER DEFAULT 5,
        isActive INTEGER DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        categoryId INTEGER,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        author TEXT,
        viewCount INTEGER DEFAULT 0,
        imageUrl TEXT,
        thumbnailUrl TEXT,
        publishedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (categoryId) REFERENCES categories(id)
      );
    `);

    // Migration: Check if ipAddress column exists in consultations
    try {
      await db.exec('ALTER TABLE consultations ADD COLUMN ipAddress TEXT');
    } catch (e: unknown) {
      // Ignore error if column already exists
      if (e instanceof Error && !e.message.includes('duplicate column name')) {
        // If it's not a duplicate column error, maybe log it or it's fine if the column is already there from CREATE TABLE
        // The CREATE TABLE above works for new DBs. 
        // This ALTER TABLE is for existing DBs.
        // If table was just created, ALTER might fail or succeed depending on sqlite version/state? 
        // Actually, if CREATE TABLE runs, ipAddress is there. ALTER will say duplicate.
        // If table existed without IP, CREATE TABLE does nothing. ALTER adds it.
        // So catching duplicate column error is the right way.
      }
    }

    // Seed initial categories
    const categoryCount = await db.get('SELECT COUNT(*) as count FROM categories');
    if (categoryCount && categoryCount.count === 0) {
      await db.exec(`
        INSERT INTO categories (name, displayOrder, postLimit, isActive) VALUES 
        ('공지사항', 1, 5, 1),
        ('칼럼', 2, 6, 1),
        ('자유게시판', 3, 5, 1);
      `);
    }
  }
  return db;
}
