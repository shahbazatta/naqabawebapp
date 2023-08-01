/**************************
 * Description:
 * @Author: Mohammad Idris
 * @Created On: 27/11/22
 ***************************/
const dataCtrl = require('../controllers/dataController');

const express = require('express');
const router = express.Router();

router.get('/data',dataCtrl.getData);
router.get('/getDevicesData',dataCtrl.getImeisData);
router.get('/getDevicesData1',dataCtrl.getImeisData1);
router.get('/getGeofenceDevice',dataCtrl.getGeofenceDevice);
router.get('/getBusStatus',dataCtrl.getBusStatus);
router.get('/getListBusesGeofenceTimePeriod',dataCtrl.getListBusesGeofenceTimePeriod);
router.get('/getListBusesStayGeofenceTimePeriod',dataCtrl.getListBusesStayGeofenceTimePeriod);
router.get('/getDevicesDataLive',dataCtrl.getDevicesDataLive);
router.get('/getCompanyData',dataCtrl.getCompanyData);

router.get('/getDevicesNotSynced',dataCtrl.getDevicesNotSynced);
router.get('/getDevicesTimeError',dataCtrl.getDevicesTimeError);

/***** Geo fences endpoints  ************/
router.get('/getGeoFenceInfo',dataCtrl.getGeoFenceInfo);

//router.get('/removeImeiData',dataCtrl.removeImeiData);
///update
//router.post('/', dataCtrl.saveData);

/* GET home page. */
router.get('/home', function(req, res, next) {
   res.render('home');
});

router.post('/update/:token', function(req, res, next) {
   let date = new Date();
   res.render('index', { time: date.toDateString() +' '+ date.toTimeString() ,title:'Data Service'});
});

/* get token and find client info */
router.param('token', function (req, res, next, id) {
   // try to get the user details from the User model and attach it to the request object
   console.log("token found "+id)
   //res.send("Success");
   next();
   // ClientInfo.find(id, function (err, user) {
   //    if (err) {
   //       next(err)
   //    } else if (user) {
   //       req.user = user
   //       next()
   //    } else {
   //       next(new Error('failed to load user'))
   //    }
   // })
});


module.exports = router;
