import moment from 'moment';

const RECURRENCE_THRESHOLD = 4;

const daysBetweenDates = (date1, date2) => {
    let date = moment(date1);
    return  Math.abs(date.diff(date2, 'days'));
};

const recurrencePeriodDifference = (currentDays, existingDays) => {
    return Math.abs(currentDays - existingDays) <= RECURRENCE_THRESHOLD;
};

const avgRecurrencePeriod = (existingRecurrencePeriod, currentRecurrencePeriod) => {
    if (existingRecurrencePeriod === 0) {
        return currentRecurrencePeriod;
    }
  return Math.round(((existingRecurrencePeriod + currentRecurrencePeriod)/2));
};
const nextRecuuringDate = (existinDate, averageRecurrencePeriod) => {
  return moment(existinDate).add('days', averageRecurrencePeriod);

};

export default {
    daysBetweenDates,
    recurrencePeriodDifference,
    avgRecurrencePeriod,
    nextRecuuringDate
}