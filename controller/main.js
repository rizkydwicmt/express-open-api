async function checkHealth(req, res, next) {
  res.locals = {
    status: 200,
    response: {
      mid: res.locals.response.mid,
      rd: 'server online',
      data: null,
    }
  }
  next();
}

module.exports = {
	checkHealth,
}