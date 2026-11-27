import fs from "fs";
import path from "path";
import oConfig from "../../resources/config.json";

const logfile: string = oConfig.logFilePath;

export interface Uptime {
    hours: number;
    minutes: number;
    seconds: number;
}

const utility = {
    /**
     * returns a date string in UTC
     **/
    parseDateString(): string {
        return new Date().toUTCString();
    },

    /**
     * writes into a specified logfile for debugging purposes
     * now adds a fucking datestring
     **/
    writeLogFile(str: string): void {
        if (!str) return;
        this._checkDirectory(logfile);

        const sDate = this.parseDateString();

        fs.appendFile(logfile, sDate + ": " + str + "\n", (err) => {
            if (err) {
                console.log(err);
                return;
            }
            console.log("Saved logfile");
        });
    },

    /**
     * checks for a file path,
     * if it does not exists it will be created with all directories
     */
    _checkDirectory(filePath: string): void {
        const parentDirPath = path.dirname(filePath);
        if (!fs.existsSync(parentDirPath)) {
            // Create the directory if it doesn't exist
            fs.mkdirSync(parentDirPath, { recursive: true });

            console.log(`Directory '${parentDirPath}' created successfully`);
            return;
        }

        if (!fs.existsSync(filePath)) {
            // create file if it does not exist
            let defaultContent = "";
            if (filePath.endsWith(".json")) defaultContent = "[]";

            fs.writeFileSync(filePath, defaultContent, { flag: "wx" });
            console.log(`File '${filePath}' created successfully`);
            return;
        }
        console.log(`Path '${filePath}' already exists`);
    },

    /**
     * Writes into a file with stringified JSON-input
     */
    writeJSONFile<K, V>(sFile: string, oData: Map<K, V>): void {
        console.log(oData);
        this._checkDirectory(sFile);
        const sData = JSON.stringify([...oData]);
        console.log("Writing to JSON: ", sFile, "with data: ", sData);
        fs.writeFileSync(sFile, sData, "utf8");
    },

    /**
     * Reads a JSON-File and returns the parsed data
     */
    readJSONFile<K, V>(sFile: string): Map<K, V> {
        this._checkDirectory(sFile);
        const sJSON = fs.readFileSync(sFile, "utf8");
        console.log("Reading from JSON: ", sFile, "data: ", sJSON);
        return new Map<K, V>(JSON.parse(sJSON));
    },

    /**
     * returns an objects which contains passed time since started
     * in hours, minutes, seconds
     **/
    uptimeSince(oDate: Date): Uptime {
        const diff = Date.now() - oDate.getTime();

        return {
            hours: Math.floor(diff / 3.6e6),
            minutes: Math.floor((diff % 3.6e6) / 6e4),
            seconds: Math.floor((diff % 6e4) / 1000),
        };
    },

    /**
     * https://stackoverflow.com/questions/19700283/how-to-convert-time-milliseconds-to-hours-min-sec-format-in-javascript
     */
    msToTime(duration: number): Uptime {
        return {
            hours: Math.floor((duration / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((duration / (1000 * 60)) % 60),
            seconds: Math.floor((duration / 1000) % 60),
        };
    },

    /**
     * parses a date from a dd.mm.yyyy-hh:MM string
     */
    getDateFromDateString(sDate: string): Date {
        const [sDateDay, sTime] = sDate.split("-");
        const [day, month, year] = sDateDay.split(".");
        const [hour, minutes] = sTime.split(":");

        const oDate = new Date();
        oDate.setDate(Number(day));
        oDate.setMonth(Number(month));
        oDate.setFullYear(Number(year));
        oDate.setHours(Number(hour));
        oDate.setMinutes(Number(minutes));
        return oDate;
    },

    isSameUserClient(oUserA: { id: string }, oUserB: { id: string }): boolean {
        return oUserA.id === oUserB.id;
    },

    /**
     * overengineered comparison function for usernames in the johndoe#1234 schema
     *
     * no regex >:(
     *
     * its tested tho :^)
     */
    isSameUserName(sUserNameA: string | null | undefined, sUserNameB: string | null | undefined): boolean {
        const DISCORD_ID_LENGTH = 5;

        if (sUserNameA === sUserNameB) return true;
        if (!sUserNameA || !sUserNameB) return false;

        sUserNameA = sUserNameA.toLowerCase();
        sUserNameB = sUserNameB.toLowerCase();

        if (sUserNameA === sUserNameB) return true;

        if (sUserNameA.includes("#") && !sUserNameB.includes("#")) {
            const simpleUserA = sUserNameA.substring(0, sUserNameA.length - DISCORD_ID_LENGTH);

            if (simpleUserA === sUserNameB) return true;
        }

        if (!sUserNameA.includes("#") && sUserNameB.includes("#")) {
            const simpleUserB = sUserNameB.substring(0, sUserNameB.length - DISCORD_ID_LENGTH);

            if (sUserNameA === simpleUserB) return true;
        }

        return false;
    },
};

export default utility;
