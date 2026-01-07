// lib/githubAuthUrl.ts
export function getGitHubOAuthUrl() {
  const client_id = process.env.EX_GITHUB_CLIENT_ID;
  const redirect_uri = encodeURIComponent(
    "https://vibe-in-teal.vercel.app/api/auth/callback/github"
  );
  const scope = encodeURIComponent("read:user user:email");
  
  // CSRF protection (you can generate a random string)
  const state = crypto.randomUUID();

  const url = `https://github.com/login/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&scope=${scope}&state=${state}`;
  return url;
}