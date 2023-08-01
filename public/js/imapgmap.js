		var image_n = {
		url:'images/marker_img1.png'
		};

		var image_n1 = {
		url:'images/marker_img.png',
		size: new google.maps.Size(50, 50),
		origin: new google.maps.Point(0, 0),
		anchor: new google.maps.Point(25, 25),
		scaledSize: new google.maps.Size(50, 50)
		};

		var image_r = {
		url:'images/marker_img3.png'
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
		content: 'test',
		 pixelOffset: new google.maps.Size(0,-38)
		});
		
		function initialize(data) {
		myOptions = {
		zoom: 0,
		mapTypeId: 'roadmap',
		zoomControl: true,
		scaleControl: true
		};

		myOptions.zoom=5;
		map = new google.maps.Map(document.getElementById("map_canvas"),myOptions);
		latlng = new google.maps.LatLng(21.413332, 39.892907);
		map.setCenter(latlng);

		var polycrd=[];
		 for(r=0; r<polygone.length; r++){
			 var ll=new google.maps.LatLng(polygone[r][1], polygone[r][0]);
		polycrd.push(ll);

  
  }
  //map.setCenter(polycrd[0]);
  //alert(polycrd);


		var camp_poly = new google.maps.Polygon({
		paths: polycrd,
		strokeColor: '#CCCCCC',
			strokeOpacity: 0.5,
		strokeWeight: 1,
			fillOpacity: 0.35,
		fillColor: '#B0D1F9'
		});
		

        camp_poly.setMap(map);
			


		}

		function addmarker(data,searchimei){
			
			for (var i = 0; i < markers.length; i++) {
			markers[i].setMap(null);
			}
			markers = [];
			if(data!=null && data.length>0){
			//latlng = new google.maps.LatLng(data[0].location.coordinates[1],data[0].location.coordinates[0]);
			//map.setCenter(latlng);

			var dev_comp_id = selectedValues($('input[name="dev_comp_id"]'));
			var comp_id = selectedValues($('input[name="comp_id"]'));
			var trans_comp_id = selectedValues($('input[name="trans_comp_id"]'));
			var searchbus = $('input[name="searchbus"]').val();
			var searchbus_op_no = $('input[name="searchbus_op_no"]').val();
//alert(searchbus);


			var ln=data.length;
			var cnt=0;
			for(var n=0;n<ln;n++){
				if(data[n].location.coordinates[0]!=null && data[n].location.coordinates[1]>11 && data[n].location.coordinates[1]<34 && data[n].location.coordinates[0]>30 && data[n].location.coordinates[0]<65){

				if(isvalidData(data[n].device.device_comp,dev_comp_id) && isvalidData(data[n].device.avl_comp,comp_id) && isvalidData(data[n].device.trnspt_comp,trans_comp_id)){
					
					
					if(searchimei==null || searchimei=='' || (data[n].imei+'').indexOf(searchimei)>=0 ){
						if(searchbus==null || searchbus=='' || (data[n].device.busid+'').indexOf(searchbus)>=0 ){
							if(searchbus_op_no==null || searchbus_op_no=='' || (data[n].device.bus_oper_no+'').indexOf(searchbus_op_no)>=0 ){
						
					//	if(data[n].avltm>1675263068){
						
						cnt++;
					//var info='&nbsp;\n\nbus no : '+data[n].bus_no+'\n\n&nbsp;\nlast Sync time: '+data[n].last_time+'\n\n&nbsp;';
							var scontent='<p style="padding:10px;text-align:left"></br><font style="font-size: 12pt; font-weight: bold;font-family: arial,verdana,sans-serif;">IMEI NO: </font><font style="font-size: 12pt;font-family: arial,verdana,sans-serif;">'
							+data[n].imei+'</font></br><font style="font-size: 12pt; font-weight: bold;font-family: arial,verdana,sans-serif;">Position: </font><font style="font-size: 12pt;font-family: arial,verdana,sans-serif;">'
							+data[n].location.coordinates[1]+','+data[n].location.coordinates[0]+'</font><br><font style="font-size: 12pt; font-weight: bold;font-family: arial,verdana,sans-serif;">Device Company: </font><font style="font-size: 12pt;font-family: arial,verdana,sans-serif;">'
							+data[n].device.device_comp+'</font><br><font style="font-size: 12pt; font-weight: bold;font-family: arial,verdana,sans-serif;">AVL Company: </font><font style="font-size: 12pt;font-family: arial,verdana,sans-serif;">'
							+data[n].device.avl_comp+'</font><br><font style="font-size: 12pt; font-weight: bold;font-family: arial,verdana,sans-serif;">Transport Company: </font><font style="font-size: 12pt;font-family: arial,verdana,sans-serif;">'
							+data[n].device.trnspt_comp+'</font><br><font style="font-size: 12pt; font-weight: bold;font-family: arial,verdana,sans-serif;">Record Saved Time: </font>'+'<font style="font-size: 12pt;font-family: arial,verdana,sans-serif;">'+
							getTimeFormat(data[n].updatedon)+'</font><br><font style="font-size: 12pt; font-weight: bold;font-family: arial,verdana,sans-serif;">Device Time: </font>'+'<font style="font-size: 12pt;font-family: arial,verdana,sans-serif;">'+
							getTimeFormat(data[n].avltm)+'</font><br><font style="font-size: 12pt; font-weight: bold;font-family: arial,verdana,sans-serif;">Speed: </font>'+'<font style="font-size: 12pt;font-family: arial,verdana,sans-serif;">'+data[n].spd+' km/h</font></br><font style="font-size: 12pt; font-weight: bold;font-family: arial,verdana,sans-serif;">Port: </font>'+'<font style="font-size: 12pt;font-family: arial,verdana,sans-serif;">'+data[n].odata+'</font></br>'
							+'<font style="font-size: 12pt; font-weight: bold;font-family: arial,verdana,sans-serif;">Bus no: </font>'+'<font style="font-size: 12pt;font-family: arial,verdana,sans-serif;">'+data[n].device.busid+'</font></br>'+
							'<font style="font-size: 12pt; font-weight: bold;font-family: arial,verdana,sans-serif;">Bus plate number: </font>'+'<font style="font-size: 12pt;font-family: arial,verdana,sans-serif;">'+data[n].device.plate_no+'</font></br>'+
							'<font style="font-size: 12pt; font-weight: bold;font-family: arial,verdana,sans-serif;">Bus operational number: </font>'+'<font style="font-size: 12pt;font-family: arial,verdana,sans-serif;">'+data[n].device.bus_oper_no+'</font></br>'+
							'</p>';
						
							var marker = new google.maps.Marker( {
							map: map,
							position: new google.maps.LatLng(data[n].location.coordinates[1],data[n].location.coordinates[0]),
							icon: data[n].spd>0?image_n:image_r,
							title: data[n].imei,
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
				
				}
			}
			}
			

			document.getElementById("number-of-dev").innerHTML  = ln+" / "+cnt;


			}
			document.getElementById("map_view").style.display='none';
		}

		function isvalidData(data,search){
			var len=search.length;
			if(len==0)
				return true;
			for(var i=0;i<len;i++){
				if(data==search[i])
					return true;
			}
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

function getTimeFormat(timestamp){
if(timestamp<10000000000)
		timestamp=timestamp*1000;
var m = new Date(timestamp);
return m.toLocaleString();
//return dateFormat(m, "dd-mm-yyyy H:MM:ss");
/*var dateString =
m.getUTCDate() + "-" +
("0" + (m.getUTCMonth()+1)).slice(-2) + "-" +
("0" + m.getUTCFullYear()).slice(-2) + " " +
("0" + m.getUTCHours()).slice(-2) + ":" +
("0" + m.getUTCMinutes()).slice(-2) + ":" +
("0" + m.getUTCSeconds()).slice(-2);
return dateString;*/
}

