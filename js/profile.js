async function loadProfile() {
  try {
    const response = await fetch('/api/me');
    const data = await response.json();

    if (!data.loggedIn) {
      window.location.href = 'login.html';
      return;
    }

    document.getElementById('welcome-msg').textContent = `${data.user.username}'s Profile`;

    const statsResponse = await fetch('/api/games/stats');
    const statsData = await statsResponse.json();

    renderStats(statsData.stats || []);
  } catch (err) {
    console.error('Error loading profile:', err);
  }
}

function formatGameTitle(slug) {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getSpecificMetric(stat) {
  if (stat.game_name === 'snake') {
    return `<span class="stat-badge high-score">Highest Score: <strong>${stat.max_score || 0}</strong></span>`;
  }
  if (stat.game_name === 'memory-match') {
    return `<span class="stat-badge moves">Least Total Moves: <strong>${stat.total_moves || 0}</strong></span>`;
  }
  if (stat.total_moves > 0) {
    return `<span class="stat-badge moves">Least Total Moves: <strong>${stat.total_moves}</strong></span>`;
  }
  return '';
}

function renderStats(stats) {
  const statsList = document.getElementById('stats-list');

  if (stats.length === 0) {
    statsList.innerHTML = '<li class="empty-state">No games played yet — go play something!</li>';
    return;
  }

  const sorted = [...stats].sort((a, b) => b.games_played - a.games_played);

  statsList.innerHTML = sorted
    .map(
      (stat, index) => `
      <li>
        <div class="stat-main">
          <span class="rank">#${index + 1}</span>
          <span class="game-name">${formatGameTitle(stat.game_name)}</span>
        </div>
        <div class="stat-details">
          ${getSpecificMetric(stat)}
          <span class="game-score" title="Games Played">${stat.games_played}</span>
        </div>
      </li>
    `
    )
    .join('');
}

loadProfile();