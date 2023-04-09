export const getDaysAfter = (days: number) => {
    const time = Date.now() + DAY * days;
    return new Date(time);
}

const HOUR = 1000 * 60 * 60;
const DAY = HOUR * 24;