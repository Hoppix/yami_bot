const fs = require('fs');
const file = "./logs/log.txt";

module.exports =
	{
		parseDateString: function ()
		{
			var date = new Date();
			var h = date.getHours();
			var m = date.getMinutes();
			var s = date.getSeconds();

			if (h < 10) h = "0" + h;
			if (m < 10) h = "0" + m;
			if (s < 10) h = "0" + s;
			return h + ":" + m + ":" + s;
		},

		writeLogFile: function (str)
		{
			if (!str) return;

			fs.appendFile(file, str + "\n", function (err)
			{
				if (err)
				{
					return console.log(err);
				}
				console.log("saved logfile");
			});
		},

		uptimeSince: function (oDate)
		{
			var rDate = new Date();
			var diff = rDate - oDate;

			var hours = Math.floor(diff / 3.6e6);
			var minutes = Math.floor((diff % 3.6e6) / 6e4);
			var seconds = Math.floor((diff % 6e4) / 1000);

			var oReturn =
				{
					hours: hours,
					minutes: minutes,
					seconds: seconds
				}
			return oReturn;
		}
	};
