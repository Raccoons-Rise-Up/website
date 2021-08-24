const elements = {
	username: id('username'),
	password: id('password'),
	submit: id('submit')
}

const LoginOpcode = 
{
	LOGIN_SUCCESS: 0,
	INVALID_USERNAME: 1,
	INVALID_PASSWORD: 2,
	ACCOUNT_DOES_NOT_EXIST: 3,
	PASSWORDS_DO_NOT_MATCH: 4
}

let token = ''

const sendForm = () => {
	console.log('Sending login request to server...');
	
	axios.post('/api/login', {
		username: elements.username.value,
		password: elements.password.value
	}).then((response) => {
		const data = response.data;
		const opcode = data.opcode;

		if (opcode == LoginOpcode.LOGIN_SUCCESS)
		{
			console.log('Server responded with LOGIN_SUCCESS');
			token = data.token;
			updateMessage('Login success!');
			
			return;
		}
		
		
		else if (opcode == LoginOpcode.INVALID_USERNAME || LoginOpcode.INVALID_PASSWORD || LoginOpcode.ACCOUNT_DOES_NOT_EXIST)
		{
			console.log('Server responoded with INVALID_USERNAME');
			updateMessage('Invalid username or password!');
			return;
		}
		
		
		else if (opcode == LoginOpcode.PASSWORDS_DO_NOT_MATCH)
		{
			console.log('Server responded with PASSWORDS_DO_NOT_MATCH');
			updateMessage('Passwords do not match!');
			return;
		}
		
	}).catch((error) => {
		console.log(error);
	});
}

elements.submit.addEventListener('click', () => {
	if (!validUsername(elements.username))
		return;
	
	if (!validPassword(elements.password))
		return;
	
	sendForm();
});
