import { User } from "../routes/user.js";

export default function renderHTML(data: User): string {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${data.username} - GitHub Stats</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 20px; line-height: 1.6; max-width: 600px; margin: 0 auto; color: #333; }
            .profile { text-align: center; }
            img { border-radius: 50%; width: 150px; height: 150px; border: 2px solid #ddd; }
            h2 { margin: 10px 0 0 0; }
            .username-link { color: #58a6ff; text-decoration: none; font-weight: bold; }
            .bio { font-style: italic; color: #666; margin: 10px 0; }
            .stats { display: flex; justify-content: space-around; background: #f6f8fa; padding: 15px; border-radius: 8px; border: 1px solid #d0d7de; margin: 20px 0; }
            .stat { text-align: center; }
            .stat b { font-size: 1.2em; display: block; }
            .stat span { font-size: 0.9em; color: #555; }
            .details { background: #fff; padding: 15px; border-radius: 8px; border: 1px solid #d0d7de; }
            .details ul { list-style: none; padding: 0; margin: 0; }
            .details li { margin-bottom: 8px; border-bottom: 1px solid #eaecef; padding-bottom: 8px; }
            .details li:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
            .details b { display: inline-block; width: 130px; color: #555; }
        </style>
    </head>
    <body>
        <div class="profile">
            <img src="${data.avatar_url || 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'}" alt="${data.username}'s avatar">
            <h2>${data.name || data.username}</h2>
            <p><a class="username-link" href="${data.github_link}" target="_blank">@${data.username}</a></p>
            ${data.bio ? `<p class="bio">${data.bio}</p>` : ''}
        </div>
        
        <div class="stats">
            <div class="stat"><b>${data.follower_count}</b><span>Followers</span></div>
            <div class="stat"><b>${data.following_count}</b><span>Following</span></div>
            <div class="stat"><b>${data.public_repo_count}</b><span>Repos</span></div>
            <div class="stat"><b>${data.total_stars}</b><span>Stars</span></div>
        </div>

        <div class="details">
            <ul>
                ${data.company ? `<li><b>Company:</b> ${data.company}</li>` : ''}
                ${data.location ? `<li><b>Location:</b> ${data.location}</li>` : ''}
                ${data.most_used_language ? `<li><b>Top Language:</b> ${data.most_used_language}</li>` : ''}
                ${data.top_repo ? `<li><b>Top Repo:</b> ${data.top_repo}</li>` : ''}
                <li><b>Joined GitHub:</b> ${new Date(data.joined_at).toLocaleDateString()}</li>
            </ul>
        </div>
    </body>
    </html>
    `;
}