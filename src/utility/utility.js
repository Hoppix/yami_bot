import { appendFile, existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { dirname } from 'path';
import { logFilePath } from "../../resources/config.json";

const logfile = logFilePath;

export function parseDateString() {
    var date = new Date();
    return date.toUTCString();
}
export function writeLogFile(str) {
    if (!str)
        return;
    this._checkDirectory(logfile);

    var sDate = this.parseDateString();

    appendFile(logfile, sDate + ": " + str + "\n", function(err) {
        if (err) {
            return console.log(err);
        }
        console.log("Saved logfile");
    });
}
export async function _checkDirectory(filePath) {
    const parentDirPath = dirname(filePath);
    if (!existsSync(parentDirPath)) {
        // Create the directory if it doesn't exist
        mkdirSync(parentDirPath, { recursive: true });

        console.log(`Directory '${parentDirPath}' created successfully`);
        return;
    }

    if (!existsSync(filePath)) {
        // create file if it does not exist
        let defaultContent = "";
        if (filePath.endsWith(".json"))
            defaultContent = "[]";

        writeFileSync(filePath, defaultContent, { flag: 'wx' });
        console.log(`File '${filePath}' created successfully`);
        return;
    }
    console.log(`Path '${filePath}' already exists`);
}
export function writeJSONFile(sFile, oData) {
    console.log(oData);
    this._checkDirectory(sFile);
    var sData = JSON.stringify([...oData]);
    console.log("Writing to JSON: ", sFile, "with data: ", sData);
    writeFileSync(sFile, sData, "utf8");
}
export function readJSONFile(sFile) {
    this._checkDirectory(sFile);
    var sJSON = readFileSync(sFile);
    console.log("Reading from JSON: ", sFile, "data: ", sJSON);
    return new Map(JSON.parse(sJSON));
}
export function uptimeSince(oDate) {
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
}
export function msToTime(duration) {
    var milliseconds = parseInt((duration % 1000) / 100), seconds = Math.floor((duration / 1000) % 60), minutes = Math.floor((duration / (1000 * 60)) % 60), hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

    return {
        hours: hours,
        minutes: minutes,
        seconds: seconds
    };
}
export function getDateFromDateString(sDate) {
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
}
export function isSameUserClient(oUserA, oUserB) {
    return oUserA.id === oUserB.id;
}
export function isSameUserName(sUserNameA, sUserNameB) {

    const DISCORD_ID_LENGTH = 5;

    if (sUserNameA === sUserNameB)
        return true;
    if (!sUserNameA || !sUserNameB)
        return false;

    sUserNameA = sUserNameA.toLowerCase();
    sUserNameB = sUserNameB.toLowerCase();

    if (sUserNameA === sUserNameB)
        return true;


    if (sUserNameA.includes("#") && !sUserNameB.includes("#")) {
        let simpleUserA = sUserNameA.substring(0, sUserNameA.length - DISCORD_ID_LENGTH);

        if (simpleUserA === sUserNameB)
            return true;
    }

    if (!sUserNameA.includes("#") && sUserNameB.includes("#")) {
        let simpleUserB = sUserNameB.substring(0, sUserNameB.length - DISCORD_ID_LENGTH);

        if (sUserNameA === simpleUserB)
            return true;
    }

    return false;
}
