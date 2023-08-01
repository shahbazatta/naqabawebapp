/**************************
 * Description:
 * @Author: Mohammad Idris
 * @Created On: 27/11/22
 ***************************/
const JSONStream = require('JSONStream'); 
const dbCon = require("../db/conn");
const ArrayTransform = require('./arrayTransform');
const open = '[',
   separator = ',',
   close = ']';

exports.getData = async (req, res) => {
   let data = dbCon.gpsHistory.find({}, {_id: 0}).sort({_id: -1})
   .limit(500)
   .stream()
   .pipe(JSONStream.stringify(open, separator, close))
   .pipe(res);

};

exports.getImeisData1 = async (req, res) => {
//console.log('exports.getImeisData====================');
   let imei = req.query.imei;
   let busid = req.query.busid;
   let avlComp = req.query.avl_comp;
   let transComp = req.query.trans_comp;
   let deviceComp = req.query.device_comp;


   let filters = {};
   if (imei) {
      filters['data.imei'] = {$regex: new RegExp("^" + imei)};
   }

   if (avlComp) {
      filters['device.avl_comp'] = avlComp;
   }
   if (transComp) {
      filters['device.trnspt_comp'] = transComp;
   }
   if (deviceComp) {
      filters['device.device_comp'] = {$regex: new RegExp("^" + deviceComp), $options: "i"};
   }
   if (busid) {
      filters['device.busid'] = {$regex: new RegExp("^" + busid), $options: "i"};
   }
   console.log('xxxxxxxxx',filters)
   let data = dbCon.gpsLiveDevices.find(filters);
   // let data = dbCon.gpsLive.find(filters, {_id: 0, 'data._id': 0});
   let records = [];
   await data.forEach(r => {
      //combine data and device info
      let info = {};//r.data;
	  info.a=r.data.imei;
	  info.b=r.data.avltm;
	  info.c=r.data.location.coordinates;
	  info.f=r.data.alt;
	  info.g=r.data.ang;
	  info.h=r.data.spd;
	  info.i=r.data.odata;
	  info.k=r.data.updatedon;
	  let device={};
	  if(r.device.length>0){
	  device.n=r.device[0].busid;
	  //device.o=r.device[0].license_ser_no;
	  device.p=r.device[0].plate_no;
	 // device.q=r.device[0].engplate_no;
	  device.r=r.device[0].bus_oper_no;
	  
	  device.s=r.device[0].trnspt_comp_id;
	  device.t=r.device[0].trnspt_comp_ar;
	  device.u=r.device[0].trnspt_comp;
	  
	  //device.v=r.device[0].trkdevid;
	  device.w=r.device[0].device_comp;
	  device.x=r.device[0].avl_comp_id;
	  device.y=r.device[0].avl_comp_ar;
	  //device.z=r.device[0].avl_comp;
	  
	  }
	  info.m= device;
	
	  
    //  info.device = r.device.length > 0 ? r.device[0] : {};
      records.push(info);
   });
   // console.log(data)
   res.send(records);
};


exports.getImeisData = async (req, res) => {
//console.log('exports.getImeisData====================');
   let imei = req.query.imei;
   let busid = req.query.busid;
   let avlComp = req.query.avl_comp;
   let transComp = req.query.trans_comp;
   let deviceComp = req.query.device_comp;


   let filters = {};
   if (imei) {
      filters['data.imei'] = {$regex: new RegExp("^" + imei)};
   }

   if (avlComp) {
      filters['device.avl_comp'] = avlComp;
   }
   if (transComp) {
      filters['device.trnspt_comp'] = transComp;
   }
   if (deviceComp) {
      filters['device.device_comp'] = {$regex: new RegExp("^" + deviceComp), $options: "i"};
   }
   if (busid) {
      filters['device.busid'] = {$regex: new RegExp("^" + busid), $options: "i"};
   }
   console.log(filters)
   let data = dbCon.gpsLiveDevices.find(filters);
   // let data = dbCon.gpsLive.find(filters, {_id: 0, 'data._id': 0});
   let records = [];
   await data.forEach(r => {
      //combine data and device info
      let info = r.data;
      info.device = r.device.length > 0 ? r.device[0] : {};
      records.push(info);
   });
   // console.log(data)
   res.send(records);
};

exports.getCompanyData = async (req, res) => {
   let imei = req.query.imei;
   let busid = req.query.busid;
   let avlComp = req.query.avl_comp;
   let transComp = req.query.trans_comp;
   let allModel = req.query.all_busid;
   let allAvlComp = req.query.all_avlcomp;
   let allTransComp = req.query.all_transcomp;
   let allDeviceComp = req.query.all_devicecomp;
   let filters = {};
   let unique = false;
   if (allModel) {
      filters = 'busid';
      unique = true;
   }
   if (allTransComp) {
      filters = 'trnspt_comp';
      unique = true;
   }
   if (allAvlComp) {
      filters = 'avl_comp';
      unique = true;
   }
   if (allDeviceComp) {
      filters = 'device_comp';
      unique = true;
   }
   if (unique) {
      unique = false;
      let records = await dbCon.avlDevices.distinct(filters);
      res.send(records);
      return;
   }
   if (imei) {
      filters.imei = imei;
   }
   if (busid) {
      filters.busid = busid;
   }
   if (avlComp) {
      filters.avl_comp = avlComp;
   }
   if (transComp) {
      filters.trnspt_comp = transComp;
   }
   let data = dbCon.avlDevices.find(filters);
   let records = [];


   var company_list = [];
   var trans_comp_list = [];
   var company_list_ar = [];
   var trans_comp_list_ar = [];

   await data.forEach(r => {


      var cnm = r.avl_comp;
      if (company_list.indexOf(cnm) === -1) {
         company_list.push(cnm);
         company_list_ar.push({'id': r.avl_comp_id, 'name': r.avl_comp_ar});
      }

      var cnm = r.trnspt_comp;
      if (trans_comp_list.indexOf(cnm) === -1) {
         trans_comp_list.push(cnm);
         trans_comp_list_ar.push({'id': r.trnspt_comp_id, 'name': r.trnspt_comp_ar});
      }
   });

   records.push({'comp_ar': company_list_ar, 'trans_ar': trans_comp_list_ar});


   res.send(records);
//   res.send(company_list); 
};

exports.removeImeiData = async (req, res) => {
   console.log('req.query', req.query)
   let imei = req.query.imei;
   try {
      dbCon.gpsLive.deleteOne({$or: [{'data.imei': imei}, {'data.imei': parseInt(imei)}]}).then(data => {
         // console.log(data)
         res.send(data);
      });
   } catch (e) {
      console.error(e);
   }
};

function getIMEIDetails(imei) {
   return dbCon.avlDevices.findOne({imei: imei});
}

function isValidateRequest(req) {
   if (!req.query.token || req.query.token != 'cebc8011932a85c60a7e079b840bf083161812d3') {
      return false; //invalid request
   }
   return true;
}

/**
 * Ignored these fields in query results
 * @returns {}
 */
function getIgnoredFields() {
   let hideOutputFields = { // comment out any fields if you need it in result/output
      '_id': 0,
      'device._id': 0,
      'device.imei': 0,
      'device.trnspt_comp': 0,
      'device.trkdevid': 0,
      'device.avl_comp_id': 0,
      'device.avl_comp_ar': 0,
      'device.avl_comp': 0
   };
   return hideOutputFields;
}


/********
 This API only support last 10 min live data
 updatedon >= current time -10 min
 */
exports.getDevicesDataLive = async (req, res) => {
   if (!isValidateRequest(req)) {
      return res.status(401);
   }
   let ask = req.query.min;
   try {
      if (!ask || isNaN(ask)) {
         return res.error({error: 'Invalid min value'});
      }
      if (ask && ask > 24 * 60 * 60) {
         res.status(400)
            .json({error: 'min value must be in between 1 min to 24 hours'});
         return;
      }
   } catch (e) {
      console.error('Invalid min value', ask);
      return res.status(400).json({error: 'Invalid min value'});
   }
   let minBefore = req.query.min ? req.query.min : 10;//default 10 min
   let milisecBefore = minBefore * 60 * 1000; //milliseconds
   let currentTime = Date.now();
   let oldTime = currentTime - milisecBefore;
   let query = {'data.updatedon': {$gt: oldTime, $lte: currentTime}};
   let hideOutputFields = getIgnoredFields();
/*
   dbCon.gpsLiveDevices.find(query)
      .project(hideOutputFields)
      .stream({
         transform: (r) => {
            //combine data and device info
            let info = r.data;
            info.device = r.device.length > 0 ? r.device[0] : {};
            return JSON.stringify(info);
         }})
    //  .pipe(JSONStream.stringify(open, separator, close))
      .pipe(new ArrayTransform())
      .pipe(res);

*/

   let data = dbCon.gpsLiveDevices.find(query).project( hideOutputFields );
   let records = [];

   await data.forEach(r => {
      //combine data and device info
      let info = r.data;
      info.device = r.device.length > 0 ? r.device[0] : {};
      records.push(info);
   });

   res.send(records);
};


/********
 This API only support last 10 min live data for those devices whic are not synced
 updatedon >= current time -10 min
 */
exports.getDevicesNotSynced = async (req, res) => {
   if (!isValidateRequest(req)) {
      return res.status(401);
   }
   let ask = req.query.min;
   try {
      if (!ask || isNaN(ask)) {
         return res.error({error: 'Invalid min value'});
      }

      if (ask && ask > 365 * 24 * 60 * 60) {
         res.status(400)
            .json({error: 'min value must be in between 1 min to 24 hours'});
         return;
      }
   } catch (e) {
      console.error('Invalid min value', ask);
      return res.status(400).json({error: 'Invalid min value'});
   }
   let minBefore = req.query.min ? req.query.min : 10;//default 10 min
   let milisecBefore = minBefore * 60000; //milliseconds
   let currentTime = Date.now();
   let oldTime = currentTime - milisecBefore;
   let query = {'data.updatedon': {$lt: oldTime}};
   let hideOutputFields = getIgnoredFields();
   let data = dbCon.gpsLiveDevices.find(query).project(hideOutputFields);
   let records = [];

   await data.forEach(r => {
      //combine data and device info
      let info = r.data;
      info.device = r.device.length > 0 ? r.device[0] : {};
      records.push(info);
   });

   res.send(records);
};


/********
 This API only support last 10 min live data for those devices which are not synced
 updatedon >= current time -10 min
 */
exports.getDevicesTimeError = async (req, res) => {
   if (!isValidateRequest(req)) {
      return res.status(401);
   }
   let ask = req.query.min;
   try {
      if (!ask || isNaN(ask)) {
         return res.error({error: 'Invalid min value'});
      }
      if (ask && ask > 365 * 24 * 60 * 60) {
         res.status(400)
            .json({error: 'min value must be in between 1 min to 24 hours'});
         return;
      }
   } catch (e) {
      console.error('Invalid min value', ask);
      return res.status(400).json({error: 'Invalid min value'});
   }
   let minBefore = req.query.min ? req.query.min : 10;//default 10 min
   let milisecBefore = minBefore * 60000; //milliseconds
   let query = {$expr: {$gte: [{$subtract: ['$data.updatedon', '$data.avltm']}, milisecBefore]}};
   let hideOutputFields = getIgnoredFields();
   let data = dbCon.gpsLiveDevices.find(query).project(hideOutputFields);
   let records = [];

   await data.forEach(r => {
      //combine data and device info
      let info = r.data;
      info.device = r.device.length > 0 ? r.device[0] : {};
      records.push(info);
   });

   res.send(records);
};

/********
 This API returns the geo fence / location for any given coordinate
 */
exports.getGeoFenceInfo = async (req, res) => {
   if (!isValidateRequest(req)) {
      return res.status(401);
   }
   let longitude = req.query.lng;
   let latitude = req.query.lat;
   try {
      if (!longitude || isNaN(latitude) || !latitude || isNaN(latitude)) {
         return res.error({error: 'Invalid lat,long values'});
      }
      if (longitude > 180 && longitude < -180 || latitude > 90 || latitude < -90) {
         res.status(400)
            .json({error: 'Out of range values'});
         return;
      }
      longitude = parseFloat(longitude);
      latitude = parseFloat(latitude);
   } catch (e) {
      console.error('Invalid request inputs');
      return res.status(400).json({error: 'Invalid request inputs'});
   }
   let query = {
      geometry: {
         $geoIntersects: {
            $geometry: {
               type: 'Point',
               coordinates: [longitude, latitude]
            }
         }
      }
   };
//   console.error('query',query,req.query);
   let data = dbCon.geoFences.find(query, {_id: 0, properties: 1,attributes: 1});
   let records = [];

   await data.forEach(r => {
      records.push(r.properties || r.attributes);
   });

   res.send(records);
};
