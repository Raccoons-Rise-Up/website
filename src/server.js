const express = require('express');
const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const chalk = require('chalk');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const rateLimit = require('express-rate-limit')

const privateKey = fs.readFileSync('./private.key', 'utf8');
const publicKey = fs.readFileSync('./public.key', 'utf8');

const warning = chalk.hex('#FFA500');
const success = chalk.hex('#AEFF9E');

const log = console.log;

require('dotenv').config();

const jwtOptions = {
	iss: 'Kittens Rise Up',
	aud: 'localhost:4000',
	sub: 'Game Client',
	exp: '30m',
	alg: 'RS256'
}

const init = async () => {
	console.clear();

	// Setup database
	const db = new Database('database.db');

	db.prepare('CREATE TABLE IF NOT EXISTS Accounts (ID INTEGER NOT NULL PRIMARY KEY, Username varchar(255) NOT NULL, Password varchar(255) NOT NULL)').run();

	db.close();

	// Setup server
	const app = express();

	app.use(express.urlencoded({ extended: true }))
	app.use(express.json())
	app.use(cors({ origin: 'localhost:4000', credentials: true }));
	app.use(cookieParser());
	app.use(express.static('./public'))
	app.use('/api', rateLimit({
		windowMs: 1 * 60 * 1000,
		max: 10,
		message: 'Please wait a bit before making another request'
	}))

	app.get('/api', (req, res) => {
		res.json({ message: 'Welcome to the web server API' })
	});

	app.post('/api/register', async (req, res) => {
		const data = req.body;
		let username = data.Username;
		const password = data.Password;

		username = username.trim()

		log(`User sent account creation request for account '${username}'`)

		if (!validUsername(username)) {
			const message = 'User account username was not valid'
			log(warning(message));
			res.json({ 
				Opcode: RegisterOpcode.InvalidUserNameOrPassword,
				Message: message
			});
			return;
		}

		if (!validPassword(password)) {
			const message = 'User account password was not valid'
			log(warning(message));
			res.json({ 
				Opcode: RegisterOpcode.InvalidUserNameOrPassword,
				Message: message
			});
			return;
		}

		// Open up a connection to the database
		const db = new Database('database.db');

		// Check if account exists already
		const statement = db.prepare('SELECT * FROM Accounts WHERE Username=?');
		const results = statement.all(username);

		if (results.length != 0) {
			// Account with that username exists already
			const message = 'User account username exists already'
			log(warning(message));
			res.json({ 
				Opcode: RegisterOpcode.AccountExistsAlready,
				Message: message
			});
			return;
		}

		// Encrypt password
		const saltRounds = 12; // 10 is weak, 12 is stronger
		bcrypt.hash(password, saltRounds, (err, hash) => {
			if (err) throw err;

			// Insert new account
			db.prepare('INSERT INTO Accounts (Username, Password) VALUES (?, ?)').run(username, hash);

			db.close();

			jwtSend(res, username, password, 'Register')

			log(success(`User account '${username}' was created successfully`));
		});
	});

	app.post('/api/login', async (req, res) => {
		const data = req.body;
		
		console.log(data)
		
		let username = data.Username;
		const password = data.Password;
		let token = ''
		
		if (data.Token != null)
			token = data.Token // from game client
		else
			token = req.cookies.token // from web server
		
		// JWT was provided
		if (token != null)
		{
			if (jwtVerify(token)) {
				const message = `User account logged in with existing JWT`
				log(success(message));
				res.json({
					Opcode: LoginOpcode.LoginSuccess,
					Message: message
				});
				
				// TODO: Send user to different page on successful login
				return
			} else {
				const message = 'User account failed to log in with existing JWT'
				log(warning(message))
				res.json({
					Opcode: LoginOpcode.InvalidToken,
					Message: message
				})
				return
			}
		}
		
		if (username == undefined) {
			const message = 'User account username was not valid'
			log(warning(message));
			res.json({
				Opcode: LoginOpcode.InvalidUsernameOrPassword,
				Message: message
			});
			return
		}

		username = username.trim()

		log(`User account '${username}' sent login request`)

		if (!validUsername(username)) {
			const message = 'User account username was not valid'
			log(warning(message));
			res.json({
				Opcode: LoginOpcode.InvalidUsernameOrPassword,
				Message: message
			});
			return;
		}

		if (!validPassword(password)) {
			const message = 'User account password was not valid'
			log(warning(message));
			res.json({
				Opcode: LoginOpcode.InvalidUsernameOrPassword,
				Message: message
			});
			return;
		}

		// Open up a connection to the database
		const db = new Database('database.db');

		// Check if account exists
		const statement = db.prepare('SELECT * FROM Accounts WHERE Username=?');
		const results = statement.all(username);

		if (results.length == 0) {
			// Account with this username does not exist
			const message = `Accout with username ${username} does not exist`
			log(warning(message));
			res.json({
				Opcode: LoginOpcode.AccountDoesNotExist,
				Message: message
			});
			return;
		}

		bcrypt.compare(password, results[0].Password, (err, result) => {
			if (err) throw err;

			if (!result) {
				const message = 'Passwords do not match'
				log(warning(message));
				res.json({
					Opcode: LoginOpcode.PasswordsDoNotMatch,
					Message: message
				});
				return;
			}

			db.close();

			// Send JWT token
			jwtSend(res, username, password, 'Login', data.From)

			log(success(`User account '${username}' logged in with new JWT`));
			
			// TODO: Send user to different page on successful login
		});
	});

	const port = 4000;
	app.listen(port);
	log('Listening on port ' + port);
}

const RegisterOpcode =
{
	AccountCreated: 0,
	AccountExistsAlready: 1,
	InvalidUserNameOrPassword: 2
}

const LoginOpcode =
{
	LoginSuccess: 0,
	InvalidUsernameOrPassword: 1,
	AccountDoesNotExist: 2,
	PasswordsDoNotMatch: 3,
	InvalidToken: 4
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

function jwtSend(res, username, password, type, from) {
	const signOptions = {
		issuer: jwtOptions.iss,
		subject: jwtOptions.sub,
		audience: jwtOptions.aud,
		expiresIn: jwtOptions.exp,
		algorithm: jwtOptions.alg
	}

	const token = jwt.sign({ username: username, password: password }, privateKey, signOptions);

	let opcode = RegisterOpcode.AccountCreated
	let message = ''

	switch (type)
	{
		case 'Register':
			opcode = RegisterOpcode.AccountCreated
			message = 'Account created successfully'
			break
		case 'Login':
			opcode = LoginOpcode.LoginSuccess
			message = 'Login was successful'
			break
	}
	
	if (from == 'Godot-Client')
	{
		res.json({
			opcode: opcode,
			message: message,
			token: token
		})
	}

	if (from == 'Web-Client')
	{
		res
			.status(202)
			.cookie('token', token, {
				sameSite: 'strict',
				path: '/',
				expires: new Date(new Date().getTime() + 30 * 60 * 1000),
				httpOnly: true,
				secure: true
			}).send({
				opcode: opcode,
				message: message
			})
	}
	
}

function jwtVerify(token) {
	const verifyOptions = {
		issuer: jwtOptions.iss,
		subject: jwtOptions.sub,
		audience: jwtOptions.aud,
		maxAge: jwtOptions.exp,
		algorithm: jwtOptions.alg
	}

	try {
		return jwt.verify(token, publicKey, verifyOptions)
	} catch (err) {
		if (err.name == 'TokenExpiredError') {
			console.log(`JWT Token expired ${msToTime(new Date().getTime() - err.expiredAt)} ago`);
		}

		if (err.name == 'JsonWebTokenError') {
			console.log(`JWT Json Web Token Error: ${err.message}`);
		}

		if (err.name == 'NotBeforeError') {
			console.log(err.message);
		}

		return null
	}
}

function msToTime(ms) {
	let seconds = (ms / 1000).toFixed(1);
	let minutes = (ms / (1000 * 60)).toFixed(1);
	let hours = (ms / (1000 * 60 * 60)).toFixed(1);
	let days = (ms / (1000 * 60 * 60 * 24)).toFixed(1);
	if (seconds < 60) return seconds + " Sec";
	else if (minutes < 60) return minutes + " Min";
	else if (hours < 24) return hours + " Hrs";
	else return days + " Days"
}

init();
