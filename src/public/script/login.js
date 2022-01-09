const elements = {
	username: id('username'),
	password: id('password'),
	submit: id('submit')
}

const LoginOpcode =
{
	LoginSuccess: 0,
	InvalidUsernameOrPassword: 1,
	AccountDoesNotExist: 2,
	PasswordsDoNotMatch: 3,
	InvalidToken: 4,
	TokenUsernameDoesNotMatchWithProvidedUsername: 5
}

elements.submit.addEventListener('click', () => {
	elements.username.value = elements.username.value.trim()
	sendForm();
});

const sendForm = () => {
	axios.post('/api/login', {
		Username: elements.username.value,
		Password: elements.password.value,
		From: 'Web-Client'
	}).then((response) => {
		const data = response.data;
		//const opcode = data.opcode; // exists but not being used
		const message = data.message;

		updateMessage(message)
	}).catch((error) => {
		const res = error.response
		const status = res.status

		switch (status) {
			case 405:
				updateMessage('Web server is offline')
				break;
			case 429:
				updateMessage(error.response.data)
				break;
		}
	});
}