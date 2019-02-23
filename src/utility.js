const fs = require('fs');
const logfile = "./logs/log.txt";

module.exports =
	{
		/**
		 * returns a date string (hh:mm:ss)
		 **/
		parseDateString: function ()
		{
			var date = new Date();
			var h = date.getHours();
			var m = date.getMinutes();
			var s = date.getSeconds();

			if (h < 10) h = "0" + h;
			if (m < 10) m = "0" + m;
			if (s < 10) s = "0" + s;
			return h + ":" + m + ":" + s;
		},

		/**
		 * writes into a specified logfile for debugging purposes
		 **/
		writeLogFile: function (str)
		{
			if (!str) return;

			fs.appendFile(logfile, str + "\n", function (err)
			{
				if (err)
				{
					return console.log(err);
				}
				console.log("saved logfile");
			});
		},

		/**
		 * Writes into a file with stringified JSON-input
		 */
		writeJSONFile: function (sFile, oData)
		{
			console.log(oData);
			var sData = JSON.stringify([...oData]);
			console.log("Writing to JSON: ", sFile, "with data: ", sData);
			fs.writeFileSync(sFile, sData, "utf8")
		},

		/**
		 * Reads a JSON-File and returns the parsed data
		 */
		readJSONFile: function (sFile)
		{
			var sJSON = fs.readFileSync(sFile);
			console.log("Reading from JSON: ", sFile, "data: ", sJSON);
			return new Map(JSON.parse(sJSON));
		},

		/**
		 * returns an objects which contains passed time since started
		 * in hours, minutes, seconds
		 **/
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
				};
			return oReturn;
		}
	};
