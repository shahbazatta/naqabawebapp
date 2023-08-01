/**************************
 * Description:
 * @Author: Mohammad Idris
 * @Created On: 27/11/22
 ***************************/
const dbCon = require("../db/conn");


exports.getData = async (req, res) => {
   let data = dbCon.gpsHistory.find({}, {_id: 0}).sort({_id: -1}).limit(500);
   let records = [];
   await data.forEach(r => {
      records.push(r);
   });
   // console.log(data)
   res.send(records);
};

// API 33
exports.getDelayBetweenReadingsTimePeriod = async (req, res) => {
   let min = req.query.min;
   let sdt = req.query.start_dt;
   let stm = req.query.start_tm;
   let edt = req.query.end_dt;
   let etm = req.query.end_tm;
   let status = 404;
   let result = 'error';
   let msg = '';
   if (!min || isNaN(min)) {
      msg = 'Invalid input parameters x minutes';
   }else if (!sdt || !stm) {
      msg = 'Please provide start datetime';
   } else if (!edt || !etm) {
      msg = 'Please provide end datetime';
   }else if (sdt!=edt) {
      msg = 'start date and end date should be same only 1 day data';
   }

   else {

     
	  let st_dt1 = datetime(sdt + " " + stm);
      let nd_dt1 = datetime(edt + " " + etm);
	  var date1 = new Date(st_dt1); // some mock date
	  var date2 = new Date(nd_dt1); // some mock date
      var st_dt = date1.getTime();
	  var nd_dt = date2.getTime(); 
	  if (!st_dt || !nd_dt || st_dt < 0 || nd_dt < 0) {
         msg = 'Please check start and end date time';
      }else{
	  
	   let filters = {};
     // if (imei) {
      //    filters['imei'] = parseInt(imei);
     // }
	  filters['updatedon'] = {$gte: st_dt, $lte: nd_dt};

     

      let hideOutputFields = getIgnoredFields2();
      let data = dbCon.gpsHistory.find(filters).project(hideOutputFields);;

      // let records = [];
      let trecords = [];
	  let records = [];
	  let imeis = [];
	  var minmili=min*60*1000;
	await data.forEach(r => {
		var p=imeis.indexOf(r.imei);
		if(p<0){
			  imeis.push(r.imei);
			  trecords.push(r);
		}else{
			var x=trecords[p];
			trecords[p]=r;
			if(r.avltm+minmili<x.avltm){
				let info = {};
				info.imei = r.imei;
				info.diff = (x.avltm-r.avltm);
				info.diff1 = (x.updatedon-r.updatedon);
				info.avltmrec1 = r.avltm;
				info.avltmrec2 = x.avltm;				
				records.push(info);
			}
			
		}
		
	});
		if (records.length > 0) {
	
		   // records = trecords;
		   let json1 = {status: 200, result: "success",data: records};
		   res.send(json1);
		   return;
		} else {
		 status = 400;
         msg = 'No record';
		}
   }
   }

   let json = {status: status, result: result, msg: msg};
   res.send(json);
};


//API 4
exports.getTripDataAll = async (req, res) => {
  // let imei = req.query.imei;
   let src_geo = req.query.src_geo;
   let dest_geo = req.query.dest_geo;
   let sdt = req.query.start_dt;
   let stm = req.query.start_tm;
   let edt = req.query.end_dt;
   let etm = req.query.end_tm;

   let status = 404;
   let result = 'error';
   let msg = '';

   
	   
   //if (!imei) {
   //   msg = 'Please provide valid imei number';
  // } else 
	   
   if (!src_geo) {
      msg = 'Please src geofence code';
   } else if (!dest_geo) {
      msg = 'Please dest geofence code';
   }else if (!sdt || !stm) {
      msg = 'Please provide start datetime';
   } else if (!edt || !etm) {
      msg = 'Please provide end datetime';
   } else {
      var st_dt = datetime(sdt + " " + stm);
      var nd_dt = datetime(edt + " " + etm);
      // console.log(st_dt, '---', nd_dt);
      if (!st_dt || !nd_dt || st_dt < 0 || nd_dt < 0) {
         msg = 'Please check start and end date time';
      } else {
		let filters = {$or: [{'lpt': src_geo}, {'lpt': dest_geo}]};
		let st_dt1 = datetime(sdt + " " + stm);
		let nd_dt1 = datetime(edt + " " + etm);
		var date1 = new Date(st_dt1); // some mock date
		var date2 = new Date(nd_dt1); // some mock date
		st_dt = date1.getTime(); 
		nd_dt = date2.getTime(); //9000000
		filters['lpttm'] = {$gte: st_dt, $lte: nd_dt};
		let data = dbCon.busRouts.find(filters);
		let records = [];
		let imeis = [];
         await data.forEach(r => {
		
		      var a=[];
			  var m = new Date(r.lpttm);
			  var dt=m.toLocaleString();
			  var m1 = new Date(r.updatedon);
			  var dt1=m1.toLocaleString();
			  a.push(''+r.imei+'');//0
              a.push(''+r.lpttm+'');//1
			  a.push(dt);//1
			  a.push(''+r.updatedon+'');//1
			  a.push(dt1);//1
              a.push(''+r.lpt+'');//2
			  if(r.lpt.indexOf(src_geo)>=0){
				 a.push(''+src_geo+'');//2 
			  }else 
				  a.push(''+dest_geo+'');//2 
			  a.push(''+r.du+'');//1
			  a.push(r.location.coordinates);//2
			  if(!imeis.includes(''+r.imei+''))
			  imeis.push(''+r.imei+'');
              records.push(a);
         });
		 
		//res.send(imeis);
            //return;
			let records_all = [];
			if (imeis.length > 0) {
				await imeis.forEach(im => {
					let records1 = [];
					records.forEach(r => {
						if(r.includes(im)){
							records1.push(r);
						}
					});
					var rec=calculateTripCount(im,records1,src_geo,dest_geo);
					records_all.push(rec);
				});
				
			}
			res.send(records_all);
            return;

       
      }
   }
   let json = {status: status, result: result, msg: msg};
   res.send(json);
};

function calculateTripCount(im,records,src_geo,dest_geo){
if (records.length > 0) {
			 //let pos=0;
			// records.sort((a, b) => a[pos].localeCompare(b[pos]));
			 
			 let cnt=0;
			 let cnt1=0;
			 let cnt2=0;
			 let i=0;
			 records.forEach(r => {
				 
				 if(r.includes(src_geo)){
					 if(i==0){
					 i=1;
					 }
				 else if(i==2)
					 i=3;
					 cnt1++;
				 }
				 else if(r.includes(dest_geo)){
					 if(i==1){
					 i=2;
					 cnt2++;
					 }
				 }
				 if(i==3){
				 cnt++;
				 i=1;
				 }
					 
			 });
			 let json1 = {imei:im,trip_cnt:cnt,trip_cnt_src_to_dest:cnt1,trip_cnt_dest_to_src:cnt2,data:records};
            return json1;
         }
		 
		 let json1 = {imei:im,trip_cnt:0,trip_cnt_src_to_dest:0,trip_cnt_dest_to_src:0,data:records};
            return json1;
		 
		
}


// API 14
exports.getLocationBusTimePeriod = async (req, res) => {
   let imei = req.query.imei;
   let sdt = req.query.start_dt;
   let stm = req.query.start_tm;
   let edt = req.query.end_dt;
   let etm = req.query.end_tm;
   let status = 404;
   let result = 'error';
   let msg = '';
   if (!imei || isNaN(imei)) {
      msg = 'Invalid input parameters avl imei number or bus plate no';
   }else if (!sdt || !stm) {
      msg = 'Please provide start datetime';
   } else if (!edt || !etm) {
      msg = 'Please provide end datetime';
   }else if (sdt!=edt) {
      msg = 'start date and end date should be same only 1 day data';
   }

   else {

     
	  let st_dt1 = datetime(sdt + " " + stm);
      let nd_dt1 = datetime(edt + " " + etm);
	  var date1 = new Date(st_dt1); // some mock date
	  var date2 = new Date(nd_dt1); // some mock date
      var st_dt = date1.getTime();
	  var nd_dt = date2.getTime(); 
	  if (!st_dt || !nd_dt || st_dt < 0 || nd_dt < 0) {
         msg = 'Please check start and end date time';
      }else{
	  
	   let filters = {};
      if (imei) {
          filters['imei'] = parseInt(imei);
      }
	  filters['updatedon'] = {$gte: st_dt, $lte: nd_dt};

     

      let hideOutputFields = getIgnoredFields1();
      let data = dbCon.gpsHistory.find(filters).project(hideOutputFields);;

      // let records = [];
      let trecords = [];
	await data.forEach(r => {
	
	//info.device = r.device.length > 0 ? r.device[0] : {};
	trecords.push(r);
	});
		if (trecords.length > 0) {
	
		   // records = trecords;
		   let json1 = {status: 200, result: "success",imei:imei,data: trecords};
		   res.send(json1);
		   return;
		} else {
		 status = 400;
         msg = 'AVL imei number not found';
		}
   }
   }

   let json = {status: status, result: result, msg: msg};
   res.send(json);
};

exports.getAllGeoPoints = async (req, res) => {
   let imei = req.query.imei;
   let sdt = req.query.start_dt;
   let stm = req.query.start_tm;
   let edt = req.query.end_dt;
   let etm = req.query.end_tm;
   let status = 404;
   let result = 'error';
   let msg = '';
   if (!imei || isNaN(imei)) {
      msg = 'Invalid input parameters avl imei number or bus plate no';
   }else {

      let filters = {};
      if (imei) {
          filters['imei'] = parseInt(imei);
      }
	  let st_dt1 = datetime(sdt + " " + stm);
      let nd_dt1 = datetime(edt + " " + etm);
	  var date1 = new Date(st_dt1); // some mock date
	  var date2 = new Date(nd_dt1); // some mock date
      var st_dt = date1.getTime();
	  var nd_dt = date2.getTime(); 
	 // console.log(st_dt,'--',nd_dt);
	  filters['updatedon'] = {$gte: st_dt, $lte: nd_dt};

     

     // let hideOutputFields = getIgnoredFields();
      let data = dbCon.busRouts.find(filters);

      // let records = [];
      let trecords = [];
      await data.forEach(r => {
        let info = {};//r.data;
      info.a = r.imei;
      info.b = r.avltm;
      info.c = r.location.coordinates;
      info.f = r.alt;
      info.g = r.ang;
      info.h = r.spd;
      info.i = r.odata;
      info.k = r.updatedon;
	  info.l = r.pt;
      let device = {};
     /* if (r.device.length > 0) {
         device.n = r.device[0].busid;
         //device.o=r.device[0].license_ser_no;
         device.p = r.device[0].plate_no;
         // device.q=r.device[0].engplate_no;
         device.r = r.device[0].bus_oper_no;

         device.s = r.device[0].trnspt_comp_id;
         device.t = r.device[0].trnspt_comp_ar;
         device.u = r.device[0].trnspt_comp;

         //device.v=r.device[0].trkdevid;
         device.w = r.device[0].device_comp;
         device.x = r.device[0].avl_comp_id;
         device.y = r.device[0].avl_comp_ar;
         //device.z=r.device[0].avl_comp;

      }*/
      info.m = device;
      //  info.device = r.device.length > 0 ? r.device[0] : {};
      trecords.push(info);
      });
      //console.log('=====',records.length)
            if (trecords.length > 0) {
        
               // records = trecords;
              // let json1 = {status: 200, result: "success", data: trecords};
               res.send(trecords);
               return;
            } else {
		 status = 400;
         msg = 'AVL imei number not found';
		}
   }

   let json = {status: status, result: result, msg: msg};
   res.send(json);
};

exports.getTripDatalpt = async (req, res) => {
   let imei = req.query.imei;
   let src_geo = req.query.src_geo;
   let dest_geo = req.query.dest_geo;
   let sdt = req.query.start_dt;
   let stm = req.query.start_tm;
   let edt = req.query.end_dt;
   let etm = req.query.end_tm;

   let status = 404;
   let result = 'error';
   let msg = '';

   
	   
   if (!imei) {
      msg = 'Please provide valid imei number';
   } else if (!src_geo) {
      msg = 'Please src geofence code';
   } else if (!dest_geo) {
      msg = 'Please dest geofence code';
   }else if (!sdt || !stm) {
      msg = 'Please provide start datetime';
   } else if (!edt || !etm) {
      msg = 'Please provide end datetime';
   } else {
      var st_dt = datetime(sdt + " " + stm);
      var nd_dt = datetime(edt + " " + etm);
      // console.log(st_dt, '---', nd_dt);
      if (!st_dt || !nd_dt || st_dt < 0 || nd_dt < 0) {
         msg = 'Please check start and end date time';
      } else {

         let filters = {};
         filters['pt'] = src_geo;
		 filters['imei'] = parseInt(imei);
		 let st_dt1 = datetime(sdt + " " + stm);
      let nd_dt1 = datetime(edt + " " + etm);
	  var date1 = new Date(st_dt1); // some mock date
	  var date2 = new Date(nd_dt1); // some mock date
      st_dt = date1.getTime(); 
	  nd_dt = date2.getTime(); //9000000
         filters['updatedon'] = {$gte: st_dt, $lte: nd_dt};
         let data = dbCon.busRouts.find(filters);
         let records = [];
         await data.forEach(r => {
		      var a=[];
			  var m = new Date(r.updatedon);
			  var dt=m.toLocaleString();
              a.push(''+r.updatedon+'');//1
			  a.push(dt);//1
              a.push(''+src_geo+'');//2
			  a.push(r.location.coordinates);//2
              records.push(a);
         });
		 
		 filters = {};
         filters['pt'] = dest_geo;
		 filters['imei'] = parseInt(imei);
         filters['updatedon'] = {$gte: st_dt, $lte: nd_dt};
         data = dbCon.busRouts.find(filters);
		 await data.forEach(r => {
			var a=[];
			  var m = new Date(r.updatedon);
			  var dt=m.toLocaleString();
              a.push(''+r.updatedon+'');//1
			  a.push(dt);//1
              a.push(''+dest_geo+'');//2
			  a.push(r.location.coordinates);//2
              records.push(a);
         });
		 
		 
		  filters = {};
         filters['lpt'] = src_geo;
		 filters['imei'] = parseInt(imei);
         filters['lpttm'] = {$gte: st_dt, $lte: nd_dt};
         data = dbCon.busRouts.find(filters);
		 await data.forEach(r => {
			var a=[];
			  var m = new Date(r.updatedon);
			  var dt=m.toLocaleString();
              a.push(''+r.updatedon+'');//1
			  a.push(dt);//1
              a.push(''+src_geo+'');//2
			  a.push(r.location.coordinates);//2
              records.push(a);
         });
		 
		 filters = {};
         filters['lpt'] = dest_geo;
		 filters['imei'] = parseInt(imei);
         filters['lpttm'] = {$gte: st_dt, $lte: nd_dt};
         data = dbCon.busRouts.find(filters);
		 await data.forEach(r => {
			var a=[];
			  var m = new Date(r.updatedon);
			  var dt=m.toLocaleString();
              a.push(''+r.updatedon+'');//1
			  a.push(dt);//1
              a.push(''+dest_geo+'');//2
			  a.push(r.location.coordinates);//2
              records.push(a);
         });
		

         if (records.length > 0) {
			 let pos=0;
			 records.sort((a, b) => a[pos].localeCompare(b[pos]));
			 
			 let cnt=0;
			 let cnt1=0;
			 let cnt2=0;
			 let i=0;
			/* await records.forEach(r => {
				 
				 if(r.includes(src_geo)){
					 if(i==0){
					 i=1;
					 }
				 else if(i==2)
					 i=3;
					 cnt1++;
				 }
				 else if(r.includes(dest_geo)){
					 if(i==1){
					 i=2;
					 cnt2++;
					 }
				 }
				 if(i==3){
				 cnt++;
				 i=1;
				 }
					 
			 });*/
			 let json1 = {status: 200, result: "success", imei: imei,trip_cnt:cnt,trip_cnt_src_to_dest:cnt1,trip_cnt_dest_to_src:cnt2,data:records};
            res.send(json1);
            return;
         } else {
            status = 401;
            result = 'success';
            msg = 'No Record';
         }
      }
   }
   let json = {status: status, result: result, msg: msg};
   res.send(json);
};

exports.getTripData = async (req, res) => {
   let imei = req.query.imei;
   let src_geo = req.query.src_geo;
   let dest_geo = req.query.dest_geo;
   let sdt = req.query.start_dt;
   let stm = req.query.start_tm;
   let edt = req.query.end_dt;
   let etm = req.query.end_tm;

   let status = 404;
   let result = 'error';
   let msg = '';

   
	   
   if (!imei) {
      msg = 'Please provide valid imei number';
   } else if (!src_geo) {
      msg = 'Please src geofence code';
   } else if (!dest_geo) {
      msg = 'Please dest geofence code';
   }else if (!sdt || !stm) {
      msg = 'Please provide start datetime';
   } else if (!edt || !etm) {
      msg = 'Please provide end datetime';
   } else {
      var st_dt = datetime(sdt + " " + stm);
      var nd_dt = datetime(edt + " " + etm);
      // console.log(st_dt, '---', nd_dt);
      if (!st_dt || !nd_dt || st_dt < 0 || nd_dt < 0) {
         msg = 'Please check start and end date time';
      } else {
//let filters={{$or:[{'lpt': src_geo}, {'lpt': dest_geo}]}};
         let filters = {$or: [{'lpt': src_geo}, {'lpt': dest_geo}]};
		 
		// 
       //  filters['lpt'] = src_geo;
		 filters['imei'] = parseInt(imei);
		 let st_dt1 = datetime(sdt + " " + stm);
      let nd_dt1 = datetime(edt + " " + etm);
	  var date1 = new Date(st_dt1); // some mock date
	  var date2 = new Date(nd_dt1); // some mock date
      st_dt = date1.getTime(); 
	  nd_dt = date2.getTime(); //9000000
         filters['lpttm'] = {$gte: st_dt, $lte: nd_dt};
		// filters['$or'] = ;
		 //console.log('---', filters);
         let data = dbCon.busRouts.find(filters);
         let records = [];
         await data.forEach(r => {
			//let info = {};//r.data;
		//	info.pt = r.pt;
			//info.imei = r.imei;
			//info.updatedon = r.updatedon;
          //  records.push(info);
		      var a=[];
			  var m = new Date(r.lpttm);
			  var dt=m.toLocaleString();
			  var m1 = new Date(r.updatedon);
			  var dt1=m1.toLocaleString();
             /// a.push(''+r.imei+'');//0
              a.push(''+r.lpttm+'');//1
			  a.push(dt);//1
			  a.push(''+r.updatedon+'');//1
			  a.push(dt1);//1
              a.push(''+r.lpt+'');//2
			  if(r.lpt.indexOf(src_geo)>=0){
				 a.push(''+src_geo+'');//2 
			  }else 
				  a.push(''+dest_geo+'');//2 
			  //a.push(''+r.avltm+'');//1
			  a.push(''+r.du+'');//1
			 // a.push(''+r.pt+'');//1
			   
			//  a.push(r.pt);//2
			  a.push(r.location.coordinates);//2
			//  a.push(''+r.lpt+'');//2
			//  a.push(''+r.du+'');//2
              records.push(a);
         });
		 
		

         if (records.length > 0) {
			 var rec=calculateTripCount(imei,records,src_geo,dest_geo);
			// let pos=0;
			// records.sort((a, b) => a[pos].localeCompare(b[pos]));
			 
		/*	 let cnt=0;
			 let cnt1=0;
			 let cnt2=0;
			 let i=0;
			 await records.forEach(r => {
				 
				 if(r.includes(src_geo)){
					 if(i==0){
					 i=1;
					 }
				 else if(i==2)
					 i=3;
					 cnt1++;
				 }
				 else if(r.includes(dest_geo)){
					 if(i==1){
					 i=2;
					 cnt2++;
					 }
				 }
				 if(i==3){
				 cnt++;
				 i=1;
				 }
					 
			 });*/
			 //let json1 = {status: 200, result: "success", imei: imei,trip_cnt:cnt,trip_cnt_src_to_dest:cnt1,trip_cnt_dest_to_src:cnt2,data:records};
            res.send(rec);
            return;
         } else {
            status = 401;
            result = 'success';
            msg = 'No Record';
         }
      }
   }
   let json = {status: status, result: result, msg: msg};
   res.send(json);
};


exports.getListBusesStayGeofenceTimePeriod = async (req, res) => {
   let imei = req.query.imei;
   let geocode = req.query.geocode;
   let sdt = req.query.start_dt;
   let stm = req.query.start_tm;
   let edt = req.query.end_dt;
   let etm = req.query.end_tm;

   let status = 400;
   let result = 'error';
   let msg = '';

   if (!imei) {
      msg = 'Please AVL imei number';
   } else if (!geocode) {
      msg = 'Please provide geofence code';
   } else if (!sdt || !stm) {
      msg = 'Please provide start datetime';
   } else if (!edt || !etm) {
      msg = 'Please provide end datetime';
   } else {
      let st_dt = datetime(sdt + " " + stm);
      let nd_dt = datetime(edt + " " + etm);
      // console.log(st_dt, '---', nd_dt);
      if (!st_dt || !nd_dt || st_dt < 0 || nd_dt < 0) {
         msg = 'Please check start and end date time';
      } else {

         let filters = {};
         filters['lpt'] = geocode;
         filters['imei'] = parseInt(imei);
         filters['updatedon'] = {$gte: st_dt, $lte: nd_dt};
         //let hideOutputFields = getIgnoredFields();
         let data = dbCon.busRouts.find(filters);
         let records = [];
         await data.forEach(r => {
            // let duration = r.du;
            // let type = duration + ' Mil'; // millisecond
            // if (duration > 1000) {
            //    duration = duration / 1000; //sec
            //    type = duration + ' Sec';
            //    if (duration >= 60) {
            //       duration = Math.round(duration / 60); //min
            //       type = duration + ' Min';
            //    }
            // }
            //records.push(type);
            delete r._id; // do not send id
            records.push(r);
         });

         if (records.length > 0) {
            let json1 = {status: 200, result: "success", data: records};
            res.send(json1);
            return;
         } else {
            status = 404;
            result = 'success';
            msg = 'No Record';
         }
      }
   }
   let json = {status: status, result: result, msg: msg};
   res.send(json);
};

exports.getListBusesGeofenceTimePeriod = async (req, res) => {
  // let imei = req.query.imei;
   let geocode = req.query.geocode;
   let sdt = req.query.start_dt;
   let stm = req.query.start_tm;
   let edt = req.query.end_dt;
   let etm = req.query.end_tm;

   let status = 404;
   let result = 'error';
   let msg = '';

   
	   
   if (!geocode) {
      msg = 'Please provide geofence code';
   } else if (!sdt || !stm) {
      msg = 'Please provide start datetime';
   } else if (!edt || !etm) {
      msg = 'Please provide end datetime';
   } else {
      let st_dt = datetime(sdt + " " + stm);
      let nd_dt = datetime(edt + " " + etm);
      // console.log(st_dt, '---', nd_dt);
      if (!st_dt || !nd_dt || st_dt < 0 || nd_dt < 0) {
         msg = 'Please check start and end date time';
      } else {

         let filters = {};
         filters['pt'] = geocode;
         //filters['imei'] = parseInt(imei);
         filters['updatedon'] = {$gte: st_dt, $lte: nd_dt};
         //let hideOutputFields = getIgnoredFields();
         let data = dbCon.busRouts.find(filters);
         let records = [];
         await data.forEach(r => {
            // let duration = r.du;
            // let type = duration + ' Mil'; // millisecond
            // if (duration > 1000) {
            //    duration = duration / 1000; //sec
            //    type = duration + ' Sec';
            //    if (duration >= 60) {
            //       duration = Math.round(duration / 60); //min
            //       type = duration + ' Min';
            //    }
            // }
            //records.push(type);
            delete r._id; // do not send id
            records.push(r);
         });

         if (records.length > 0) {
            let json1 = {status: 200, result: "success", data: records};
            res.send(json1);
            return;
         } else {
            status = 401;
            result = 'success';
            msg = 'No Record';
         }
      }
   }
   let json = {status: status, result: result, msg: msg};
   res.send(json);
};



function datetime(dateString) {
//var dateString = "23/09/2014 - 09:15"
   let dateArgs = dateString.match(/\d{2,4}/g);
   let year = dateArgs[2];
   let month = parseInt(dateArgs[1]) - 1;
   let day = dateArgs[0];
   let hour = dateArgs[3];
   let minutes = dateArgs[4];
   let milliseconds = new Date(year, month, day, hour, minutes).getTime();
   return milliseconds;
}


exports.getBusStatus = async (req, res) => {
   let plate_no = req.query.plate_no;
   let engplate_no = req.query.engplate_no;
   let imei = req.query.imei;
   let ask = req.query.min;
   let lat = req.query.lat;
   let lng = req.query.lng;
   let accuracy = req.query.accuracy;
   let status = 404;
   let result = 'error';
   let msg = '';

   if ((!imei || isNaN(imei)) && !plate_no && !engplate_no) {
      msg = 'Invalid input parameters avl imei number or bus plate no';
   } else if (!ask || isNaN(ask)) {
      msg = 'Invalid x minutes value';
   } else if (!lat || isNaN(lat)) {
      msg = 'Invalid latitude value';
   } else if (!lng || isNaN(lng)) {
      msg = 'Invalid longitude value';
   } else if (!accuracy || isNaN(accuracy)) {
      msg = 'Invalid Accuracy area value';
   } else {

      let filters = {};
      if (imei) {
         filters['data.imei'] = parseInt(imei);
      }

      if (plate_no) {
         filters['device.plate_no'] = plate_no;
      }

      if (engplate_no) {
         filters['device.engplate_no'] = engplate_no;
      }

      let hideOutputFields = getIgnoredFields();
      let data = dbCon.gpsLiveDevices.find(filters).project(hideOutputFields);

      // let records = [];
      let trecords = [];
      await data.forEach(r => {
         let info = r.data;
         info.device = r.device.length > 0 ? r.device[0] : {};
         trecords.push(info);
      });
      //console.log('=====',records.length)
      if (trecords.length > 0) {
         let minBefore = req.query.min ? req.query.min : 10;//default 10 min
         let milisecBefore = minBefore * 60 * 1000; //milliseconds
         let currentTime = Date.now();
         let oldTime = currentTime - milisecBefore;
         let utm = trecords[0].updatedon;
         if (utm > oldTime && utm <= currentTime) {
            let dis = distanceInM(trecords[0].location.coordinates[1], trecords[0].location.coordinates[0], lat, lng);
            if (dis <= accuracy) {
               // records = trecords;
               let json1 = {status: 200, result: "success", data: trecords};
               res.send(json1);
               return;
            } else {
				status = 402;
               msg = 'No bus available with in ' + accuracy + ' meters area';
            }

         } else {
			 status = 401;
            msg = 'No bus available with in ' + minBefore + ' minutes';
         }

      } else {
		 status = 400;
         msg = 'AVL imei number or Bus plate no not found';
      }
   }

   let json = {status: status, result: result, msg: msg};
   res.send(json);
};


function distanceInM(lat1, lon1, lat2, lon2) {
   if ((lat1 == lat2) && (lon1 == lon2)) {
      return 0;
   }
   else {
      let radlat1 = Math.PI * lat1 / 180;
      let radlat2 = Math.PI * lat2 / 180;
      let theta = lon1 - lon2;
      let radtheta = Math.PI * theta / 180;
      let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
      if (dist > 1) {
         dist = 1;
      }
      dist = Math.acos(dist);
      dist = dist * 180 / Math.PI;
      dist = dist * 60 * 1.1515;
      dist = dist * 1.609344 * 1000;
      return dist;
   }
}


exports.getGeofenceDevice = async (req, res) => {
   let imei = req.query.imei;
   let busid = req.query.busid;
   let avlComp = req.query.avl_comp;
   let transComp = req.query.trans_comp;
   let deviceComp = req.query.device_comp;

   let filters = {};
   if (imei) {
      filters['data.imei'] = parseInt(imei);
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
   //console.log('filters',filters)
   let data = dbCon.gpsLiveDevices.find(filters);
   // let data = dbCon.gpsLive.find(filters, {_id: 0, 'data._id': 0});
   let records = [];
   await data.forEach(r => {
      //combine data and device info
      let info = {};//r.data;
      info.l = r.data.pt;

      if (r.data.pt != null && r.data.pt.length > 0) {
         info.a = r.data.imei;
         info.b = r.data.avltm;
         info.c = r.data.location.coordinates;
         info.f = r.data.alt;
         info.g = r.data.ang;
         info.h = r.data.spd;
         info.i = r.data.odata;
         info.k = r.data.updatedon;
		 info.l = r.data.pt;


         let device = {};
         if (r.device.length > 0) {
            device.n = r.device[0].busid;
            //device.o=r.device[0].license_ser_no;
            device.p = r.device[0].plate_no;
            // device.q=r.device[0].engplate_no;
            device.r = r.device[0].bus_oper_no;

            device.s = r.device[0].trnspt_comp_id;
            device.t = r.device[0].trnspt_comp_ar;
            device.u = r.device[0].trnspt_comp;

            //device.v=r.device[0].trkdevid;
            device.w = r.device[0].device_comp;
            device.x = r.device[0].avl_comp_id;
            device.y = r.device[0].avl_comp_ar;
            //device.z=r.device[0].avl_comp;

         }
         info.m = device;
         //  info.device = r.device.length > 0 ? r.device[0] : {};
         records.push(info);
      }
   });
   // console.log(data)
   res.send(records);
};

exports.getImeisData1 = async (req, res) => {
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
//   console.log('filters', filters)
   let data = dbCon.gpsLiveDevices.find(filters);
   // let data = dbCon.gpsLive.find(filters, {_id: 0, 'data._id': 0});
   let records = [];
   await data.forEach(r => {
      //combine data and device info
      let info = {};//r.data;
      info.a = r.data.imei;
      info.b = r.data.avltm;
      info.c = r.data.location.coordinates;
      info.f = r.data.alt;
      info.g = r.data.ang;
      info.h = r.data.spd;
      info.i = r.data.odata;
      info.k = r.data.updatedon;
      let device = {};
      if (r.device.length > 0) {
         device.n = r.device[0].busid;
         //device.o=r.device[0].license_ser_no;
         device.p = r.device[0].plate_no;
         // device.q=r.device[0].engplate_no;
         device.r = r.device[0].bus_oper_no;

         device.s = r.device[0].trnspt_comp_id;
         device.t = r.device[0].trnspt_comp_ar;
         device.u = r.device[0].trnspt_comp;

         //device.v=r.device[0].trkdevid;
         device.w = r.device[0].device_comp;
         device.x = r.device[0].avl_comp_id;
         device.y = r.device[0].avl_comp_ar;
         //device.z=r.device[0].avl_comp;

      }
      info.m = device;
      //  info.device = r.device.length > 0 ? r.device[0] : {};
      records.push(info);
   });
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


   let company_list = [];
   let trans_comp_list = [];
   let company_list_ar = [];
   let trans_comp_list_ar = [];

   await data.forEach(r => {

      let cnm = r.avl_comp;
      if (company_list.indexOf(cnm) === -1) {
         company_list.push(cnm);
         company_list_ar.push({'id': r.avl_comp_id, 'name': r.avl_comp_ar});
      }

      cnm = r.trnspt_comp;
      if (trans_comp_list.indexOf(cnm) === -1) {
         trans_comp_list.push(cnm);
         trans_comp_list_ar.push({'id': r.trnspt_comp_id, 'name': r.trnspt_comp_ar});
      }
   });

   records.push({'comp_ar': company_list_ar, 'trans_ar': trans_comp_list_ar});

   res.send(records);
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

function getIgnoredFields1() {
   let hideOutputFields = { // comment out any fields if you need it in result/output
      '_id': 0,
      'imei': 0,
      'lpttm': 0,
      'lpt': 0,
      'du': 0,
      'createdon': 0,
      'pt': 0,
      'odata': 0,
	  'alt': 0,
      'ang': 0,
      'spd': 0
   };
   return hideOutputFields;
}

function getIgnoredFields2() {
   let hideOutputFields = { // comment out any fields if you need it in result/output
      '_id': 0,
      'lpttm': 0,
      'lpt': 0,
      'du': 0,
      'createdon': 0,
      'pt': 0,
      'odata': 0,
	  'alt': 0,
      'ang': 0,
      'spd': 0,
	  'location':0
	  
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
   let data = dbCon.geoFences.find(query, {_id: 0, properties: 1, attributes: 1});
   let records = [];

   await data.forEach(r => {
      records.push(r.properties || r.attributes);
   });

   res.send(records);
};
