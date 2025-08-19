const ISOToIST = (dat1) => {
  if (typeof dat1 != "string") {
    return "pass String.";
  } else if (!dat1.length) {
    return "string length 0";
  }

  const dat2 = new Date(String(dat1));

  return dat2.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    // Comment hour12 to get am/pm
    hour12: false,
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
};

module.exports = { ISOToIST };
