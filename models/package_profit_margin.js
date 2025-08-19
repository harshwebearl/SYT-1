const mongoose = require("mongoose");

function getISTTime() {
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
    const now = new Date();
    const istTime = new Date(now.getTime() + istOffset);
    return istTime;
}

const packageProfitMarginSchema = new mongoose.Schema({
    state_name: {
        type: String
    },
    month_and_margin_user: [
        {
            month_name: {
                type: String

            },
            margin_percentage: {
                type: String

            }
        }
    ],
    month_and_margin_agency: [
        {
            month_name: {
                type: String

            },
            margin_percentage: {
                type: String

            }
        }
    ]
}, {
    timestamps: {
        currentTime: () => getISTTime() // Use custom function for timestamps
    }
});


module.exports = mongoose.model("package_profit_margin", packageProfitMarginSchema)