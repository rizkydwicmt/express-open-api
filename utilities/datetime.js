const dayjs = require('moment')

const FMT_DATE_TIME_YMDHMS = 'YYYY-MM-DD HH:mm:ss'
const FMT_DATE_TIME_YMDHMSU = 'YYYY-MM-DD HH:mm:ss.SSS'
const TODAY = 'YYYY-MM-DD'
const TIME = 'HH:mm:ss'
const SFD = `YYYYMMDDTHHmmss`

function now(microtime, unixParam = false) {
  const timestamp = dayjs().format(microtime ? FMT_DATE_TIME_YMDHMSU : FMT_DATE_TIME_YMDHMS)
  const numberTimestamp = dayjs(timestamp).unix()
  return unixParam == true ? numberTimestamp : timestamp
}

function tomorrow(day, microtime) {
  return dayjs()
    .add(day, 'day')
    .format(microtime ? FMT_DATE_TIME_YMDHMSU : FMT_DATE_TIME_YMDHMS)
}

function expandDate(date, expandDay, microtime) {
  return dayjs(date)
    .add(expandDay, 'day')
    .format(microtime ? FMT_DATE_TIME_YMDHMSU : FMT_DATE_TIME_YMDHMS)
}

function normalDate(date, microtime) {
  return dayjs(date).format(microtime ? FMT_DATE_TIME_YMDHMSU : FMT_DATE_TIME_YMDHMS)
}

function todayDate() {
  return dayjs().format(TODAY)
}

function rangeDate(day) {
  return dayjs().subtract(day, 'day').format(TODAY)
}

function hoursNow() {
  return dayjs().format(TIME)
}

function expireDate(day, microtime) {
  return dayjs()
    .subtract(day, 'day')
    .format(microtime ? FMT_DATE_TIME_YMDHMSU : FMT_DATE_TIME_YMDHMS)
}

function sfd() {
  return `${dayjs().add(-7, 'hour').format(SFD)}Z`
}

module.exports = {
  now,
  tomorrow,
  expandDate,
  normalDate,
  todayDate,
  expireDate,
  hoursNow,
  rangeDate,
  sfd,
}
