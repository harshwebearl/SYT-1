// const XLSX = require("xlsx");
// const { Blob } = require("buffer");
const excel = require("exceljs");

const generateXlsx = async (column, data, filename, res) => {
  let workbook = new excel.Workbook();
  let worksheet = workbook.addWorksheet();
  worksheet.columns = column;

  worksheet.eachRow(function (row, rowNumber) {
    row.eachCell((cell, colNumber) => {
      cell.font = {
        name: "Arial",
        family: 2,
        bold: true,
        size: 10
      };
    });

    row.commit();
  });

  worksheet.addRows(data);

  const s2ab = (s) => {
    var buf = new ArrayBuffer(s.length);
    var view = new Uint8Array(buf);
    for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xff;
    return buf;
  };

  // res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  // res.setHeader("Content-Disposition", `attachment; filename="${filename}.xlsx"`);
  res.attachment(`${filename}`);
  return workbook.xlsx.write(res).then(() => res.end());
};

const demoXlsx = async () => {
  let workbook = new excel.Workbook();
  let worksheet = workbook.addWorksheet("Tutorials");

  worksheet.columns = [
    { header: "Id", key: "id", width: 5 },
    { header: "Title", key: "title", width: 25 },
    { header: "Description", key: "description", width: 25 },
    { header: "Published", key: "published", width: 10 }
  ];

  // Add Array Rows
  worksheet.addRows(tutorials);

  // res is a Stream object
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", "attachment; filename=" + "tutorials.xlsx");

  return workbook.xlsx.write(res).then(function () {
    res.status(200).end();
  });
};

module.exports = {
  generateXlsx,
  demoXlsx
};
