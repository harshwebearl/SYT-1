async function topstats(Data, num) {
  const Agency = new Map();
  var currentDate = new Date();

  var currentDay = currentDate.getDate(); // Get the day (1-31)
  var currentMonth = currentDate.getMonth() + 1; // Get the month (0-11), add 1 to adjust for zero-based indexing
  var currentYear = currentDate.getFullYear(); // Get the four-digit year

  if (num < 12) {
    for (var i = 0; i < Data.length; i++) {
      var cd, cm, cy, date;
      if (Data[i]?.bookdate) {
        date = Data[i].bookdate.toISOString().split("T")[0];
        cd = parseInt(date.split("-")[2]);
        cm = parseInt(date.split("-")[1]);
        cy = parseInt(date.split("-")[0]);
        if (
          cm >= currentMonth - num &&
          cm <= currentMonth &&
          cy == currentYear &&
          Data[i]?.bids[0]?.AgencyPersonals[0]?.AgencyPersonalsDetails[0]?.full_name
        ) {
          const key1 = String(Data[i].bids[0].AgencyPersonals[0].AgencyPersonalsDetails[0].full_name);

          let value1 = Agency.get(key1);
          if (value1) {
            value1++;
          } else {
            value1 = 1;
          }
          Agency.set(key1, value1);
        }
      }
    }

    var Agency_arr = [];
    for (const [key, value] of Agency) {
      Agency_arr.push({ key, value });
    }
    Agency_arr.sort((a, b) => b.value - a.value);

    if (Agency_arr.length > 5) {
      Agency_arr = Agency_arr.slice(0, 5);
    }

    const Agencys = Agency_arr.reduce((acc, { key, value }) => {
      acc[key] = value;
      return acc;
    }, {});
    return Agencys;
  } else {
    for (var i = 0; i < Data.length; i++) {
      var cd, cm, cy, date;
      if (Data[i]?.bookdate) {
        date = Data[i].bookdate.toISOString().split("T")[0];
        cd = parseInt(date.split("-")[2]);
        cm = parseInt(date.split("-")[1]);
        cy = parseInt(date.split("-")[0]);
        if (cy == currentYear && Data[i]?.bids[0]?.AgencyPersonals[0]?.AgencyPersonalsDetails[0]?.full_name) {
          const key1 = String(Data[i].bids[0].AgencyPersonals[0].AgencyPersonalsDetails[0].full_name);

          let value1 = Agency.get(key1);
          if (value1) {
            value1++;
          } else {
            value1 = 1;
          }
          Agency.set(key1, value1);
        }
      }
    }

    var Agency_arr = [];
    for (const [key, value] of Agency) {
      Agency_arr.push({ key, value });
    }
    Agency_arr.sort((a, b) => b.value - a.value);

    if (Agency_arr.length > 5) {
      Agency_arr = Agency_arr.slice(0, 5);
    }

    const Agencys = Agency_arr.reduce((acc, { key, value }) => {
      acc[key] = value;
      return acc;
    }, {});
    return Agencys;
  }
}
module.exports = topstats;
