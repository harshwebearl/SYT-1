const BaseController = require("./BaseController");
const { generateXlsx } = require("../middleware/generateXlsx");
const invoice_schema = require("../models/invoice.schema");

const invoice_data = async (req, res, next) => {
  const fileName = "invoice_data.xlsx";
  // console.log(fileName);
  const result = await invoice_schema.find();
  // console.log(result);
  const column = [
    // { header: "DisplayName", key: "KeyName" },
    { header: "ref_no", key: "ref_no", width: 20 },
    { header: "date", key: "date", width: 20 },
    { header: "due", key: "due", width: 20 },
    { header: "details", key: "details", width: 20 },
    { header: "client", key: "client", width: 20 },
    { header: "status", key: "status", width: 20 },
    { header: "total", key: "total", width: 20 }
  ];
  const data = [];
  result.map((item) =>
    data.push({
      brand_name: item.brand_name || "",
      date: item.date || "",
      due: item.due || "",
      details: item.details || "",
      client: item.client || "",
      status: item.status || "",
      total: item.total || ""
    })
  );
  await generateXlsx(column, data, fileName, res);
};

module.exports = class HomeController extends BaseController {
  async generateExcelFile(req, res, next) {
    try {
      // Make Scalable API
      // Check if Account exists or not
      // Validate import and export formats and queryType before processing
      // GenerateFile based on format and query params

      const ReqQuery = {
        importType: req.query.importType || "excel",
        exportType: req.query.exportType || "excel",
        queryType: req.query.queryType || "", // default : "" (no query)
        limit: req.query.limit || "all" // default : all
      };

      const queryTypeList = ["invoice_data"];

      const queryTypeMapObj = {
        invoice_data: invoice_data
      };

      if (queryTypeList.includes(req.query.queryType || "")) {
        await queryTypeMapObj?.[`${req.query.queryType}`](req, res, next);
      } else {
        throw new Error("Invalid queryType");
      }
    } catch (error) {
      next(error);
    }
  }

  async exportEmployees(req, res) {
    try {
      // const employees = await Employee.find();
      let workbook = new Excel.Workbook();
      let worksheet = workbook.addWorksheet("Employees");
      worksheet.columns = [
        { header: "Employee Name", key: "fullName", width: 40 },
        { header: "Department", key: "departmentName", width: 25 },
        { header: "Position", key: "positionName", width: 25 }
      ];

      // worksheet.addRows(employees);
      worksheet.addRows([]);

      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", "attachment; filename=employees.xlsx");
      // res.setHeader("Content-Disposition", "attachment; filename=employees.xlsx");

      // This doesn't work either
      // workbook.xlsx.write(res).then(function () {
      //   res.status(200).end();
      // });

      workbook.xlsx.writeFile("./employees.xlsx").then(
        (response) => {
          console.log("File is created"); // I'm able to see this in my console
          console.log(path.join(__dirname, "../employees.xlsx"));
          res.sendFile(path.join(__dirname, "../employees.xlsx"));
        },
        (err) => {
          console.log("ERROR: ", err);
        }
      );
    } catch (err) {
      res.status(500).json({ errors: err });
    }
  }
};
