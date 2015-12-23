//Define utility functions here
var utility = function ()
{
	this.getParseOptions = function()
	{
		var options =
		{
			host: 'localhost',
			port: 442,
			path: '',
			method: 'post',
			headers:
			{
				'Content-Type': 'application/json'
			}
		};

		return options;
	}
};

module.exports = utility;