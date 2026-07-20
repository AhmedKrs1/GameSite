async function loadProfile() {
  try {
    const response = await fetch('/api/me');
    const data = await response.json();

    if (!data.loggedIn) {
      // Not logged in — this page requires an account, so send them to login
      window.location.href = 'login.html';
      return;
    }

    // Show a welcome message using the logged-in user's username
    document.getElementById('welcome-msg').textContent = `${data.user.username}'s Profile`;

    // Now fetch their game stats
    const statsResponse = await fetch('/api/games/stats');
    const statsData = await statsResponse.json();

    renderStats(statsData.stats);
  } catch (err) {
    console.error('Error loading profile:', err);
  }
}

function renderStats(stats) {
  const statsList = document.getElementById('stats-list');

  if (stats.length === 0) {
    statsList.innerHTML = '<li>No games played yet — go play something!</li>';
    return;
  }

    const sorted = [...stats].sort((a, b) => b.games_played - a.games_played);

    statsList.innerHTML = sorted
        .map((stat, index) => `
        <li>
            <span class="rank">#${index + 1}</span>
            <span class="game-name">${stat.game_name}</span>
            <span class="game-score">${stat.games_played}</span>
        </li>
     `)
    .join('');
}

loadProfile();