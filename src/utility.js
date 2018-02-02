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
    * reads a motionvalue file and parses the data
    * into an array
    **/
		readWeaponMVfile: function (sPath)
		{

			console.log("-------READING MV FILE " + sPath + "--------");
			const s = fs.readFileSync(sPath, "utf8");

			var ret = s.split('#');

			for (var i = 0; i < ret.length; i++)
			{
				if (ret[i] !== undefined)
				{
					ret[i] = ret[i].split(";");
					ret[i][0] = ret[i][0].replace("\n", "");
					ret[i][0] = ret[i][0].replace("\r", "");
					if (ret[i][1] !== undefined)
					{
						ret[i][1] = ret[i][1].split(',');
					}
				}
			}
			ret.pop();
			return ret;
		},

    /**
    * reads a file containing weapon data
    **/
		readWeaponListFile: function (sPath)
		{
			console.log("-------READING WEAPON LIST" + sPath + "--------");
			const s = fs.readFileSync(sPath, "utf8");

			var ret = s.split("#");
			ret.pop();

			return ret;
		},

    /**
    * reads a file containing monster hitzones
    **/
		readMonsterListFile: function (sPath)
		{
			console.log("-------READING MONSTER LIST" + sPath + "--------");
			const s = fs.readFileSync(sPath, "utf8");

			var ret = s.split('#');

			for (var i = 0; i < ret.length; i++)
			{
				ret[i] = ret[i].split(";");
				ret[i][0] = ret[i][0].replace("\n", "");
				ret[i][0] = ret[i][0].replace("\r", "");
			}

			ret.pop();
			return ret;
		},

    /**
    * reads a file containing all monster names
    **/
		readMonsterNameFile: function (sPath)
		{
			console.log("-------READING MONSTER NAMES" + sPath + "--------");
			const s = fs.readFileSync(sPath, "utf8");

			var ret = s.split('#');

			for (i = 0; i < ret.length; i++)
			{
				ret[i] = ret[i].replace("\n", "");
				ret[i] = ret[i].replace("\r", "");
			}

			ret.pop();
			return ret;
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
	*
	**/
		genericWriteToFile: function (sFile, sLine)
		{
			fs.appendFile(sFile, sLine + "\n", function (err)
			{
				if (err)
				{
				return console.log(err);
				}
			});
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
				}
			return oReturn;
		}
	};
