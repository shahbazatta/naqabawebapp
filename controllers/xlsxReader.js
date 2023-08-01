/**************************
 * Description:
 * @Author: Mohammad Idris
 * @Created On: 20/1/23
 ***************************/
const dbCon = require("../db/conn2");
const xlsx = require('xlsx');


function readAndUploadData() {
   const workbook = xlsx.readFile('/home/ecs-user/Update_IMEI_Data.xlsx');
   const sheet_name_list = workbook.SheetNames;
   console.log('reading sheet', sheet_name_list[0]);
   let data = xlsx.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
   console.log(data[0])
   let count = 0;
   dbCon.then(dbCon => {
      // console.log(dbCon.avlDevices)
      data.forEach(el => {
         console.log(el, 'Records count', ++count);
         dbCon.avlDevices.insertOne(el)
            .then(data => {
               console.log(data.result);
            }).catch(e => {
            console.error(e);
         });
      });
   })

}

readAndUploadData();
