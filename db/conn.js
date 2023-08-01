/**************************
 * Description:
 * @Author: Mohammad Idris
 * @Created On: 26/11/22
 ***************************/

const {MongoClient} = require("mongodb");
const config = require('../config/config');

const connectionUri = config.mongo.connectionUri;
const client = new MongoClient(connectionUri, {
   useNewUrlParser: true,
   useUnifiedTopology: true
});


function DATABASE() {
   this.dbObject = null;
   this.gpsLive = null;
   this.gpsHistory = null;
   this.avlDevices = null;
   this.gpsLiveDevices = null;
   this.geoFences = null;
   this.busRouts = null;
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
            self.gpsLive = db.collection('gpsLive'); //store Device post avl data.
            self.gpsHistory = db.collection('gpsHistory'); //store Device post avl data.
            self.avlDevices = db.collection('avlDevices'); //store Device details.
            self.gpsLiveDevices = db.collection('gpsLiveDevices'); //store Device details i gps data.
            self.geoFences = db.collection('geoFences'); // stores all geofences areas
            self.busRouts = db.collection('busRouts');
            console.log("connected to db");
            // lets be smarter here, trigger index creation if don't exist
            // as index creation cab be completed in background we can proceed.
            self.gpsLive.createIndex({location: "2dsphere"}, function (err) {
               if (err) {
                  console.error(err);
               }
            });
            self.gpsLive.createIndex({imei: -1}, {unique: true}, function (err) {
               if (err) {
                  console.error(err);
               }
            });
            self.gpsLive.createIndex({updatedon: -1}, function (err) {
               if (err) {
                  console.error(err);
               }
            });
            self.gpsHistory.createIndex({location: "2dsphere"}, function (err) {
               if (err) {
                  console.error(err);
               }
            });
            self.gpsHistory.createIndex({imei: -1}, function (err) {
               if (err) {
                  console.error(err);
               }
            });
            self.gpsHistory.createIndex({imei: -1, updatedon: -1}, function (err) {
               if (err) {
                  console.error(err);
               }
            });
            self.gpsHistory.createIndex({updatedon: -1}, function (err) {
               if (err) {
                  console.error(err);
               }
            });
            self.avlDevices.createIndex({imei: -1}, {unique: true}, function (err) {
               if (err) {
                  console.error(err);
               }
            });
            self.geoFences.createIndex({geometry: "2dsphere"}, function (err) {
               if (err) {
                  console.error(err);
               }
            });
            self.busRouts.createIndex({imei: -1}, function (err) {
               if (err) {
                  console.error(err);
               }
            });
            self.busRouts.createIndex({updatedon: -1}, function (err) {
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
      dbObj.init()
   }
   return dbObj;
}();

module.exports = getDbObject;
