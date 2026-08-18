async function recordGamePlay(gameName, moves = 0, score = 0) {
    try {
        const response = await fetch(`/api/games/${gameName}/played`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ moves, score })
        });
        if(!response.ok) {
            console.error('Failed to record game played: ${response.status}');
           
        }
        const data = await response.json();
        console.log('Game play recorded:', data);
    } catch (err) {
        console.error('Failed to record game played:', err);
    }
}