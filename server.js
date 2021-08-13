const express = require('express');
const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const chalk = require('chalk');

const warning = chalk.hex('#FFA500');
const success = chalk.hex('#AEFF9E');

const log = console.log;

require('dotenv').config();

const init = async () => {
	console.clear();

	// Setup database
	const db = new Database('database.db');
	
	db.prepare('CREATE TABLE IF NOT EXISTS Accounts (ID INTEGER NOT NULL PRIMARY KEY, Username varchar(255) NOT NULL, Password varchar(255) NOT NULL)').run();
	
	db.close();
	
	// Setup server
	const app = express();
	
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(express.static('src/public'));
	
	app.get('/api', (req, res) => {
		res.json({ message: 'Welcome to the web server API' })
	});
	
	app.post('/api/register', async (req, res) => {
		const data = req.body;
		const username = data.username;
		const password = data.password;
		
		log(`User sent account creation request for account '${data.username}'`)
		
		if (!validUsername(username)){
			log(warning('User account username was not valid'));
			res.json(RegisterOpcode.INVALID_USERNAME);
			return;
		}
		
		if (!validPassword(password)){
			log(warning('User account password was not valid'));
			res.json(RegisterOpcode.INVALID_PASSWORD);
			return;
		}
		
		// Open up a connection to the database
		const db = new Database('database.db');
		
		// Check if account exists already
		const statement = db.prepare('SELECT * FROM Accounts WHERE Username=?');
		const results = statement.all(username);
		
		if (results.length != 0){
			// Account with that username exists already
			log(warning('User account username exists already'));
			res.json(RegisterOpcode.ACCOUNT_EXISTS_ALREADY);
			return;
		}
		
		// Encrypt password
		const saltRounds = 12; // 10 is weak, 12 is stronger
		bcrypt.hash(password, saltRounds, (err, hash) => {
			if (err) throw err;
			
			// Insert new account
			db.prepare('INSERT INTO Accounts (Username, Password) VALUES (?, ?)').run(username, hash);
			
			db.close();
			
			log(success(`User account '${username}' was created successfully`));
			
			res.json(RegisterOpcode.ACCOUNT_CREATED);
		});
	});
	
	app.post('/api/login', async (req, res) => {
		const data = req.body;
		const username = data.username;
		const password = data.password;
		
		log(`User sent account login request for account '${data.username}'`)
		
		if (!validUsername(username)){
			log(warning('User account username was not valid'));
			res.json({
				opcode: LoginOpcode.INVALID_USERNAME
			});
			return;
		}
		
		if (!validPassword(password)){
			log(warning('User account password was not valid'));
			res.json({
				opcode: LoginOpcode.INVALID_PASSWORD
			});
			return;
		}
		
		// Open up a connection to the database
		const db = new Database('database.db');
		
		// Check if account exists
		const statement = db.prepare('SELECT * FROM Accounts WHERE Username=?');
		const results = statement.all(username);
		
		if (results.length == 0){
			// Account with this username does not exist
			log(warning(`Accout with username ${username} does not exist`));
			res.json({
				opcode: LoginOpcode.ACCOUNT_DOES_NOT_EXIST
			});
			return;
		}
		
		// Check if passwords match
		bcrypt.compare(password, results[0].Password, (err, result) => {
			if (err) throw err;
			
			if (!result) {
				log(warning('Passwords do not match'));
				res.json({
					opcode: LoginOpcode.PASSWORDS_DO_NOT_MATCH
				});
				return;
			}
			
			db.close();
			
			jwt.sign({ user: username }, process.env.SECRET_JWT_TOKEN, (err, token) => {
				if (err) throw err;
				
				res.json({
					opcode: LoginOpcode.LOGIN_SUCCESS,
					token: token
				});
			});
		
			log(success(`User account '${username}' logged in successfully`));
		});
	});
	
	// Playing around with JWT tokens
	app.post('/api/posts', verifyToken, (req, res) => {
		jwt.verify(req.token, process.env.SECRET_JWT_TOKEN, (err, authData) => {
			
			if (err) {
				console.log('Bad token');
				res.sendStatus(403);
				return;
			}
			
		  res.json({
			  message: "Posted created..."
			})
		})
	})
	
	const port = 4000;
	app.listen(port);
	log('Listening on port ' + port);
}

const RegisterOpcode = 
{
	ACCOUNT_CREATED: 0,
	ACCOUNT_EXISTS_ALREADY: 1,
	INVALID_USERNAME: 2,
	INVALID_PASSWORD: 3
}

const LoginOpcode = 
{
	LOGIN_SUCCESS: 0,
	INVALID_USERNAME: 1,
	INVALID_PASSWORD: 2,
	ACCOUNT_DOES_NOT_EXIST: 3,
	PASSWORDS_DO_NOT_MATCH: 4
}

const validEmail = (email) => {
    if (!/^\S+@\S+$/.test(email) || email === "") {
        return false
    }
    
    if (email.length < 4 || email.length > 50) {
        return false
    }

    return true
}

const validUsername = (username) => {
    if (!/[a-zA-Z0-9_]/.test(username) || username === "") {
        return false
    }
    
    if (username.length < 2 || username.length > 20) {
        return false
    }

    return true
}

const validPassword = (password) => {
    if (password === "" || password.length < 5 || password.length > 200) {
        return false
    }

    return true
}

// Middleware
function verifyToken(req, res, next) {
	const bearerHeader = req.headers.authorization

	if (typeof bearerHeader !== "undefined") {
	  const bearer = bearerHeader.split(" ")
	  const bearerToken = bearer[1]
	  req.token = bearerToken
	  next()
	} else {
	  // Forbidden
	  res.sendStatus(403)
	}
}

init();
