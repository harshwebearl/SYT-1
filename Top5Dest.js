async function topDest(Data) {
  const Destination = new Map();

  for (var i = 0; i < Data.length; i++) {
    if (Data[i]?.destination) {
      const key1 = String(Data[i].destination);

      let value1 = Destination.get(key1);
      if (value1) {
        value1++;
      } else {
        value1 = 1;
      }
      Destination.set(key1, value1);
    }
  }

  var Destination_arr = [];
  for (const [key, value] of Destination) {
    Destination_arr.push({ key, value });
  }
  Destination_arr.sort((a, b) => b.value - a.value);

  if (Destination_arr.length > 5) {
    Destination_arr = Destination_arr.slice(0, 5);
  }

  const Destinations = Destination_arr.reduce((acc, { key, value }) => {
    acc[key] = value;
    return acc;
  }, {});
  return Destinations;
}
async function topDest2(Data) {
  const Destination = new Map();

  for (var i = 0; i < Data.length; i++) {
    if (Data[i]?.custom[0]?.destination) {
      const key1 = String(Data[i].custom[0].destination);
      console.log("key1", key1);

      let value1 = Destination.get(key1);
      if (value1) {
        value1++;
      } else {
        value1 = 1;
      }
      Destination.set(key1, value1);
    }
  }

  var Destination_arr = [];
  for (const [key, value] of Destination) {
    Destination_arr.push({ key, value });
  }
  Destination_arr.sort((a, b) => b.value - a.value);

  if (Destination_arr.length > 5) {
    Destination_arr = Destination_arr.slice(0, 5);
  }

  const Destinations = Destination_arr.reduce((acc, { key, value }) => {
    acc[key] = value;
    return acc;
  }, {});

  return Destinations;
}
module.exports = {
  topDest,
  topDest2
};
