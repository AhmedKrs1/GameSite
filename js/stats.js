async function recordGamePlay(gameName, moves = null) {
    try {
        await fetch(`/api/games/${gameName}/played`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ moves })
        });
    } catch (err) {
        console.error('Failed to record game played:', err);
    }
}