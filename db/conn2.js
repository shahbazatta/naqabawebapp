/**************************
 * Description:
 * @Author: Mohammad Idris
 * @Created On: 26/11/22
 ***************************/

const {MongoClient} = require("mongodb");

const config = {
   db: 'device-db',
   connectionUri: "mongodb://naqabaApi:naqaba%402023@192.168.11.222:27017/device-db?authSource=admin"
   //connectionUri: 'mongodb://127.0.0.1:27017/device-db'
};
const connectionUri = config.connectionUri;

const client = new MongoClient(connectionUri, {
   useNewUrlParser: true,
   useUnifiedTopology: true
});


function DATABASE() {
   this.dbObject = null;
   this.avlDevices = null;
}


DATABASE.prototype.init = function (passedConfig, options) {
   let self = this;
   self.config = passedConfig || config;

   let promise = new Promise(function (resolve, reject) {
      if (self.initialized) {
         return resolve(self);
      }

      client.connect(function (err, client) {
         if (err) {
            console.error(err);
            reject(err);
         }
         else {
            let db = client.db(config.db);
            self.dbObject = db;
            self.avlDevices = db.collection('avlDevices'); //store Device details.
            self.avlDevices.createIndex({imei: -1}, {unique: true}, function (err) {
               if (err) {
                  console.error(err);
               }
            });
	    self.initialized = true;
            return resolve(self);
         }
      });
   });
   return promise;
};

let dbObj = null;

let getDbObject = function () {
   if (!dbObj) {
      dbObj = new DATABASE();
      return dbObj.init();
   }
   return dbObj;
}();

module.exports = getDbObject;

