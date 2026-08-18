// Build express.js server and connect to postgres database
const express = require('express');
const pool = require('./db');
const bcrypt = require('bcrypt');
// Build express-session for session management
const session = require('express-session');

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

// Configure session middleware
app.use(session({
    secret: process.env.SESSION_SECRET, // Replace with a strong secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false
       , maxAge: 24 * 60 * 60 * 1000 // 1 day in milliseconds
     } // Set to true if using HTTPS
}));

// Signup route
app.post('/api/signup', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;

    if( !username || !password || !email) {
        return res.status(400).json({ message: 'Username, email and password are required' });
    }
    // Input validation (layer of security to prevent SQL injection and other attacks)
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
        return res.status(400).json({ message: 'Username can only contain letters, numbers, and underscores (3-20 characters)' });
    }
    try {
        // Check if the username already exists
        const userCheck = await pool.query('SELECT * FROM users WHERE username = $1 OR email = $2', 
            [username, email]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ message: 'Username or email already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the new user into the database
        await pool.query('INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3)', 
            [username, email, hashedPassword]);

        res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }   

    
});

// Login route
app.post('/api/login', async (req, res) => {
  const identifier= req.body.identifier;
  const password = req.body.password;

  // Check if it's valid
  if(!identifier || !password) {
    return res.status(400).json({message: 'Identifier and password are required'});
  }

  try {
    // Find the user by name
    const userCheck = await pool.query('Select * FROM users WHERE username = $1 OR email = $2', [identifier, identifier]);

    if(userCheck.rows.length == 0) {
        return res.status(400).json({message: 'Invalid identifier or password'});
    }

    const user = userCheck.rows[0];

    // Compare password

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    
    if(!passwordMatch){
        return res.status(400).json({message: 'Invalid identifier or password'});
    }
    // Set session data
    req.session.userId = user.id;
    req.session.username = user.username;

    res.status(200).json({message: 'Login successful', user: {id: user.id, username: user.username} });


  } catch(err){
    console.error(err);
    res.status(500).json({message: 'Server error'});

  }
});

// Verify if logged in
app.get('/api/me', (req, res) => {
    if(req.session.userId) {
        res.status(200).json({loggedIn: true, user: {id: req.session.userId, username: req.session.username}});
    } else {
        res.status(200).json({loggedIn: false});
    }
});

// Logout route
app.post('/api/logout', (req, res) => {
    req.session.destroy(err => {
        if(err) {
            return res.status(500).json({message: 'Logout failed'});
        }
        res.clearCookie('connect.sid'); // Clear the session cookie
        res.status(200).json({message: 'Logout successful'});
    });
});

// Record a game play
app.post('/api/games/:gameName/played', async (req, res) => {
    if (!req.session.userId) {
    return res.status(401).json({ error: 'Not logged in' });
  }

  const { gameName } = req.params;
  const userId = req.session.userId;
  
  // 1. Extract both moves and score safely from req.body
  const moves = parseInt(req.body.moves, 10) || 0;
  const score = parseInt(req.body.score, 10) || 0;

  // Validate game name
  const validGames = ['tic-tac-toe', 'chess', 'sudoku', 'snake', 'memory-match'];
  if (!validGames.includes(gameName)) {
    return res.status(400).json({ error: 'Invalid game name' });
  }

  try {
    const query = `
      INSERT INTO game_stats (user_id, game_name, games_played, total_moves, max_score)
      VALUES ($1, $2, 1, $3, $4)
      ON CONFLICT (user_id, game_name) DO UPDATE SET
        games_played = game_stats.games_played + 1,
        total_moves  = game_stats.total_moves + EXCLUDED.total_moves,
        max_score    = GREATEST(game_stats.max_score, EXCLUDED.max_score)
      RETURNING *;
    `;

    const values = [userId, gameName, moves, score];
    
    // Replace 'pool' with 'db' if that is what you named your import
    const result = await pool.query(query, values);

    return res.status(200).json({
      message: 'Game stats updated successfully',
      stats: result.rows[0]
    });
  } catch (err) {
    console.error('Database error in recordGamePlay:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get game stats for the logged-in user
app.get('/api/games/stats', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not logged in' });
    }

    const userId = req.session.userId;

    try {
        const result = await pool.query(
            'SELECT game_name, games_played, total_moves FROM game_stats WHERE user_id = $1',
            [userId]
        );
        
        const  stats = result.rows.map(row => ({
            game_name: row.game_name,
            games_played: row.games_played,
            avg_moves: row.total_moves > 0 ? Math.round(row.total_moves / row.games_played).toFixed(2) : 0,
        }));

        res.status(200).json({ stats: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

// Express GET endpoint
app.get('/api/games/:gameName/stats', async (req, res) => {
  const userId = req.user?.id || req.session?.userId;
  const { gameName } = req.params;

  const result = await pool.query(
    'SELECT * FROM game_stats WHERE user_id = $1 AND game_name = $2',
    [userId, gameName]
  );

  res.json({ stats: result.rows[0] || { max_score: 0, games_played: 0 } });
});


// Serve static files for the frontend
app.use(express.static('public'));

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
}); 
// Start the server
app.listen(3000, () => {
  console.log('Server running on port 3000');
});