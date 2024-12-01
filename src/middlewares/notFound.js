const handleNotFound = (req, res) => {
    res.status(404).json({ message: "Path not Found" })
}
module.exports = handleNotFound