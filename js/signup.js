const form = document.querySelector('form');

form.addEventListener('submit', async function(event){
    event.preventDefault();

    const username = document.getElementById('exampleInputName1').value;
    const password = document.getElementById('InputPassword1').value;
    const confirmPassword = document.getElementById('InputPassword2').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }
    
    try {
        const response = await fetch('/api/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        
        if(response.ok){
            alert('Account created! You can now log in.');
            window.location.href = 'login.html';
        }   
        else {
            alert(data.message);
        }
    } catch(err){
        console.error(err);
        alert('Something went wrong. Please try again.');

    }
    
        
});

