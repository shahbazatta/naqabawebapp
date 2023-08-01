/**************************
 * Description:
 * @Author: Mohammad Idris
 * @Created On: 20/1/23
 ***************************/
const dbCon = require("../db/conn2");


function readAndUpdateData() {
   let query = {'data.avltm': {$lt: 16755661320}};
   let count = 0;
   dbCon.then(dbCon => {
      let data = dbCon.gpsLive.find(query);
      // .then(data => {
      data.forEach(rec => {
         if (rec.data.avltm < 16755661320) {
            let val = rec.data.avltm * 1000;
            let result = dbCon.gpsLive.updateOne({'data.imei': rec.data.imei}, {$set: {'data.avltm': val}});
            console.log(result);
            console.log(++count)
         }
      })
   });
}

readAndUpdateData();
