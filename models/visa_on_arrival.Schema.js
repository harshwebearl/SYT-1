const mongoose = require("mongoose");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const visa_on_Arrival_Schema = new mongoose.Schema({
  destination_id: {
    type: [mongoose.Schema.Types.ObjectId],
    required: true
  }
},
  {
    timestamps: {
      currentTime: () => getISTTime() // Use custom function for timestamps
    }
  });

const visa_on_ArrivalSchema = new mongoose.model("visa_on_Arrival", visa_on_Arrival_Schema);
module.exports = visa_on_ArrivalSchema;
