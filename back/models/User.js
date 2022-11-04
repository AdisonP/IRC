const mongoose = require("mongoose");

var userSchema = new mongoose.Schema({
    pseudo: String
})

module.exports = mongoose.model("User", userSchema);