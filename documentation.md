db.stockandprices.updateMany({"product*stock":{"$gte":100}},{"$set":{"stock_expiry_date":new Date(Date.now() + 7 * 24 _ 60 _ 60 \_ 1000)}})

schema.aggregate([
{
$set: {
    stock_expiry_date: {
        $cond: {
        // if: { $gt: ["$product*stock", new Date()] },
if: { $gt: ["$product_stock", 100] },
then: new Date(Date.now() + 7 * 24 _ 60 _ 60 * 1000),
else: new Date(Date.now() -(7*24*60*60\*1000)),
// then: "No",
// else: "Yes",
},
},
},
},
{
$project:{
        isStockExpired: {
              // new field
              $cond: {
                // if: { $gt: ["$stock_expiry_date", new Date().toISOString()] }, //not working
if: { $gte: ["$stock_expiry_date", new Date()] },
then: true,
else: false,
// then: "No",
// else: "Yes",
},
},
}
}
])

{
$addFields: {
    category_id: { $first: "$Product.SubCategory.category_id" },
},
},

db.country.bulkWrite([
{ "updateMany": {
"filter": { "pop": { "$lt": 20000000 } },
"update": { "$set": { "country": "Small Country" } }
}},
{ "updateMany": {
"filter": { "pop": { "$gt": 20000000 } },
"update": { "$set": { "country": "Large Country" } }
}}
])

              {
                $lookup: {
                  from: "subcategories",
                  localField: "subcategory_id",
                  foreignField: "_id",
                  as: "SubCategory",
                  //
                  // pipeline: [
                  //   {
                  //     $lookup: {
                  //       from: "Category",
                  //       localField: "category_id",
                  //       foreignField: "_id",
                  //       as: "Category",
                  //     },
                  //   },
                  // ],
                },
              },

              //

https://blogs.halodoc.io/automatically-formatting-and-beautifying-code-on-commit/
https://stackoverflow.com/questions/66625560/how-do-i-get-lint-staged-working-with-husky-version-6

https://dev.to/bqardi/testing-and-formatting-before-commit-43i5
or see prettier docs : https://prettier.io/docs/en/install.html
Steps to Setup Prettier in a project

1. npm install --save-dev --save-exact prettier
2. setup prettierignore and prettierrc.json
3. npx prettier --write .

npm install --save-dev husky lint-staged
npx husky install
npm set-script prepare "husky install"
npx husky add .husky/pre-commit "npx lint-staged"

Add the following to your package.json:
{
"lint-staged": {
"\*_/_": "prettier --write --ignore-unknown"
}
}

CHECKING : npx prettier --check .
OVERWRITE : npx prettier --write .

REACT : https://www.npmjs.com/package/file-saver
https://gist.github.com/javilobo8/097c30a233786be52070986d8cdb1743
https://www.folkstalk.com/2022/09/axios-download-excel-file-with-code-examples.html
https://stackoverflow.com/questions/50694881/how-to-download-file-in-react-js
https://stackoverflow.com/questions/41938718/how-to-download-files-using-axios
https://stackoverflow.com/questions/60454048/how-does-axios-handle-blob-vs-arraybuffer-as-responsetype
https://stackoverflow.com/questions/41938718/how-to-download-files-using-axios
https://docs.informatica.com/master-data-management-cloud/reference-360/current-version/reference-360/reference-360-rest-api/export-version-1/export-value-mappings-to-json-format.html

https://syntaxfix.com/question/3863/how-to-save-xlsx-data-to-file-as-a-blob

https://www.npmjs.com/package/exceljs
https://stackoverflow.com/questions/34993292/how-to-save-xlsx-data-to-file-as-a-blob
https://stackoverflow.com/questions/41938718/how-to-download-files-using-axios/53230807#53230807
https://javascript.plainenglish.io/most-efficient-ways-for-building-pdfs-files-with-backend-and-frontend-javascript-environment-68056f73257

///IMPORTANT
https://www.grapecity.com/blogs/how-to-generate-excel-spreadsheets-in-nodejs

-https://www.google.com/search?q=export+to+excel+sheet+expressjs&rlz=1C1CHBF_enIN988IN988&oq=export+to+excel+sheet+expressjs&aqs=chrome..69i57j0i512j0i22i30l8.5994j0j9&sourceid=chrome&ie=UTF-8

https://www.google.com/search?q=export+excel+sheet+of+mongoose+schema&rlz=1C1CHBF_enIN988IN988&oq=export+excel+sheet+of+mongoose+schema&aqs=chrome..69i57j33i10i160.9072j0j7&sourceid=chrome&ie=UTF-8

https://stackoverflow.com/questions/59474320/mongoose-set-and-unset-conditional

https://stackoverflow.com/questions/71206240/mongodb-conditional-if-else-if-with-exists
https://stackoverflow.com/questions/36698569/mongodb-update-with-condition
https://stackoverflow.com/questions/46094663/mongoose-sort-latest-document-entry-in-db-and-update
https://stackoverflow.com/questions/56099018/mongodb-updatemany-with-conditional
https://stackoverflow.com/questions/33846939/mongoose-schema-error-cast-to-string-failed-for-value-when-pushing-object-to
https://stackoverflow.com/questions/26475013/date-comparison-with-mongoose
https://stackoverflow.com/questions/70541099/compare-date-with-mongoose-timestamps-using-aggregate
https://stackoverflow.com/questions/58949488/check-today-date-greater-than-in-if-condition-in-aggregate-mongodb
https://code-maven.com/slides/mongodb/mongodb-aggregation-example-11
https://stackoverflow.com/questions/60614792/match-operation-for-array-size-gt-0-does-not-work-in-aggregation-mongodb
https://stackoverflow.com/questions/62469895/mongo-conditional-aggregation-within-set-operation
https://stackoverflow.com/questions/58949488/check-today-date-greater-than-in-if-condition-in-aggregate-mongodb

??IMPORTANT for consitent schema to reponse
https://stackoverflow.com/questions/41542746/mongoose-aggregate-using-exists-in-cond

https://stackoverflow.com/questions/62469895/mongo-conditional-aggregation-within-set-operation
https://stackoverflow.com/questions/1026069/how-do-i-make-the-first-letter-of-a-string-uppercase-in-javascript
https://stackoverflow.com/questions/26399989/mongodb-aggregation-match-error-arguments-must-be-aggregate-pipeline-operato
https://stackoverflow.com/questions/53081756/mongodb-how-to-add-conditional-match-condition
https://stackoverflow.com/questions/55076411/how-can-i-define-a-field-with-a-range-of-data-in-mongoose-schema

//AWS delte folder periodically
https://lepczynski.it/en/aws_en/automatically-delete-old-files-from-aws-s3/

https://stackoverflow.com/questions/24824657/how-do-i-update-mongodb-document-fields-only-if-they-dont-exist

https://stackoverflow.com/questions/4057196/how-do-you-query-for-is-not-null-in-mongo
https://stackoverflow.com/questions/16902930/mongodb-aggregation-framework-match-or
