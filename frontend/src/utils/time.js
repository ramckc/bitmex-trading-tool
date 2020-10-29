export function areTimesEqual(time1, time2, interval) {
    if (!time1 || !time2) return false;
    
    switch (interval) {
        case '1d':
            return compare1h(time1, time2);
        case '1h':
            return compare1h(time1, time2);
        case '5m':
            return compare5m(time1, time2);
        case '1m':
        default:
            return compare1m(time1, time2);
    }
    
}

function compare1m(time1, time2) {
    time1 = new Date(
        time1.getFullYear(), time1.getMonth(), time1.getDate(),
        time1.getHours(), time1.getMinutes(), 0
    );

    time2 = new Date(
        time2.getFullYear(), time2.getMonth(), time2.getDate(),
        time2.getHours(), time2.getMinutes(), 0
    );

    return time1.getTime() === time2.getTime();
}

function compare5m(time1, time2) {
    time1 = new Date(
        time1.getFullYear(), time1.getMonth(), time1.getDate(),
        time1.getHours(), 0, 0
    );

    time2 = new Date(
        time2.getFullYear(), time2.getMonth(), time2.getDate(),
        time2.getHours(), 0, 0
    );

    const minutesElapsed = time1.getMinutes() - time2.getMinutes();

    return time1.getTime() === time2.getTime() && minutesElapsed < 5;
}

function compare1h(time1, time2) {
    time1 = new Date(
        time1.getFullYear(), time1.getMonth(), time1.getDate(),
        time1.getHours(), 0, 0
    );

    time2 = new Date(
        time2.getFullYear(), time2.getMonth(), time2.getDate(),
        time2.getHours(), 0, 0
    );

    return time1.getTime() === time2.getTime();
}

function compare1d(time1, time2) {
    time1 = new Date(
        time1.getFullYear(), time1.getMonth(), time1.getDate(),
        0, 0, 0
    );

    time2 = new Date(
        time2.getFullYear(), time2.getMonth(), time2.getDate(),
        0, 0, 0
    );

    return time1.getTime() === time2.getTime();
}