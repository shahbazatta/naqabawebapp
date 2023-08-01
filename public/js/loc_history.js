		var image_n = {
		url:'images/marker_img.png',
		size: new google.maps.Size(20, 20),
		origin: new google.maps.Point(0, 0),
		anchor: new google.maps.Point(10, 10),
		scaledSize: new google.maps.Size(20, 20)
		};

		var image_n1 = {
		url:'images/marker_img.png',
		size: new google.maps.Size(50, 50),
		origin: new google.maps.Point(0, 0),
		anchor: new google.maps.Point(25, 25),
		scaledSize: new google.maps.Size(50, 50)
		};

		var image_r = {
		url:'images/marker_img2.png',
		size: new google.maps.Size(20, 20),
		origin: new google.maps.Point(0, 0),
		anchor: new google.maps.Point(10, 10),
		scaledSize: new google.maps.Size(20, 20)
		};

		var image_r1 = {
		url:'images/marker_img2.png',
		size: new google.maps.Size(50, 50),
		origin: new google.maps.Point(0, 0),
		anchor: new google.maps.Point(25, 25),
		scaledSize: new google.maps.Size(50, 50)
		};
		var map;
		var markers = [];
		var camps_info = new google.maps.InfoWindow({
		content: 'test'
		});
		
		function initialize(data) {
		myOptions = {
		zoom: 0,
		mapTypeId: 'roadmap',
		zoomControl: true,
		scaleControl: true
		};

		myOptions.zoom=10;
		map = new google.maps.Map(document.getElementById("map_canvas"),myOptions);
		latlng = new google.maps.LatLng(21.413332, 39.892907);
		map.setCenter(latlng);
			


		}

		/*function addmarker(data,sel_bus){
			
			for (var i = 0; i < markers.length; i++) {
			markers[i].setMap(null);
			}
			markers = [];
			if(data!=null && data.length>0){
			latlng = new google.maps.LatLng(data[0].lat,data[0].long);
			map.setCenter(latlng);
			for(var n=0;n<data.length;n++){
			if(sel_bus==null || checkpos(sel_bus,data[n].bus_id)>=0){
			//var info='&nbsp;\n\nbus no : '+data[n].bus_no+'\n\n&nbsp;\nlast Sync time: '+data[n].last_time+'\n\n&nbsp;';
			var scontent='<font style="font-size: 12pt; font-weight: bold;font-family: arial,verdana,sans-serif;">Time: </font>'+'<font style="font-size: 12pt;font-family: arial,verdana,sans-serif;">'+
			data[n].rec_time+'</font><br><font style="font-size: 12pt; font-weight: bold;font-family: arial,verdana,sans-serif;">Speed: </font>'+'<font style="font-size: 12pt;font-family: arial,verdana,sans-serif;">'+data[n].speed+
				'</font>';
			var marker = new google.maps.Marker( {
			map: map,
			position: new google.maps.LatLng(data[n].lat,data[n].long),
			icon: data[n].speed>0?image_n:image_r,
			title: data[n].bus_serial,
			info:scontent
			});

			google.maps.event.addListener(marker, 'mouseover', function (e) {

		//	this.setIcon(image_n1);
			camps_info.setContent(this.info);
			camps_info.setPosition(e.latLng);
			camps_info.open(map);
			});

			google.maps.event.addListener(marker, 'mouseout', function (e) {
			//this.setIcon(image_n);
			//camps_info.close();
			});

			markers.push(marker);
			}
			}


			}
			document.getElementById("map_view").style.display='none';
		}*/

		var mdata=null;

		function addmarker(data,dt1,tm1,dt2,tm2){
			
			for (var i = 0; i < markers.length; i++) {
			markers[i].setMap(null);
			}
			markers = [];
			if(data!=null && data.length>0){
				mdata=data;
				pos=data.length-1;
			latlng = new google.maps.LatLng(data[0].lat,data[0].long);
			map.setCenter(latlng);
			//var n=0;
			for(var n=0;n<data.length;n++){
			//if(sel_bus==null || checkpos(sel_bus,data[n].bus_id)>=0){
			//var info='&nbsp;\n\nbus no : '+data[n].bus_no+'\n\n&nbsp;\nlast Sync time: '+data[n].last_time+'\n\n&nbsp;';
			if(compareDtTm(data[n].rec_time,dt1,tm1,dt2,tm2)){

			var scontent='<p style="padding:10px;text-align:left"><font style="font-size: 12pt; font-weight: bold;font-family: arial,verdana,sans-serif;">Time: </font>'+'<font style="font-size: 12pt;font-family: arial,verdana,sans-serif;">'+
			getTimeFormat(data[n].rec_time)+'</font><br><br><font style="font-size: 12pt; font-weight: bold;font-family: arial,verdana,sans-serif;">Speed: </font>'+'<font style="font-size: 12pt;font-family: arial,verdana,sans-serif;">'+data[n].speed+
				'</font></br></p>';
			var marker = new google.maps.Marker( {
			map: map,
			position: new google.maps.LatLng(data[n].lat,data[n].long),
			icon: data[n].speed>0?image_n:image_r,
			title: data[n].bus_serial,
			info:scontent
			});

			google.maps.event.addListener(marker, 'mouseover', function (e) {

		//	this.setIcon(image_n1);
			camps_info.setContent(this.info);
			camps_info.setPosition(e.latLng);
			camps_info.open(map);
			});

			google.maps.event.addListener(marker, 'mouseout', function (e) {
			//this.setIcon(image_n);
			camps_info.close();
			});

			markers.push(marker);
			}
			}


			}
			document.getElementById("map_view").style.display='none';
		}

		var pos=0;
		var init=0;
		function animateMarker() {
			//if(pos==0){
			//if(init==0){
			//	init=1;
			for (var i = 0; i < markers.length; i++) {
			markers[i].setMap(null);
			}
			markers = [];
			latlng = new google.maps.LatLng(mdata[pos].lat,mdata[pos].long);
			map.setCenter(latlng);
			//}
			var scontent='<p style="padding:10px;text-align:left"><font style="font-size: 12pt; font-weight: bold;font-family: arial,verdana,sans-serif;">Time: </font>'+'<font style="font-size: 12pt;font-family: arial,verdana,sans-serif;">'+
			getTimeFormat(mdata[pos].rec_time)+'</font><br><br><font style="font-size: 12pt; font-weight: bold;font-family: arial,verdana,sans-serif;">Speed: </font>'+'<font style="font-size: 12pt;font-family: arial,verdana,sans-serif;">'+mdata[pos].speed+
			'</font></br></p>';
			var marker = new google.maps.Marker( {
			map: map,
			position: latlng,
			icon: mdata[pos].speed>0?image_n:image_r,
			title: mdata[pos].bus_serial,
			info:scontent
			});

			google.maps.event.addListener(marker, 'mouseover', function (e) {

			//	this.setIcon(image_n1);
			camps_info.setContent(this.info);
			camps_info.setPosition(e.latLng);
			camps_info.open(map);
			});

			google.maps.event.addListener(marker, 'mouseout', function (e) {
			//this.setIcon(image_n);
			camps_info.close();
			});

			markers.push(marker);
			document.getElementById("loc_tm").innerHTML=getTimeFormat(mdata[pos].rec_time);
			document.getElementById("loc_spd").innerHTML=mdata[pos].speed;
			/*}else{
			latlng = new google.maps.LatLng(mdata[pos].lat,mdata[pos].long);
			map.setCenter(latlng);
			var scontent='<p style="padding:10px;text-align:left"><font style="font-size: 12pt; font-weight: bold;font-family: arial,verdana,sans-serif;">Time: </font>'+'<font style="font-size: 12pt;font-family: arial,verdana,sans-serif;">'+
			getTimeFormat(mdata[pos].rec_time)+'</font><br><br><font style="font-size: 12pt; font-weight: bold;font-family: arial,verdana,sans-serif;">Speed: </font>'+'<font style="font-size: 12pt;font-family: arial,verdana,sans-serif;">'+mdata[pos].speed+
			'</font></br></p>';
			markers[0].setPosition(latlng);
			markers[0].setContent(scontent);
			}*/

			//if(compareDtTm(mdata[pos].rec_time,dt1,tm1,dt2,tm2)){
				pos--;
		//	}else{

			//while(!compareDtTm(mdata[pos].rec_time,dt1,tm1,dt2,tm2) && pos>0){
			//	pos--;
			//}
			//}


		
		
		if(play==1){
		if(pos<=0){
			playpause();
		}else
		increaseSliderVal(mdata.length,pos);
		setTimeout(function() {  animateMarker(); }, 4000/speed);
		}
		}


		function getTimeFormat(locdttm){

		locdttm1 = locdttm.replace(/([+\-]\d\d)(\d\d)$/, "$1:$2");
		var m = new Date(locdttm1);
		var dateString =
    m.getUTCDate() + "-" +
    ("0" + (m.getUTCMonth()+1)).slice(-2) + "-" +
    ("0" + m.getUTCFullYear()).slice(-2) + " " +
    ("0" + m.getUTCHours()).slice(-2) + ":" +
    ("0" + m.getUTCMinutes()).slice(-2) + ":" +
    ("0" + m.getUTCSeconds()).slice(-2);
		return dateString;
	}

		

		function compareDtTm(locdttm,dt1,tm1,dt2,tm2){
			if(dt1==null || dt2==null)
				return true;
		var dttm1=dt1+'T'+tm1+'.000Z';
		//dttm1 = dateTimeString.replace(/([+\-]\d\d)(\d\d)$/, "$1:$2");
		var dttm2=dt2+'T'+tm2+'.000Z';
		
		locdttm1 = locdttm.replace(/([+\-]\d\d)(\d\d)$/, "$1:$2");
		dttm11 = dttm1.replace(/([+\-]\d\d)(\d\d)$/, "$1:$2");
		dttm21 = dttm2.replace(/([+\-]\d\d)(\d\d)$/, "$1:$2");
		
		var dt_locdttm=new Date(locdttm1);
		var dt_dttm1=new Date(dttm11);
		var dt_dttm2=new Date(dttm21);
		//2018-09-16T07:08:59.000Z
		//alert(dt_locdttm+' '+dt_dttm1+' '+dt_dttm2+' '+(dt_locdttm>=dt_dttm1 && dt_locdttm<=dt_dttm2));


if(dt_locdttm>=dt_dttm1 && dt_locdttm<=dt_dttm2){
		
		return true;
}
else 
	return false;

		}

		function checkpos(bids,bid) {
		
		for(var n=0;n<bids.length;n++){
		
		if(bid==bids[n]){
		return n;
		}
		}
		return -1;
		}
