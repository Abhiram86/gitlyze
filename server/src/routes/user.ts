import express, { type Router } from 'express';
import db from '../utils/db.js';
import renderHTML from '../utils/render.js';

export interface User {
    id: number | null;
    username: string;
    name: string;
    company: string;
    location: string;
    bio: string;
    email: string;
    avatar_url: string;
    github_link: string;
    follower_count: number;
    following_count: number;
    public_repo_count: number;
    most_used_language: string | null;
    total_stars: number;
    top_repo: string | null;
    joined_at: Date;
}

const userRouter: Router = express.Router();

async function fetchGitHubUserData(username: string) : Promise<User> {
    const resp = await fetch(`https://api.github.com/users/${username}`);
    if (!resp.ok) {
        throw new Error(resp.status === 404 ? 'User not found on GitHub' : 'GitHub API error!');
    }
    const userData = await resp.json();
    
    let total_stars = 0;
    let top_repo = null;
    let most_used_language = null;
    
    const reposResp = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`);
    if (reposResp.ok) {
        const repos = await reposResp.json();
        const langCount: Record<string, number> = {};
        let maxStars = -1;
        
        for (const repo of repos) {
            total_stars += repo.stargazers_count || 0;
            if ((repo.stargazers_count || 0) > maxStars) {
                maxStars = repo.stargazers_count || 0;
                top_repo = repo.name;
            }
            if (repo.language) {
                langCount[repo.language] = (langCount[repo.language] || 0) + 1;
            }
        }
        
        let maxLangCount = 0;
        for (const [lang, count] of Object.entries(langCount)) {
            if (count > maxLangCount) {
                maxLangCount = count;
                most_used_language = lang;
            }
        }
    }

    return {
        id: userData.id,
        username: userData.login,
        name: userData.name,
        company: userData.company,
        location: userData.location,
        bio: userData.bio,
        email: userData.email,
        avatar_url: userData.avatar_url,
        github_link: userData.html_url,
        follower_count: userData.followers,
        following_count: userData.following,
        public_repo_count: userData.public_repos,
        most_used_language: most_used_language,
        total_stars: total_stars,
        top_repo: top_repo,
        joined_at: new Date(userData.created_at)
    };
}

userRouter.get('/', async (req, res) => {
  const sql = 'SELECT * FROM users';
  const [rows] = await db.query(sql);
  res.json(rows);
});

userRouter.get('/:username', async (req: express.Request, res: express.Response): Promise<void> => {
    const { username } = req.params as { username: string };
    const toRenderHTML = req.query.html === 'true' || req.query.html === '1';
    try {
        const sql = 'SELECT * FROM users WHERE username = ?';
        const [rows]: any = await db.query(sql, [username]);
        
        if (rows && rows.length > 0) {
            if (toRenderHTML) {
                res.send(renderHTML(rows[0]));
            } else {
                res.json(rows[0]);
            }
            return;
        }

        const ghData = await fetchGitHubUserData(username);
        const returnData = {
            ...ghData,
            created_at: new Date()
        };
        
        if (toRenderHTML) {
            res.send(renderHTML(returnData as any));
        } else {
            res.json(returnData);
        }
    } catch (error: any) {
        if (error.message === 'User not found on GitHub') {
            res.status(404).json({ error: 'User not found' });
        } else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

userRouter.post('/:username', async (req: express.Request, res: express.Response): Promise<void> => {
    const { username } = req.params as { username: string };
    const toRenderHTML = req.query.html === 'true' || req.query.html === '1';
    try {
        const sqlCheck = 'SELECT * FROM users WHERE username = ?';
        const [rows]: any = await db.query(sqlCheck, [username]);
        
        if (rows && rows.length > 0) {
            res.status(409).json({ error: 'User already exists' });
            return;
        }

        const ghData = await fetchGitHubUserData(username);

        const insertSql = `
            INSERT INTO users (
                username, name, company, location, bio, email, 
                avatar_url, github_link, follower_count, following_count, 
                public_repo_count, most_used_language, total_stars, top_repo, joined_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const values = [
            ghData.username, ghData.name, ghData.company, ghData.location, ghData.bio, ghData.email,
            ghData.avatar_url, ghData.github_link, ghData.follower_count, ghData.following_count,
            ghData.public_repo_count, ghData.most_used_language, ghData.total_stars, ghData.top_repo, ghData.joined_at
        ];

        await db.query(insertSql, values);
        
        const [newRows]: any = await db.query(sqlCheck, [ghData.username]);
        const returnData = newRows[0];
        
        if (toRenderHTML) {
            res.status(201).send(renderHTML(returnData));
        } else {
            res.status(201).json(returnData);
        }
    } catch (error: any) {
        console.error(error);
        if (error.message === 'User not found on GitHub') {
            res.status(404).json({ error: 'User not found on GitHub' });
        } else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

export default userRouter;