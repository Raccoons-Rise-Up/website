const elements = {
	username: id('username'),
	password: id('password'),
	submit: id('submit')
}

const RegisterOpcode =
{
	AccountCreated: 0,
	AccountExistsAlready: 1,
	InvalidUsernameOrPassword: 2
}

elements.submit.addEventListener('click', () => {
	elements.username.value = elements.username.value.trim()
	sendForm();
});

const sendForm = () => {
	axios.post('/api/register', {
		username: elements.username.value,
		password: elements.password.value,
		from: 'Web-Client'
	}, { withCredentials: true }).then((response) => {
		const data = response.data;
		const opcode = data.opcode;
		const message = data.message;

		switch(opcode)
		{
			case RegisterOpcode.AccountExistsAlready:
			case RegisterOpcode.InvalidUsernameOrPassword:
			case RegisterOpcode.AccountCreated:
				updateMessage(message);
				break;
		}
	}).catch((error) => {
		const res = error.response
		const status = res.status

		switch (status)
		{
			case 405:
				updateMessage('Web server is offline')
				break;
			case 429:
				updateMessage(error.response.data)
				break;
		}
	});
}