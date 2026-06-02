import db from '../utils/db.js';

export async function createUserTable() {
    await db.query(`
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255) NOT NULL,
            name VARCHAR(255),
            company VARCHAR(255),
            location VARCHAR(255),
            bio TEXT,
            email VARCHAR(255),
            avatar_url VARCHAR(500),
            github_link VARCHAR(255) NOT NULL,
            follower_count INT NOT NULL,
            following_count INT NOT NULL,
            public_repo_count INT NOT NULL,
            most_used_language VARCHAR(255),
            total_stars INT NOT NULL,
            top_repo VARCHAR(255),
            joined_at TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `)
}