const handleError = (err, req, res, next) => {
    res.status(err.statusCode || 500).json({ message: err.message || "server error" })
}
module.exports = handleError