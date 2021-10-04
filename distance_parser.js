export function timeInputToSeconds(input) {
    var pattern = /(\d+)(d|h|m)/g;
    var multiplier = {
        d: 86400,
        h: 3600,
        m: 60,
    };

    var timespan = 0;
    var match;

    // Apply each matched magnitude-unit combination to the running total.
    while (match = pattern.exec(input)) {

        var magnitude = match[1];
        var unit = match[2];

        timespan += (magnitude * multiplier[unit]);

    }

    return (timespan);
}


export function secondsToTimeObject(inputSeconds) {
    const secondsInAMinute = 60;
    const secondsInAnHour = 60 * secondsInAMinute;
    const secondsInADay = 24 * secondsInAnHour;

    // extract days
    const days = Math.floor(inputSeconds / secondsInADay);

    // extract hours
    const hourSeconds = inputSeconds % secondsInADay;
    const hours = Math.floor(hourSeconds / secondsInAnHour);

    // extract minutes
    const minuteSeconds = hourSeconds % secondsInAnHour;
    const minutes = Math.floor(minuteSeconds / secondsInAMinute);

    // return the final array
    const obj = {
        'd': days,
        'h': hours,
        'm': minutes,
    };

    return obj;
}

export function secondsToTimeString(inputSeconds) {
    const timeObj = secondsToTimeObject(inputSeconds);

    var timeString = "";

    if (timeObj.d) {
        timeString += (timeObj.d === 1 ? (timeObj.d + " Tag ") : (timeObj.d + " Tagen "));
    }

    if (timeObj.h) {
        timeString += (timeObj.h === 1 ? (timeObj.h + " Stunde ") : (timeObj.h + " Stunden "));
    }

    if (timeObj.m) {
        timeString += (timeObj.m === 1 ? (timeObj.m + " Minute ") : (timeObj.m + " Minuten "));
    }

    return timeString;
}