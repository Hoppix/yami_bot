const fs = require('fs');
const path = require('path');
const oConfig = require("../../resources/config.json")

const logfile = oConfig.logFilePath;

module.exports = {
    /**
     * returns a date string in UTC
     **/
    parseDateString: function () {
        var date = new Date();
        return date.toUTCString();
    },

    /**
     * writes into a specified logfile for debugging purposes
     * now adds a fucking datestring
     **/
    writeLogFile: function (str) {
        if (!str) return;
        this._checkDirectory(logfile)

        var sDate = this.parseDateString();

        fs.appendFile(logfile, sDate + ": " + str + "\n", function (err) {
            if (err) {
                return console.log(err);
            }
            console.log("Saved logfile");
        });
    },

    /**
     * checks for a file path, 
     * if it does not exists it will be created with all directories
     * 
     * @param {string} path 
     */
    _checkDirectory: async function (filePath) {
        const parentDirPath = path.dirname(filePath);
        if (!fs.existsSync(parentDirPath)) {
            // Create the directory if it doesn't exist
            fs.mkdirSync(parentDirPath, { recursive: true });

            console.log(`Directory '${parentDirPath}' created successfully`);
            return;
        }

        if(!fs.existsSync(filePath)) {
            // create file if it does not exist
            let defaultContent = "";
            if(filePath.endsWith(".json")) defaultContent = "[]"

            fs.writeFileSync(filePath, defaultContent, { flag: 'wx' });
            console.log(`File '${filePath}' created successfully`);
            return;
        }
        console.log(`Path '${filePath}' already exists`);    
    },

    /**
     * Writes into a file with stringified JSON-input
     */
    writeJSONFile: function (sFile, oData) {
        console.log(oData);
        this._checkDirectory(sFile);
        var sData = JSON.stringify([...oData]);
        console.log("Writing to JSON: ", sFile, "with data: ", sData);
        fs.writeFileSync(sFile, sData, "utf8")
    },

    /**
     * Reads a JSON-File and returns the parsed data
     */
    readJSONFile: function (sFile) {
        this._checkDirectory(sFile);
        var sJSON = fs.readFileSync(sFile);
        console.log("Reading from JSON: ", sFile, "data: ", sJSON);
        return new Map(JSON.parse(sJSON));
    },

    /**
     * returns an objects which contains passed time since started
     * in hours, minutes, seconds
     **/
    uptimeSince: function (oDate) {
        var rDate = new Date();
        var diff = rDate - oDate;

        var hours = Math.floor(diff / 3.6e6);
        var minutes = Math.floor((diff % 3.6e6) / 6e4);
        var seconds = Math.floor((diff % 6e4) / 1000);

        var oReturn = {
            hours: hours,
            minutes: minutes,
            seconds: seconds
        };
        return oReturn;
    },


    /**
     * https://stackoverflow.com/questions/19700283/how-to-convert-time-milliseconds-to-hours-min-sec-format-in-javascript
     * @param duration
     * @returns {object}
     */
    msToTime: function (duration) {
        var milliseconds = parseInt((duration % 1000) / 100),
            seconds = Math.floor((duration / 1000) % 60),
            minutes = Math.floor((duration / (1000 * 60)) % 60),
            hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

        //hours = (hours < 10) ? "0" + hours : hours;
        //minutes = (minutes < 10) ? "0" + minutes : minutes;
        //seconds = (seconds < 10) ? "0" + seconds : seconds;

        return {
            hours: hours,
            minutes: minutes,
            seconds: seconds
        };
    },

    /**
     *
     * parses a date from a dd.mm.yyyy-hh:MM string
     * @param sDate
     * @returns {Date}
     * @private
     */
    getDateFromDateString: function (sDate) {
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
    },

    /**
     *
     * @param oUserA
     * @param oUserB
     * @returns {boolean}
     */
    isSameUserClient: function (oUserA, oUserB) {
        return oUserA.id === oUserB.id;
    }
};
