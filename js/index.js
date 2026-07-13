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