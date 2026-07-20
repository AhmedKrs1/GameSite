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

  statsList.innerHTML = stats
    .map(stat => `<li>${stat.game_name}: ${stat.games_played} games played</li>`)
    .join('');
}

loadProfile();