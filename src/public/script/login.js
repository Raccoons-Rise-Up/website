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
		
		if (opcode == LoginOpcode.ACCOUNT_DOES_NOT_EXIST)
		{
			console.log('Server responded with ACCOUNT_DOES_NOT_EXIST');
			updateMessage(`Account '${elements.username.value}' does not exist!`);
			return;
		}
		
		if (opcode == LoginOpcode.INVALID_USERNAME)
		{
			console.log('Server responoded with INVALID_USERNAME');
			updateMessage('Username is invalid!');
			return;
		}
		
		if (opcode == LoginOpcode.INVALID_PASSWORD)
		{
			console.log('Server responded with INVALID_PASSWORD');
			updateMessage('Password is invalid!');
			return;
		}
		
		if (opcode == LoginOpcode.PASSWORDS_DO_NOT_MATCH)
		{
			console.log('Server responded with PASSWORDS_DO_NOT_MATCH');
			updateMessage('Passwords do not match!');
			return;
		}
		
		if (opcode == LoginOpcode.LOGIN_SUCCESS)
		{
			console.log('Server responded with LOGIN_SUCCESS');
			
			token = data.token;
			
			updateMessage('Login success!');
			
			/*axios.post('/api/posts', {
				test: 'some data'
			},
			{
				headers: {
					'Authorization': `Basic badtoken`
				}
			}).then((response) => {
				console.log(response);
			}).catch((error) => {
				console.log(error);
			});*/
			
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