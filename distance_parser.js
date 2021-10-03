export function parseTimespan(input) {
    // CAUTION: On its own, this pattern does not require the input to only
    // contain tokens that can be matched by this pattern. Depending on how hard
    // you squint, this can be a good or bad thing.
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


export function secondsToTime(inputSeconds) {
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