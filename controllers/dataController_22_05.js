/**************************
 * Description:
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


exports.getAvgRTTAllBussesTimePeriod = async (req, res) => {
	
};
exports.getAvgTTAllBussesTimePeriod = async (req, res) => {
let src_geo = req.query.src_geo;
   let dest_geo = req.query.dest_geo;
   let sdt = req.query.start_dt;
   let stm = req.query.start_tm;
   let edt = req.query.end_dt;
   let etm = req.query.end_tm;

   let status = 400;
   let result = 'error';
   let msg = '';

   if (!src_geo) {
      msg = 'Please src geofence code';
   } else if (!dest_geo) {
      msg = 'Please dest geofence code';
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
         let filters = {$or: [{'lpt': src_geo}, {'lpt': dest_geo}]};
         let st_dt1 = datetime(sdt + " " + stm);
         let nd_dt1 = datetime(edt + " " + etm);
         let date1 = new Date(st_dt1); // some mock date
         let date2 = new Date(nd_dt1); // some mock date
         st_dt = date1.getTime();
         nd_dt = date2.getTime(); //9000000
         filters['lpttm'] = {$gte: st_dt, $lte: nd_dt};
         let data = dbCon.busRouts.find(filters);
         let records = [];
         let imeis = [];
         await data.forEach(r => {

            let a = [];
            let m = new Date(r.lpttm);
            let dt = m.toLocaleString();
            let m1 = new Date(r.updatedon);
            let dt1 = m1.toLocaleString();
            a.push('' + r.imei + '');//0
            a.push('' + r.lpttm + '');//1
            a.push(dt);//1
            a.push('' + r.updatedon + '');//1
            a.push(dt1);//1
            a.push('' + r.lpt + '');//2
            if (r.lpt.indexOf(src_geo) >= 0) {
               a.push('' + src_geo + '');
            } else {
               a.push('' + dest_geo + '');
            }
            if (!imeis.includes('' + r.imei + '')) {
               imeis.push('' + r.imei + '');
            }
            records.push(a);
         });
         let records_all = [];
		 let totalTrip = 0;
		 let totalTrip_s_to_d = 0;
		 let totalTrip_d_to_s = 0;
         if (imeis.length > 0) {
            await imeis.forEach(im => {
               let records1 = [];
               records.forEach(r => {
                  if (r.includes(im)) {
                     records1.push(r);
                  }
               });
               let rec = calculateTripCount_3(im, records1, src_geo, dest_geo);
			   if(rec!=null)
               records_all.push(rec);
            });
			
			res.send(records_all);
			return;
         }
         
      }
   }
   let json = {status: status, result: result, msg: msg};
   res.send(json);
};


function calculateTripCount_3(im, records, src_geo, dest_geo) {
	let a=[];
   if (records.length > 1) {
      let cnt = 0;
      let cnt1 = 0;
      let cnt2 = 0;
      let i = 0;	  
	  let c=0;	  
      records.forEach(r => {
		  c++;
         if (r.includes(src_geo)) {
            if (i == 0) {
			   let j={endTime:r[3],startTime:100,src_code:src_geo,dest_code:dest_geo};
			   a.push(j);
               i = 1;
			   cnt1++;
            } else if (i == 2) {
				a[a.length-1].startTime=r[1];
				let j={endTime:r[3],startTime:101,src_code:src_geo,dest_code:dest_geo};
			    a.push(j);
                i = 3;
			    cnt1++;
            }
            
         }
         else if (r.includes(dest_geo)) {
            if (i == 1) {
			   a[a.length-1].startTime=r[1];
			   if(records.length>c){
			   let j={endTime:r[3],startTime:102,src_code:dest_geo,dest_code:src_geo};
			   a.push(j);
			   i = 2;
               cnt2++;
			   }
          }
         }
         if (i == 3) {	
            cnt++;
            i = 1;
         }
      });
	  
	  c=0;
	  let tm_s_to_d=0;
	  let tm_d_to_s=0;
	  a.forEach(r => {
		  if(r.startTime==101){
			  a.splice(c,1);
			  cnt2--;
		  }else if(r.startTime==102){
			  a.splice(c,1);
			  cnt2--;
		  }else if(r.src_code==src_geo){
		  tm_s_to_d+=parseInt(r.endTime-r.startTime);
		  }else if(r.src_code==dest_geo){
		  tm_d_to_s+=parseInt(r.endTime-r.startTime);
		  }
		  
		  
		  c++;
		  
	  });
	  
	  if(cnt1>0 || cnt2>0){
	  let avgtm_s_to_d=0;
	  if(cnt1>0)
		  avgtm_s_to_d=parseInt(tm_s_to_d/cnt1/1000);
	  let avgtm_d_to_s=0;
	  if(cnt2>0)
		  avgtm_d_to_s=parseInt(tm_d_to_s/cnt2/1000);
      let json1 = {imei: im, AverageTripTimeSrc_to_Dest: avgtm_s_to_d, AverageTripTimeDest_to_Src: avgtm_d_to_s,data:a};
      return json1;
	  }
   }

  // let json = {imei: im, trip_cnt_src_to_dest: 0, trip_cnt_dest_to_src: 0, data: a};
   return null;
}
/*
function calculateTripCount_3a(im, records, src_geo, dest_geo) {
	let len=records.length;
   if (len > 0) {
      let cnt = 0;
      let cnt1 = 0;
      let cnt2 = 0;
      let i = 0;
      records.forEach(r => {

         if (r.includes(src_geo)) {
            if (i == 0) {
               i = 1;
            } else if (i == 2) {
               i = 3;
            }
            cnt1++;
         }
         else if (r.includes(dest_geo)) {
            if (i == 1) {
               i = 2;
               cnt2++;
            }
         }
         if (i == 3) {
            cnt++;
            i = 1;
         }

      });
	  
	  if(cnt>0){
	  let TotalTimeTaken=parseInt((records[0][1]-records[len-1][1])/1000); 
	  let avgTimeTaken=parseInt(TotalTimeTaken/cnt); 
      let json1 = {imei: im, AverageRoundTripTime:avgTimeTaken};
      return json1;
	  }
   }

 
   return null;
}*/

exports.getAtleastOneRoundListTimePeriod = async (req, res) => {
let src_geo = req.query.src_geo;
   let dest_geo = req.query.dest_geo;
   let sdt = req.query.start_dt;
   let stm = req.query.start_tm;
   let edt = req.query.end_dt;
   let etm = req.query.end_tm;

   let status = 400;
   let result = 'error';
   let msg = '';

   if (!src_geo) {
      msg = 'Please src geofence code';
   } else if (!dest_geo) {
      msg = 'Please dest geofence code';
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
         let filters = {$or: [{'lpt': src_geo}, {'lpt': dest_geo}]};
         let st_dt1 = datetime(sdt + " " + stm);
         let nd_dt1 = datetime(edt + " " + etm);
         let date1 = new Date(st_dt1); // some mock date
         let date2 = new Date(nd_dt1); // some mock date
         st_dt = date1.getTime();
         nd_dt = date2.getTime(); //9000000
         filters['lpttm'] = {$gte: st_dt, $lte: nd_dt};
         let data = dbCon.busRouts.find(filters);
         let records = [];
         let imeis = [];
         await data.forEach(r => {

            let a = [];
        
            a.push('' + r.imei + '');//0
            a.push('' + r.lpttm + '');//1
            a.push('' + r.updatedon + '');//1
            a.push('' + r.lpt + '');//2
            if (r.lpt.indexOf(src_geo) >= 0) {
               a.push('' + src_geo + '');
            } else {
               a.push('' + dest_geo + '');
            }
            if (!imeis.includes('' + r.imei + '')) {
               imeis.push('' + r.imei + '');
            }
            records.push(a);
         });
         let records_all = [];
		 let totalTrip = 0;
		 let totalTrip_s_to_d = 0;
		 let totalTrip_d_to_s = 0;
         if (imeis.length > 0) {
            await imeis.forEach(im => {
               let records1 = [];
               records.forEach(r => {
                  if (r.includes(im)) {
                     records1.push(r);
                  }
               });
               let rec = calculateTripCount_2(im, records1, src_geo, dest_geo);
			   if(rec!=null)
               records_all.push(rec);
            });
			
			res.send(records_all);
			return;
         }
         
      }
   }
   let json = {status: status, result: result, msg: msg};
   res.send(json);
};

function calculateTripCount_2(im, records, src_geo, dest_geo) {
	let len=records.length;
   if (len > 0) {
      let cnt = 0;
      let cnt1 = 0;
      let cnt2 = 0;
      let i = 0;
      records.forEach(r => {

         if (r.includes(src_geo)) {
            if (i == 0) {
               i = 1;
            } else if (i == 2) {
               i = 3;
            }
            cnt1++;
         }
         else if (r.includes(dest_geo)) {
            if (i == 1) {
               i = 2;
               cnt2++;
            }
         }
         if (i == 3) {
            cnt++;
            i = 1;
         }

      });
	  
	  if(cnt>0){
      let json1 = {imei: im, TotalRound:cnt};
      return json1;
	  }
   }

 
   return null;
}

exports.getTTforAllBussesTimePeriod = async (req, res) => {
   let src_geo = req.query.src_geo;
   let dest_geo = req.query.dest_geo;
   let sdt = req.query.start_dt;
   let stm = req.query.start_tm;
   let edt = req.query.end_dt;
   let etm = req.query.end_tm;

   let status = 400;
   let result = 'error';
   let msg = '';

   if (!src_geo) {
      msg = 'Please src geofence code';
   } else if (!dest_geo) {
      msg = 'Please dest geofence code';
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
         let filters = {$or: [{'lpt': src_geo}, {'lpt': dest_geo}]};
         let st_dt1 = datetime(sdt + " " + stm);
         let nd_dt1 = datetime(edt + " " + etm);
         let date1 = new Date(st_dt1); // some mock date
         let date2 = new Date(nd_dt1); // some mock date
         st_dt = date1.getTime();
         nd_dt = date2.getTime(); //9000000
         filters['lpttm'] = {$gte: st_dt, $lte: nd_dt};
         let data = dbCon.busRouts.find(filters);
         let records = [];
         let imeis = [];
         await data.forEach(r => {

            let a = [];
        
            a.push('' + r.imei + '');//0
            a.push('' + r.lpttm + '');//1
            a.push('' + r.updatedon + '');//1
            a.push('' + r.lpt + '');//2
            if (r.lpt.indexOf(src_geo) >= 0) {
               a.push('' + src_geo + '');
            } else {
               a.push('' + dest_geo + '');
            }
            if (!imeis.includes('' + r.imei + '')) {
               imeis.push('' + r.imei + '');
            }
            records.push(a);
         });
         let records_all = [];
		 let totalTrip = 0;
		 let totalTrip_s_to_d = 0;
		 let totalTrip_d_to_s = 0;
         if (imeis.length > 0) {
            await imeis.forEach(im => {
               let records1 = [];
               records.forEach(r => {
                  if (r.includes(im)) {
                     records1.push(r);
                  }
               });
               let rec = calculateTripCount_1(im, records1, src_geo, dest_geo);
			   totalTrip_s_to_d += rec.s_to_d;
			   totalTrip_d_to_s += rec.d_to_s;
               records_all.push(rec);
            });
			totalTrip=totalTrip_s_to_d+totalTrip_d_to_s;
			let x=[{Trips: totalTrip_s_to_d, src: src_geo,dest:dest_geo},{Trips: totalTrip_d_to_s, src: dest_geo,dest:src_geo}];
			let json1 = {ToalTrips: totalTrip,Trips:x,data:records_all};
			res.send(json1);
			return;
         }
         
      }
   }
   let json = {status: status, result: result, msg: msg};
   res.send(json);
};


function calculateTripCount_1(im, records, src_geo, dest_geo) {
	let len=records.length;
   if (len > 0) {
      //let pos=0;
      // records.sort((a, b) => a[pos].localeCompare(b[pos]));

      let cnt = 0;
      let cnt1 = 0;
      let cnt2 = 0;
      let i = 0;
      records.forEach(r => {

         if (r.includes(src_geo)) {
            if (i == 0) {
               i = 1;
            } else if (i == 2) {
               i = 3;
            }
            cnt1++;
         }
         else if (r.includes(dest_geo)) {
            if (i == 1) {
               i = 2;
               cnt2++;
            }
         }
         if (i == 3) {
            cnt++;
            i = 1;
         }

      });
	  let TotalTimeTaken=parseInt((records[0][1]-records[len-1][1])/1000);
      let json1 = {imei: im, s_to_d: cnt1, d_to_s: cnt2,TotalTimeTaken:TotalTimeTaken,TripStartTime:records[0][1],TripEndTime:records[len-1][1]};
      return json1;
   }

   let json = {imei: im, s_to_d: 0, d_to_s: 0,TripStartTime:0,TripEndTime:0};
   return json;
}


//API Spatial2
/** return Avg time on trip data for all IMEIs (buses)
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
exports.getAvgTimeBusLeavingTimePeriod = async (req, res) => {
   let src_geo = req.query.src_geo;
   let sdt = req.query.start_dt;
   let stm = req.query.start_tm;
   let edt = req.query.end_dt;
   let etm = req.query.end_tm;

   let status = 400;
   let result = 'error';
   let msg = '';

   if (!src_geo) {
      msg = 'Please src geofence code';
   } else if (!sdt || !stm) {
      msg = 'Please provide start datetime';
   } else if (!edt || !etm) {
      msg = 'Please provide end datetime';
   } else {
      let st_dt = datetime(sdt + " " + stm);
      let nd_dt = datetime(edt + " " + etm);

      if (!st_dt || !nd_dt || st_dt < 0 || nd_dt < 0) {
         msg = 'Please check start and end date time';
      } else {
         let filters = {'pt': src_geo};
         let st_dt1 = datetime(sdt + " " + stm);
         let nd_dt1 = datetime(edt + " " + etm);
         let date1 = new Date(st_dt1); // some mock date
         let date2 = new Date(nd_dt1); // some mock date
         st_dt = date1.getTime();
         nd_dt = date2.getTime(); 
         filters['updatedon'] = {$gte: st_dt, $lte: nd_dt};
         let data = dbCon.busRouts.find(filters);
         let records = [];
		 let records1 = [];
         let imeis = [];
		 
		 
		 
		
        
           
            
            
           
           
		 
		 
		 
         await data.forEach(r => {
        
		    let j = {imei: r.imei,timeLeaving:r.updatedon}; // in seconds
           
           
			
			records1.push(j);
            records.push(r.updatedon);
			
         });
		 let len=records.length;
		 let avgtime=0;
		 if(len>0){
		 let time=(records[0]-records[len-1]);
		 avgtime=parseInt(time/len/1000);
		 //console.log(records[len-1],'',records[0],time,'--',avgtime,' ',len);
		 }
		
               
         let json1 = {AvgerageTime: avgtime,data:records1}; // in seconds
         res.send(json1);
         return;

      }
   }
   let json = {status: status, result: result, msg: msg};
   res.send(json);
};


//API 1
/** return trip data for all IMEIs (buses)
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
exports.getTTCountTimePeriod = async (req, res) => {
   // let imei = req.query.imei;

   let sdt = req.query.start_dt;
   let stm = req.query.start_tm;
   let edt = req.query.end_dt;
   let etm = req.query.end_tm;

   let status = 400;
   let result = 'error';
   let msg = '';

   if (!sdt || !stm) {
      msg = 'Please provide start datetime';
   } else if (!edt || !etm) {
      msg = 'Please provide end datetime';
   } else {
      let st_dt = datetime(sdt + " " + stm);
      let nd_dt = datetime(edt + " " + etm);

      if (!st_dt || !nd_dt || st_dt < 0 || nd_dt < 0) {
         msg = 'Please check start and end date time';
      } else {
         let src_g = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9', 'P10', 'P11', 'P12', 'P13'];
         let dest_g = ['P11', 'P11', 'S3', 'S6', 'S5', 'S2', 'S6', 'S1', 'S3', 'S7', 'S4', 'S2', 'P6'];

         let filters = {
            $or: [{'lpt': src_g[0]}, {'lpt': dest_g[0]},
               {'lpt': src_g[1]},
               {'lpt': src_g[2]}, {'lpt': dest_g[2]},
               {'lpt': src_g[3]}, {'lpt': dest_g[3]},
               {'lpt': src_g[4]}, {'lpt': dest_g[4]},
               {'lpt': src_g[5]}, {'lpt': dest_g[5]},
               {'lpt': src_g[6]}, {'lpt': dest_g[6]},
               {'lpt': src_g[7]}, {'lpt': dest_g[7]},
               {'lpt': src_g[8]}, {'lpt': dest_g[8]},
               {'lpt': src_g[9]}, {'lpt': dest_g[9]},
               {'lpt': dest_g[10]},
               {'lpt': src_g[11]},
               {'lpt': src_g[12]}
            ]
         };


         let st_dt1 = datetime(sdt + " " + stm);
         let nd_dt1 = datetime(edt + " " + etm);
         let date1 = new Date(st_dt1); // some mock date
         let date2 = new Date(nd_dt1); // some mock date
         st_dt = date1.getTime();
         nd_dt = date2.getTime(); //9000000
         filters['lpttm'] = {$gte: st_dt, $lte: nd_dt};
         //console.log(filters);
         let data = dbCon.busRouts.find(filters);
         let records = [];
         //let imeis = [];
         await data.forEach(r => {

            let a = [];

            a.push('' + r.lpt + '');//2
            let ok = false;
            src_g.forEach(s => {
               if (r.lpt.indexOf(s) >= 0 && !ok) {
                  a.push(s);
                  ok = true;

               }

            });

            dest_g.forEach(s => {
               if (r.lpt.indexOf(s) >= 0 && !ok) {
                  a.push(s);
                  ok = true;

               }

            });

            records.push(a);
         });

         let records_all = [];
         let totalTrip = 0;
         for (let i = 0; i < src_g.length; i++) {
            let rec = calculateAllTripCount(records, src_g[i], dest_g[i]);
            totalTrip += rec.RoundTrip;
            records_all.push(rec);
         }
         let json1 = {TotalRoundTrip: totalTrip, data: records_all};
         res.send(json1);
         return;

      }
   }
   let json = {status: status, result: result, msg: msg};
   res.send(json);
};

function calculateAllTripCount(records, src_geo, dest_geo) {
   let len = records.length;

   if (len > 0) {
      let cnt = 0;
      let cnt1 = 0;
      let cnt2 = 0;
      let i = 0;

      records.forEach(r => {

         if (r.includes(src_geo)) {
            if (i == 0) {
               i = 1;

            } else if (i == 2) {
               i = 3;

            }
            cnt1++;
         }
         else if (r.includes(dest_geo)) {
            if (i == 1) {
               i = 2;
               cnt2++;
            }
         }
         if (i == 3) {
            cnt++;
            i = 1;
         }
      });

      return {src_geo: src_geo, dest_geo: dest_geo, RoundTrip: cnt};
   }
   return 0;
}

/**
 * Get All IMEIs which are sending data to a port
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
exports.getAllImeis = async (req, res) => {
   let port = req.query.port;
   let status = 400;
   let result = 'error';
   let msg = '';
   if (port && isNaN(port)) {
      msg = 'Invalid port number';
   }

   let filter = {};
   if (port) {
      filter['data.odata'] = parseInt(port); //convert to int
   }
   let records = [];
   records = await dbCon.gpsLive.find(filter).project({_id: 0, 'data.imei': 1, 'data.odata': 1}).toArray();
   // await data.forEach(r => {
   //    records.push(r);
   // });
   if (records.length > 0) {
      res.send({status: 200, result: "success", data: records});
      return;
   } else {
      status = 404;
      msg = 'No record';
   }
   let json = {status: status, result: result, msg: msg};
   res.send(json);
};

// API 33
/**
 * Get All inconsistent Record with time period for a given date time and imei
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
exports.getDelayBetweenReadingsTimePeriod = async (req, res) => {
   let minits = req.query.min; // difference between 2 consecutive records
   let imei = req.query.imei;
   let sdt = req.query.start_dt;
   let stm = req.query.start_tm;
   let edt = req.query.end_dt;
   let etm = req.query.end_tm;
   let status = 400;
   let result = 'error';
   let msg = '';
   if (!imei || isNaN(imei)) {
      msg = 'Invalid input parameter imei';
   }
   else if (!minits || isNaN(minits)) {
      msg = 'Invalid input parameter x minutes';
   } else if (!sdt || !stm) {
      msg = 'Please provide start datetime';
   } else if (!edt || !etm) {
      msg = 'Please provide end datetime';
   }
   else {
      minits = parseInt(minits); //convert to int
      let st_dt1 = datetime(sdt + " " + stm);
      let nd_dt1 = datetime(edt + " " + etm);
      let date1 = new Date(st_dt1); // some mock date
      let date2 = new Date(nd_dt1); // some mock date
      let st_dt = date1.getTime();
      let nd_dt = date2.getTime();
      if (!st_dt || !nd_dt || st_dt < 0 || nd_dt < 0) {
         msg = 'Please check start and end date time';
      } else {
         let days = (date2 - date1) / (24 * 60 * 60 * 1000);

         console.log('request data end date', date2, 'start date', date1, 'days', days, 'min', minits);

         if (days > 1) {
            res.send({status: 400, result: result, msg: "This API can query data only for a day or less"});
            return;
         }
         let records = [];
         // let imeisArr = await dbCon.gpsLive.find().project({_id: 0, 'data.imei': 1}).toArray();
         //  console.log("total imeis", imeisArr.length);
         //for (let d of imeisArr) {
         let data = await dbCon.gpsHistory.aggregate([
            // {
            //    $match: {
            //       "updatedon": // filter out all items that are inside a range (or rather: include only the outer items of each range)
            //          {$gte: st_dt, $lte: nd_dt}
            //    }
            // },
            // //{$sort: {"imei": -1}},
            // {
            //    $group: {
            //       _id: "$imei", max_time: {$max: "$updatedon"}, min_time: {$min: "$updatedon"}
            //    }
            // },
            // {
            //    $set: {
            //       difference: {$divide: [{$subtract: ["$max_time", "$min_time"]}, 60 * 1000]}// get difference in minits
            //    }
            // },
            // {
            //    $match: {// filter out all items that are inside a range (or rather: include only the outer items of each range)
            //       difference: {$gte: minits}
            //    }
            // }
            {
               $match: {
                  imei: parseInt(imei),
                  //odata:parseInt(imei),
                  updatedon: {
                     $gte: st_dt,
                     $lte: nd_dt
                  }
               }
            },
            {
               $setWindowFields: {
                  partitionBy: "$imei",
                  sortBy: {updatedon: 1},
                  output: {
                     prev: {
                        $first: "$avltm",
                        window: {documents: [-1, 0]}
                     }
                  }
               }
            },
            {
               $match: {
                  $expr: {
                     $gte: [
                        {$divide: [{$subtract: ["$avltm", "$prev"]}, 60000]},
                        minits
                     ]
                  }
               }
            },
            //{$group: {_id: "$imei"}},
            {$project: {"_id": 0, imei: 1, avltm: 1, odata: 1, spd: 1, prev: 1, createdon: 1}} //output fields
         ]);
         //console.log('found', records.length)
         await data.forEach(r => {
            let info = {};
			info.imei = r.imei;
			info.avltmRecord1 = r.prev;
			info.avltmRecord2 = r.avltm;
			info.difference = (r.avltm-r.prev);
            records.push(info);
         });
         if (records.length > 0) {
            res.send({status: 200, result: "success", data: records});
            return;
         } else {
            status = 404;
            msg = 'No record';
         }
      }
   }
   let json = {status: status, result: result, msg: msg};
   res.send(json);
};


//API 4_ACTUAL
/** return trip data for all IMEIs (buses)
 * @param req
 * @param res
 * [{“imei”:863211324242, “TotalTimeTaken”:4, “RoundStartTime” : 1679901877000, “RoundEndTime” : 1679901877000}]
 * @returns {Promise<void>}
 */
exports.getRTTforAllBussesTimePeriod = async (req, res) => {
   // let imei = req.query.imei;
   let src_geo = req.query.src_geo;
   let dest_geo = req.query.dest_geo;
   let sdt = req.query.start_dt;
   let stm = req.query.start_tm;
   let edt = req.query.end_dt;
   let etm = req.query.end_tm;

   let status = 400;
   let result = 'error';
   let msg = '';

   if (!src_geo) {
      msg = 'Please src geofence code';
   } else if (!dest_geo) {
      msg = 'Please dest geofence code';
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
         let filters = {$or: [{'lpt': src_geo}, {'lpt': dest_geo}]};
         let st_dt1 = datetime(sdt + " " + stm);
         let nd_dt1 = datetime(edt + " " + etm);
         let date1 = new Date(st_dt1); // some mock date
         let date2 = new Date(nd_dt1); // some mock date
         st_dt = date1.getTime();
         nd_dt = date2.getTime(); //9000000
         filters['lpttm'] = {$gte: st_dt, $lte: nd_dt};
         let data = dbCon.busRouts.find(filters);
         let records = [];
         let imeis = [];
         await data.forEach(r => {

            let a = [];
            let m = new Date(r.lpttm);
            let dt = m.toLocaleString();
            let m1 = new Date(r.updatedon);
            let dt1 = m1.toLocaleString();
            a.push('' + r.imei + '');//0
            a.push('' + r.lpttm + '');//1
            a.push(dt);//1
            a.push('' + r.updatedon + '');//1
            a.push(dt1);//1
            a.push('' + r.lpt + '');//2
            if (r.lpt.indexOf(src_geo) >= 0) {
               a.push('' + src_geo + '');
            } else {
               a.push('' + dest_geo + '');
            }
            a.push('' + r.du + '');
            a.push(r.location.coordinates);//2
            if (!imeis.includes('' + r.imei + '')) {
               imeis.push('' + r.imei + '');
            }
            records.push(a);
         });
         let records_all = [];
         if (imeis.length > 0) {
            await imeis.forEach(im => {
               let records1 = [];
               records.forEach(r => {
                  if (r.includes(im)) {
                     records1.push(r);
                  }
               });
               let rec = calculateTripTime(im, records1, src_geo, dest_geo);
               if (rec != null)
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

function calculateTripTime(im, records, src_geo, dest_geo) {
   var len = records.length;
   var stm = [];
   var etm = [];
   var diff = [];

   if (len > 0) {


      let cnt = 0;
      let cnt1 = 0;
      let cnt2 = 0;
      let i = 0;

      let stm_tmp = 0;
      let etm_tmp = 0;

      records.forEach(r => {
         //  const array = r[0].split(',');
         //console.log(r[0],r[1]);
         if (r.includes(src_geo)) {
            if (i == 0) {
               i = 1;
               etm_tmp = parseInt(r[1]);
            } else if (i == 2) {
               i = 3;
               stm_tmp = parseInt(r[1]);
            }
            cnt1++;
         }
         else if (r.includes(dest_geo)) {
            if (i == 1) {
               i = 2;
               cnt2++;
            }
         }
         if (i == 3) {
            cnt++;
            i = 1;
            etm.push(etm_tmp);
            stm.push(stm_tmp);
            diff.push(etm_tmp - stm_tmp);

            etm_tmp = parseInt(r[1]);
         }

      });
      if (diff.length > 0) {
         let json1 = {imei: im, TotalTimeTaken: diff, RoundStartTime: stm, RoundEndTime: etm};
         return json1;
      }
   }

   // let json = {imei: im, TotalTimeTaken: diff, RoundStartTime: stm, RoundEndTime: etm};
   return null;
}


//API 4
/** return trip data for all IMEIs (buses)
 * @param req
 * @param res
 * /api/getTripDataAll?src_geo=P5&dest_geo=S5&start_dt=11-04-2023&start_tm=12:00:00&end_dt=11-04-2023&end_tm=13:03:00
 * @returns {Promise<void>}
 */
exports.getAllTripCount = async (req, res) => {
   // let imei = req.query.imei;
   let src_geo = req.query.src_geo;
   let dest_geo = req.query.dest_geo;
   let sdt = req.query.start_dt;
   let stm = req.query.start_tm;
   let edt = req.query.end_dt;
   let etm = req.query.end_tm;

   let status = 400;
   let result = 'error';
   let msg = '';

   if (!src_geo) {
      msg = 'Please src geofence code';
   } else if (!dest_geo) {
      msg = 'Please dest geofence code';
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
         let filters = {$or: [{'lpt': src_geo}, {'lpt': dest_geo}]};
         let st_dt1 = datetime(sdt + " " + stm);
         let nd_dt1 = datetime(edt + " " + etm);
         let date1 = new Date(st_dt1); // some mock date
         let date2 = new Date(nd_dt1); // some mock date
         st_dt = date1.getTime();
         nd_dt = date2.getTime(); //9000000
         filters['lpttm'] = {$gte: st_dt, $lte: nd_dt};
         let data = dbCon.busRouts.find(filters);
         let records = [];
         let imeis = [];
         await data.forEach(r => {

            let a = [];
            let m = new Date(r.lpttm);
            let dt = m.toLocaleString();
            let m1 = new Date(r.updatedon);
            let dt1 = m1.toLocaleString();
            a.push('' + r.imei + '');//0
            a.push('' + r.lpttm + '');//1
            a.push(dt);//1
            a.push('' + r.updatedon + '');//1
            a.push(dt1);//1
            a.push('' + r.lpt + '');//2
            if (r.lpt.indexOf(src_geo) >= 0) {
               a.push('' + src_geo + '');
            } else {
               a.push('' + dest_geo + '');
            }
          //  a.push('' + r.du + '');
          //  a.push(r.location.coordinates);//2
            if (!imeis.includes('' + r.imei + '')) {
               imeis.push('' + r.imei + '');
            }
            records.push(a);
         });
         let records_all = [];
         if (imeis.length > 0) {
            await imeis.forEach(im => {
               let records1 = [];
               records.forEach(r => {
                  if (r.includes(im)) {
                     records1.push(r);
                  }
               });
               let rec = calculateTripCount(im, records1, src_geo, dest_geo);
			   if(rec!=null)
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

function calculateTripCount(im, records, src_geo, dest_geo) {
	let a=[];
   if (records.length > 1) {
      let cnt = 0;
      let cnt1 = 0;
      let cnt2 = 0;
      let i = 0;	  
	  let c=0;	  
      records.forEach(r => {
		  c++;
         if (r.includes(src_geo)) {
            if (i == 0) {
			   let j={startTime:r[3],endTime:100,src_code:src_geo,dest_code:dest_geo};
			   a.push(j);
               i = 1;
			   cnt1++;
            } else if (i == 2) {
				a[a.length-1].endTime=r[1];
				let j={startTime:r[3],endTime:101,src_code:src_geo,dest_code:dest_geo};
			    a.push(j);
                i = 3;
			    cnt1++;
            }
            
         }
         else if (r.includes(dest_geo)) {
            if (i == 1) {
			   a[a.length-1].endTime=r[1];
			   if(records.length>c){
			   let j={startTime:r[3],endTime:102,src_code:dest_geo,dest_code:src_geo};
			   a.push(j);
			   i = 2;
               cnt2++;
			   }
			  
              
            }
         }
         if (i == 3) {
			
            cnt++;
            i = 1;
         }
      });
	  
	  c=0;
	  a.forEach(r => {
		  if(r.endTime==101){
			  a.splice(c,1);
			  cnt2--;
		  }else if(r.endTime==102){
			  a.splice(c,1);
			  cnt2--;
		  }
		  c++;
		  
	  });
	  if(cnt1>0 || cnt2>0){
      let json1 = {imei: im, trip_cnt_src_to_dest: cnt1, trip_cnt_dest_to_src: cnt2, data: a};
      return json1;
	  }
   }

  // let json = {imei: im, trip_cnt_src_to_dest: 0, trip_cnt_dest_to_src: 0, data: a};
   return null;
}


// API 14
/**
 * Get All Locations of a Bus / IMEI for given time / day
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
exports.getLocationBusTimePeriod = async (req, res) => {
   let imei = req.query.imei;
   let sdt = req.query.start_dt;
   let stm = req.query.start_tm;
   let edt = req.query.end_dt;
   let etm = req.query.end_tm;
   let status = 400;
   let result = 'error';
   let msg = '';
   if (!imei || isNaN(imei)) {
      msg = 'Invalid input parameters avl imei number or bus plate no';
   } else if (!sdt || !stm) {
      msg = 'Please provide start date time';
   } else if (!edt || !etm) {
      msg = 'Please provide end date time';
      //} else if (sdt != edt) {
      //    msg = 'start date and end date should be same only 1 day data';
   } else {
      let st_dt1 = datetime(sdt + " " + stm);
      let nd_dt1 = datetime(edt + " " + etm);
      let date1 = new Date(st_dt1); // some mock date
      let date2 = new Date(nd_dt1); // some mock date
      let st_dt = date1.getTime();
      let nd_dt = date2.getTime();
      if (!st_dt || !nd_dt || st_dt < 0 || nd_dt < 0) {
         msg = 'Please check start and end date time';
      } else {

         let filters = {};
         if (imei) {
            filters['imei'] = parseInt(imei);
         }
         filters['updatedon'] = {$gte: st_dt, $lte: nd_dt};
         let hideOutputFields = getIgnoredFields1();
         let data = dbCon.gpsHistory.find(filters).project(hideOutputFields);
         let records = [];
         await data.forEach(r => {
            records.push(r);
         });
         if (records.length > 0) {
            res.send({status: 200, result: "success", imei: imei, data: records});
            return;
         } else {
            status = 404;
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
   let status = 400;
   let result = 'error';
   let msg = '';
   if (!imei || isNaN(imei)) {
      msg = 'Invalid input parameters avl imei number or bus plate no';
   } else {

      let filters = {};
      if (imei) {
         filters['imei'] = parseInt(imei);
      }
      let st_dt1 = datetime(sdt + " " + stm);
      let nd_dt1 = datetime(edt + " " + etm);
      let date1 = new Date(st_dt1); // some mock date
      let date2 = new Date(nd_dt1); // some mock date
      let st_dt = date1.getTime();
      let nd_dt = date2.getTime();
      // console.log(st_dt,'--',nd_dt);
      filters['updatedon'] = {$gte: st_dt, $lte: nd_dt};
      // let hideOutputFields = getIgnoredFields();
      let data = dbCon.busRouts.find(filters);
      let records = [];
      await data.forEach(r => {
         let info = {};
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
         info.m = device;
         records.push(info);
      });
      if (records.length > 0) {
         res.send(records);
         return;
      } else {
         status = 404;
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

   let status = 400; // bad request
   let result = 'error';
   let msg = '';

   if (!imei) {
      msg = 'Please provide valid imei number';
   } else if (!src_geo) {
      msg = 'Please provide valid src geofence code';
   } else if (!dest_geo) {
      msg = 'Please provide valid dest geofence code';
   } else if (!sdt || !stm) {
      msg = 'Please provide start date time';
   } else if (!edt || !etm) {
      msg = 'Please provide end date time';
   } else {
      let st_dt = datetime(sdt + " " + stm);
      let nd_dt = datetime(edt + " " + etm);
      // console.log(st_dt, '---', nd_dt);
      if (!st_dt || !nd_dt || st_dt < 0 || nd_dt < 0) {
         msg = 'Please check start and end date time';
      } else {

         let filters = {};
         filters['pt'] = src_geo;
         filters['imei'] = parseInt(imei);
         let st_dt1 = datetime(sdt + " " + stm);
         let nd_dt1 = datetime(edt + " " + etm);
         let date1 = new Date(st_dt1); // some mock date
         let date2 = new Date(nd_dt1); // some mock date
         st_dt = date1.getTime();
         nd_dt = date2.getTime(); //9000000
         filters['updatedon'] = {$gte: st_dt, $lte: nd_dt};
         let data = dbCon.busRouts.find(filters);
         let records = [];
         await data.forEach(r => {
            let a = [];
            let m = new Date(r.updatedon);
            let dt = m.toLocaleString();
            a.push('' + r.updatedon + '');//1
            a.push(dt);//1
            a.push('' + src_geo + '');//2
            a.push(r.location.coordinates);//2
            records.push(a);
         });

         filters = {};
         filters['pt'] = dest_geo;
         filters['imei'] = parseInt(imei);
         filters['updatedon'] = {$gte: st_dt, $lte: nd_dt};
         data = dbCon.busRouts.find(filters);
         await data.forEach(r => {
            let a = [];
            let m = new Date(r.updatedon);
            let dt = m.toLocaleString();
            a.push('' + r.updatedon + '');//1
            a.push(dt);//1
            a.push('' + dest_geo + '');//2
            a.push(r.location.coordinates);//2
            records.push(a);
         });

         filters = {};
         filters['lpt'] = src_geo;
         filters['imei'] = parseInt(imei);
         filters['lpttm'] = {$gte: st_dt, $lte: nd_dt};
         data = dbCon.busRouts.find(filters);
         await data.forEach(r => {
            let a = [];
            let m = new Date(r.updatedon);
            let dt = m.toLocaleString();
            a.push('' + r.updatedon + '');//1
            a.push(dt);//1
            a.push('' + src_geo + '');//2
            a.push(r.location.coordinates);//2
            records.push(a);
         });

         filters = {};
         filters['lpt'] = dest_geo;
         filters['imei'] = parseInt(imei);
         filters['lpttm'] = {$gte: st_dt, $lte: nd_dt};
         data = dbCon.busRouts.find(filters);
         await data.forEach(r => {
            let a = [];
            let m = new Date(r.updatedon);
            let dt = m.toLocaleString();
            a.push('' + r.updatedon + '');//1
            a.push(dt);//1
            a.push('' + dest_geo + '');//2
            a.push(r.location.coordinates);//2
            records.push(a);
         });

         if (records.length > 0) {
            let pos = 0;
            records.sort((a, b) => a[pos].localeCompare(b[pos]));

            let cnt = 0;
            let cnt1 = 0;
            let cnt2 = 0;
            let json1 = {
               status: 200,
               result: "success",
               imei: imei,
               trip_cnt: cnt,
               trip_cnt_src_to_dest: cnt1,
               trip_cnt_dest_to_src: cnt2,
               data: records
            };
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

exports.getTripData = async (req, res) => {
   let imei = req.query.imei;
   let src_geo = req.query.src_geo;
   let dest_geo = req.query.dest_geo;
   let sdt = req.query.start_dt;
   let stm = req.query.start_tm;
   let edt = req.query.end_dt;
   let etm = req.query.end_tm;

   let status = 400; // bad request
   let result = 'error';
   let msg = '';


   if (!imei) {
      msg = 'Please provide valid imei number';
   } else if (!src_geo) {
      msg = 'Please src geofence code';
   } else if (!dest_geo) {
      msg = 'Please dest geofence code';
   } else if (!sdt || !stm) {
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
         filters['imei'] = parseInt(imei);
         let st_dt1 = datetime(sdt + " " + stm);
         let nd_dt1 = datetime(edt + " " + etm);
         let date1 = new Date(st_dt1); // some mock date
         let date2 = new Date(nd_dt1); // some mock date
         st_dt = date1.getTime();
         nd_dt = date2.getTime(); //9000000
         filters['lpttm'] = {$gte: st_dt, $lte: nd_dt};
         let data = dbCon.busRouts.find(filters);
         let records = [];
         await data.forEach(r => {
            let a = [];
            let m = new Date(r.lpttm);
            let dt = m.toLocaleString();
            let m1 = new Date(r.updatedon);
            let dt1 = m1.toLocaleString();
            /// a.push(''+r.imei+'');//0
            a.push('' + r.lpttm + '');//1
            a.push(dt);//1
            a.push('' + r.updatedon + '');//1
            a.push(dt1);//1
            a.push('' + r.lpt + '');//2
            if (r.lpt.indexOf(src_geo) >= 0) {
               a.push('' + src_geo + '');//2
            } else {
               a.push('' + dest_geo + '');//2
            }
            a.push('' + r.du + '');//1
            a.push(r.location.coordinates);//2
            records.push(a);
         });

         if (records.length > 0) {
            let rec = calculateTripCount(imei, records, src_geo, dest_geo);
            res.send(rec);
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

   let status = 400;
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
   let status = 400;
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
               status = 406;
               msg = 'No bus available with in ' + accuracy + ' meters area';
            }

         } else {
            status = 406;
            msg = 'No bus available with in ' + minBefore + ' minutes';
         }

      } else {
         status = 404;
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
   //console.log(filters)
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
   // console.log('req.query', req.query)
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
 This API only support last 10 min live data for those devices which are not synced
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
         return res.error({error: 'Invalid lat, long values'});
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
