// Build express.js server and connect to postgres database
const express = require('express');
const pool = require('./db');
const bcrypt = require('bcrypt');

const app = express();
app.use(express.json());


// Signup route
app.post('/api/signup', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if( !username || !password ) {
        return res.status(400).json({ message: 'Username and password are required' });
    }
    
    try {
        // Check if the username already exists
        const userCheck = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the new user into the database
        await pool.query('INSERT INTO users (username, password_hash) VALUES ($1, $2)', [username, hashedPassword]);

        res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }   

    
});

// Login route
app.post('/api/login', async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if it's valid
  if(!username || !password) {
    return res.status(400).json({message: 'Username and password are required'});
  }

  try {
    // Find the user by name
    const userCheck = await pool.query('Select * FROM users WHERE username = $1', [username]);

    if(userCheck.rows.length == 0) {
        return res.status(400).json({message: 'Invalid username or password'});
    }

    const user = userCheck.rows[0];

    // Compare password

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    
    if(!passwordMatch){
        return res.status(400).json({message: 'Invalid username or password'});
    }

    res.status(200).json({message: 'Login successful', user: {id: user.id, username: user.username} });


  } catch(err){
    console.error(err);
    res.status(500).json({message: 'Server error'});

  }
});

// Start the server
app.listen(3000, () => {
  console.log('Server running on port 3000');
});