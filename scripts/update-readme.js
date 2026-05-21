const fs = require('fs');
const path = require('path');

const README_PATH = path.join(__dirname, '..', 'README.md');
const GH_USER = process.env.GH_USER || 'marcosd59';
const GH_TOKEN = process.env.GH_TOKEN;

function replaceSection(content, marker, newBody) {
  const start = `<!-- ${marker}:START -->`;
  const end = `<!-- ${marker}:END -->`;
  const regex = new RegExp(`${start}[\\s\\S]*?${end}`);
  return content.replace(regex, `${start}\n${newBody}\n${end}`);
}

async function fetchQuote() {
  try {
    const res = await fetch('https://zenquotes.io/api/today');
    const data = await res.json();
    const q = data[0];
    return `> *"${q.q}"*\n>\n> — **${q.a}**`;
  } catch (err) {
    console.error('Quote fail:', err.message);
    return '> Quote unavailable today.';
  }
}

async function fetchGithubStats() {
  try {
    const headers = GH_TOKEN ? { Authorization: `token ${GH_TOKEN}` } : {};
    const userRes = await fetch(`https://api.github.com/users/${GH_USER}`, { headers });
    const user = await userRes.json();

    const reposRes = await fetch(
      `https://api.github.com/users/${GH_USER}/repos?per_page=100&sort=updated`,
      { headers }
    );
    const repos = await reposRes.json();

    let totalStars = 0;
    let totalForks = 0;
    const langs = {};
    for (const r of repos) {
      if (r.fork) continue;
      totalStars += r.stargazers_count;
      totalForks += r.forks_count;
      if (r.language) langs[r.language] = (langs[r.language] || 0) + 1;
    }

    const topLangs = Object.entries(langs)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([l, c]) => `\`${l}\` (${c})`)
      .join(' · ');

    return [
      `- 📦 **Repos públicos:** ${user.public_repos}`,
      `- 👥 **Followers:** ${user.followers}`,
      `- ⭐ **Stars totales:** ${totalStars}`,
      `- 🍴 **Forks totales:** ${totalForks}`,
      `- 💻 **Top lenguajes:** ${topLangs || 'N/A'}`,
    ].join('\n');
  } catch (err) {
    console.error('GH stats fail:', err.message);
    return '- Stats unavailable.';
  }
}

async function main() {
  let content = fs.readFileSync(README_PATH, 'utf8');

  const [quote, stats] = await Promise.all([
    fetchQuote(),
    fetchGithubStats(),
  ]);

  const now = new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC';

  content = replaceSection(content, 'QUOTE', quote);
  content = replaceSection(content, 'STATS', stats);
  content = replaceSection(content, 'UPDATED', `Last update: **${now}**`);

  fs.writeFileSync(README_PATH, content);
  console.log('README updated.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
