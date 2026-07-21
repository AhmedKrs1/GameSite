const profileIconBtn = document.getElementById('profileIconBtn');
const profileDropdown = document.getElementById('profileDropdown');

profileIconBtn.addEventListener('click', function (event) {
  event.stopPropagation(); // prevents this click from immediately closing the menu via the next listener
  profileDropdown.classList.toggle('show');
});

// Close the dropdown if the user clicks anywhere else on the page
document.addEventListener('click', function () {
  profileDropdown.classList.remove('show');
});

async function checkLoginStatus() {
  try {
    const response = await fetch('/api/me');
    const data = await response.json();

    if (data.loggedIn) {
// User is logged in, update the profile icon and dropdown
        profileIconBtn.classList.add('logged-in');

        // Safely display name in the dropdown (layer of security)
        profileDropdown.innerHTML = `
        <span class="dropdown-username" id="usernameDisplay"> </span>
        <a href="#" id="logoutLink">Log Out</a>
        <a href="profile.html" id="profileLink">Profile</a>
      `;
       document.getElementById('usernameDisplay').textContent ="Your username: " + data.user.username;
        document.getElementById('profileLink').addEventListener('click', function (event) {
          event.preventDefault();
          window.location.href = 'profile.html';
        });
      document.getElementById('logoutLink').addEventListener('click', async function (event) {
        event.preventDefault();
        await fetch('/api/logout', { method: 'POST' });
        window.location.reload();
      });
    } // If not logged in, show login and signup links, no change needed since they are already in the HTML\
    else {profileIconBtn.classList.remove('logged-in');}
  } catch (err) {
    console.error('Error checking login status:', err);
  }
}

// Call the function to check login status when the page loads
checkLoginStatus();