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

// Start the server
app.listen(3000, () => {
  console.log('Server running on port 3000');
});