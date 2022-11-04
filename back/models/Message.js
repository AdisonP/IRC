const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    id_conversation: String,
    sender: String,
    receiver: String,
    text: String, 
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", MessageSchema);