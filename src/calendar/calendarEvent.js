const methods = calendarEvent.prototype;

/**
 * Object instance of a Calendar Event
 * @param sDate
 * @param sName
 * @param sId
 * @param oMessage
 */
function calendarEvent(sDate, sName, sId, oMessage)
{
	this._aMembers = [];
	this._oDate = this._getDateFromDateString(sDate);
	this._sName = sName;
	this._sId = sId;
	this._oMessage = oMessage;
}

/**
 *
 * @returns {String}
 */
methods.getId = function()
{
	return this._sId;
};

/**
 *
 * @param oUser
 * @returns {Number}
 */
methods.addMember = function(oUser)
{
	for(let i = 0; i < this._aMembers.length; i++)
	{
		if(this._aMembers[i].id === oUser.id)
		{
			return -1;
		}
	}
	this._aMembers.push(oUser);
};

/**
 *
 * @param oUser
 * @returns {boolean}
 */
methods.isMember = function(oUser)
{
	for(let i = 0; i < this._aMembers.length; i++)
	{
		if(this._aMembers[i].id === oUser.id)
		{
			return true;
		}
	}
	return false;
};

/**
 *
 * @param sUserHandle
 * @returns {Array.<*>}
 */
methods.removeMember = function(oUser)
{
	for (let i = 0; i < this._aMembers.length; i++)
	{
		if(this._aMembers[i].id === oUser.id)
		{
			this._aMembers.splice(i, 1);
		}
	}
};

/**
 *
 * @returns {Array}
 */
methods.getMembers = function()
{
	return this._aMembers;
};

/**
 *
 * @returns {String}
 */
methods.getName = function()
{
	return this._sName;
};

/**
 *
 * @param sName
 */
methods.setName = function(sName)
{
	this._sName = sName;
};

/**
 *
 * @returns {Date}
 */
methods.getDate = function()
{
	return this._oDate
};

/**
 *
 * @param oDate
 */
methods.setDate = function(sDate)
{
	this._oDate = this._getDateFromDateString(sDate);
};

/**
 *
 * @returns {*}
 */
methods.getMessage = function()
{
	return this._oMessage;
};

/**
 *
 * @returns {string}
 */
methods.toString = function()
{
	return this._sName + "-" + this._sId;
};

/**
 *
 * parses a date from a dd.mm.yyyy-hh:MM string
 *
 * from oUtility
 *
 * @param sDate
 * @returns {Date}
 * @private
 */
methods._getDateFromDateString = function(sDate)
{
	const sDateDay = sDate.split("-")[0];
	const sTime = sDate.split("-")[1];

	const day = sDateDay.split(".")[0];
	const month = sDateDay.split(".")[1];
	const year = sDateDay.split(".")[2];

	const hour = sTime.split(":")[0];
	const minutes = sTime.split(":")[1];

	var oDate = new Date();
	oDate.setDate(day);
	oDate.setMonth(month);
	oDate.setFullYear(year);
	oDate.setHours(hour);
	oDate.setMinutes(minutes);
	return oDate;
};

module.exports = calendarEvent;