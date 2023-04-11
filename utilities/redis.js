/* eslint-disable import/extensions */
const redis = require('redis')
const bluebird = require('bluebird')
const config = require('../configs/config')
const logger = require('./logger')

const configRedis = config.get('redis')

const client = bluebird.promisifyAll(redis.createClient(configRedis))

async function get(key) {
  const result = await client.getAsync(key)
  try {
    // logger.info(key)
    logger.info('Get Redis with [%s]', key)
  } catch (e) {
    logger.error('[REDIS] Error at logger catched')
  }
  return result
}

async function set(key, data, type = '', exp = '') {
  try {
    await client.setAsync(key, JSON.stringify(data), type, exp)
  } catch (error) {
    logger.error(error)
  }
}

async function setEx(key, data, type = '', exp = '') {
  try {
    await client.setAsync(key, data, type, exp)
  } catch (error) {
    logger.error(error)
  }
}

async function updateValue(key, data) {
  try {
    const t = await client.TTLAsync(key)
    await client.setAsync(key, JSON.stringify(data), 'EX', t)
  } catch (error) {
    logger.error(error)
  }
}
module.exports = {
  get,
  set,
  setEx,
  updateValue,
}
