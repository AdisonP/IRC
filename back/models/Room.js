const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema(
  {
    name : {
      type: String
    },
    members: {
      type: Array,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Room", RoomSchema);