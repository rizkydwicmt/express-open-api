/* eslint-disable no-param-reassign */
// const genUsername = require('unique-username-generator')
const logger = require('./logger')
const constant = require('../constant/constant')

function getValue(str) {
  let sTr = str
  if (typeof sTr === 'undefined') {
    sTr = ''
  }
  if (!sTr) {
    return ''
  }
  if (sTr === null) {
    return ''
  }
  return sTr
}

function getMandatory(str) {
  let sTr = str
  if (typeof sTr === 'undefined') {
    sTr = null
  }
  if (!sTr) {
    return null
  }
  if (sTr == '') {
    return null
  }
  if (sTr === null) {
    return null
  }
  return sTr
}

function getRegistered(str) {
  let sTr = str
  if (typeof sTr === 'undefined') {
    sTr = ''
  }
  if (!sTr) {
    return ''
  }
  if (sTr === null) {
    return ''
  }
  if (constant.REGISTERED_FROM.indexOf(sTr) > -1) {
    return sTr
  }
  return sTr
}

function parseFloatIND(str) {
  if (str === null) {
    return 0
  }
  if (!str) {
    return 0
  }
  if (str === '') {
    return 0
  }
  str = str.toString()
  str = str.replace(/\./g, '')
  str = str.replace(',', '.')
  return parseFloat(str)
}

function normalisasiNoHP(nohp) {
  const nomerHP = nohp.replace(/([^0-9]+)/g, '')
  if (nomerHP.length < 7 || nomerHP.length > 15) {
    return ''
  }
  if (nomerHP.startsWith('0')) {
    return `62${nomerHP.substring(1)}`
  }
  if (nomerHP.startsWith('62')) {
    return nomerHP
  }
  if (nomerHP.startsWith('+62')) {
    return nomerHP.substring(1)
  }
  if (nomerHP.startsWith('8')) {
    return `62${nomerHP}`
  }
  return ''
}

function denormalisasiNoHP(nohp) {
  nohp = nohp.replace(/([^0-9]+)/g, '')
  if (typeof nohp === 'undefined') {
    nohp = null
  }
  if (nohp === null) {
    return null
  }
  if (nohp.length < 7 || nohp.length > 15) {
    return null
  }
  if (nohp.length > 10 || nohp.length <= 13) {
    if (nohp.startsWith('0')) {
      return nohp
    }
    if (nohp.startsWith('62')) {
      return `0${nohp.substring(2)}`
    }
    if (nohp.startsWith('+62')) {
      return `0${nohp.substring(3)}`
    }
    if (nohp.startsWith('8')) {
      return `0${nohp}`
    }
  }
  return null
}

function getIp(req) {
  let { ip } = req
  try {
    ip = this.getValue(req.headers['x-client'])
    if (ip === '') {
      ip = this.getValue(req.headers['x-forwarded-for'])
    }
    if (ip === '') {
      ip = req.ip
    }
  } catch (error) {
    logger.error(error)
  }
  return ip
}

function usernameChecker(username) {
  // const regex = new RegExp(/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){4,38}$/i)
  // const regex = new RegExp(/^[a-zA-Z0-9_-]{4,38}$/i)
  const regex = new RegExp(/^[\w](?!.*?\.{2})[\w.]{2,38}[\w]$/gm)
  if (regex.test(username)) {
    return true
  }

  return false
}

function phoneChecker(phone) {
  const reg = new RegExp(/^(0|62)8[0-9]{8,}$/gm)
  if (reg.test(phone)) {
    return true
  }

  return false
}

function numberFormat(data) {
  const val = data.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1.')
  return val
}

function expandRow(rowCount, columnCount, startAt = 0) {
  let index = startAt
  const expandrow = Array(rowCount)
    .fill(0)
    .map(
      (v) =>
        `(${Array(columnCount)
          .fill(0)
          .map((v) => `$${(index += 1)}`)
          .join(', ')})`
    )
    .join(', ')
  return expandrow
}

function flattenData(arr) {
  const newArr = []
  arr.forEach((v) => v.forEach((p) => newArr.push(p)))
  return newArr
}

function generateFromName(data) {
  let username = data.toLowerCase().replace(/\s+/g, '_')
  const randomNumber = Math.floor(Math.random() * 100)
  username = username.replace(/[\W_]+/g, randomNumber)
  username += randomNumber
  if (!usernameChecker(username)) {
    generateFromName(username)
  }
  return username
}

function emailDummy(username, nohp) {
  nohp = denormalisasiNoHP(nohp || '')
  if (nohp) {
    return `${username}${nohp}@member.viuit.com`
  } else {
    return undefined
  }
}

function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key].indexOf(value) > -1);
}

module.exports = {
  getIp,
  denormalisasiNoHP,
  normalisasiNoHP,
  parseFloatIND,
  getValue,
  usernameChecker,
  numberFormat,
  getRegistered,
  expandRow,
  flattenData,
  getMandatory,
  phoneChecker,
  emailDummy,
  getKeyByValue,
}
