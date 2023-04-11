const axios = require("axios")
const logger = require('./logger')

async function doGet(url, payload = {}, headers = undefined) {
  const request = {
    method: 'GET',
    url: url,
    timeout: 1000 * 60, // Wait for 1 minute
    headers: headers || {
      'Accept': '*/*',
      'Content-Type': 'application/json',
    },
    params: payload
  }

  const response = await axios(request)
    .then((response) => {
      return {
        data: response.data,
        status: response.status,
        rc: '00'
      }
    })
    .catch((error) => {
      logger.error('hit api err ' + error.response?.data || error.message || error)
      if (typeof error.response?.data  === 'object') {
        return {
          data: error.response?.data,
          status: error.response?.status,
          rc: 'X1'
        }
      }

      return {
        data: {
          rc: error.response?.status || error.status || 500,
          rd: 'Tidak dapat terhubung ke penyedia layanan',
          data: {}
        },
        status: error.response?.status || error.status || 500,
        rc: 'X2'
      }
    })

  return response
}

async function doPost(url, payload = {}, headers = undefined) {
  const request = {
    method: 'POST',
    url: url,
    timeout: 1000 * 60, // Wait for 1 minute
    headers: headers || {
      'Accept': '*/*',
      'Content-Type': 'application/json',
    },
    data: payload
  }
  console.log(request)

  const response = await axios(request)
    .then((response) => {
      return {
        data: response.data,
        status: response.status,
        rc: '00'
      }
    })
    .catch((error) => {
      logger.error('hit api err ' + error.response?.data || error.message || error)
      if (typeof error.response?.data  === 'object') {
        return {
          data: error.response?.data,
          status: error.response?.status,
          rc: 'X1'
        }
      }

      return {
        data: {
          rc: error.response?.status || error.status || 500,
          rd: 'Tidak dapat terhubung ke penyedia layanan',
          data: {}
        },
        status: error.response?.status || error.status || 500,
        rc: 'X2'
      }
    })

  return response
}

module.exports = {
  doGet,
  doPost,
}