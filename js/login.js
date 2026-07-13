console.log('login.js loaded');
const form = document.querySelector('form');

form.addEventListener('submit', async function(event){
    event.preventDefault();
    
    const identifier = document.getElementById('InputEmail1').value;
    const password = document.getElementById('InputPassword1').value;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier, password })
        });
        const data = await response.json();
        
        if(response.ok){
            alert('Login successful!');
            window.location.href = 'index.html';
        }   
        else {
            alert(data.message);
        }
    } catch(err){
        console.error(err);
        alert('Something went wrong. Please try again.');
    }   

})