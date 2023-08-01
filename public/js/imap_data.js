	function getListFromServer(auto) {
		
		initialize(null);	
	//var path_id = $('input[name="path_id_get"]').val();
	
	//http://95.177.219.67:8080/api/getCompanyData
var data=localStorage.getItem("comp_data2");

if(data==null){

     
					$.ajax({
					type: "GET",
					dataType:'json',
					url: "http://95.177.219.67:8080/api/getCompanyData",//'avl_comp':'الأجهزة المحمولة'
					data:{},	cache: false,
					success: function(data)
							{
							
							parseData(data);
							localStorage.setItem("comp_data2",JSON.stringify(data));



							
							//getMaktabs_all();
							//getCompanies_all();
							getVehicles_data();
							
							

					},
					error:function(jqXHR, textStatus, errorThrown) {
					//alert(textStatus);
					}
					});//ajax close
				}else{
					var data1=JSON.parse(data);
					parseData(data1);
					getVehicles_data();
				}

   
	}//function close

var company_list=[];
var trans_comp_list=[];
var dev_comp_list=[];
var imei_list=[];
function parseData(data){
	    company_list=[];
        var len=data.length;
        if(len<=0){
      
        }else{
              for(var i=0;i<len;i++){
              	var cnm=data[i].avl_comp;
              	if (company_list.indexOf(cnm) === -1)
                  company_list.push(cnm);

              var cnm=data[i].trnspt_comp;
              	if (trans_comp_list.indexOf(cnm) === -1)
                  trans_comp_list.push(cnm);

              var cnm=data[i].device_comp;
              	if (dev_comp_list.indexOf(cnm) === -1)
                  dev_comp_list.push(cnm);

              var cnm=data[i].imei;
              	if (imei_list.indexOf(cnm) === -1)
                  imei_list.push(cnm);
              }
        }


       addAllFilterList();
       document.getElementById("map_view").style.display='none';


}

function addAllFilterList(){
	$('#companylist').empty();
	var len=company_list.length;
	
	for(var n=0;n<len;n++){
	tr = $('<tr/>');
	tr.append('<td><input type="checkbox" name="comp_id" id="comp_id" value="'+company_list[n]+'" class="cbox2" onchange="updateFilterList()"><br></td>');
	tr.append('<td style="color:#000000;"  class="textStyle">'+company_list[n]+'</td>');
	$("#companylist").append(tr);
	}




	$('#transport_comp_list').empty();
	var len=trans_comp_list.length;
	
	for(var n=0;n<len;n++){
	tr = $('<tr/>');
	tr.append('<td><input type="checkbox" name="trans_comp_id" id="trans_comp_id" value="'+trans_comp_list[n]+'" class="cbox2" onchange="updateFilterList()"><br></td>');
	tr.append('<td style="color:#000000;"  class="textStyle">'+trans_comp_list[n]+'</td>');
	$("#transport_comp_list").append(tr);
	}


	$('#dev_comp_list').empty();
	var len=dev_comp_list.length;
	
	for(var n=0;n<len;n++){
	tr = $('<tr/>');
	tr.append('<td><input type="checkbox" name="dev_comp_id" id="dev_comp_id" value="'+dev_comp_list[n]+'" class="cbox2" onchange="updateFilterList()"><br></td>');
	tr.append('<td style="color:#000000;"  class="textStyle">'+dev_comp_list[n]+'</td>');
	$("#dev_comp_list").append(tr);
	}
							
}

var vehicledata;


	function getVehicles_data() {

			$.ajax({
			type: "GET",
			dataType:'json',
			url: "http://95.177.219.67:8080/api/getDevicesData",
			data:{},	cache: false,//'token':'cebc8011932a85c60a7e079b840bf083161812d3'
			success: function(data)
				{
				
				//if(data.result == "success")
				//{


				vehicledata=data;
				filter_vehicle(vehicledata);
				clearTimeout(myVar2);
				myVar2=setTimeout(function() {getVehicles_data(); }, 30000);
				//}


			},
			error:function(jqXHR, textStatus, errorThrown) {
			//alert(textStatus);
			}
			});//ajax close


	}//function close



	function filter_vehicle(data) {

		var searchimei = $('input[name="searchimei"]').val();
		addmarker(vehicledata,searchimei);

	/*clearTimeout(myVar2);
		
					var company_id = selectedValues($('input[name="company_id"]'));
					var searchbus = $('input[name="searchbus"]').val();
					var sp = document.getElementsByName('speed');
					var speed = $("input:radio[name=speed]:checked").val()
					var bound = $("input:radio[name=boundary]:checked").val()

					var dt1 = $('input[name="date1"]').val();
					var dt2 = $('input[name="date2"]').val();
					var tm1 = $('input[name="time1"]').val();
					var tm2 = $('input[name="time2"]').val();
								
					$('#buslist').empty();
					var i=0;
					searchdata=[];
					
							for(var n=0;n<data.length;n++){
								var bno=data.vehicles[n].bus_serial;
								
								if((company_id.length<=0 && searchbus.length<=0 && checkpos(comp_ids,data.vehicles[n].company_id)>=0 ) ||(company_id.length<=0 && (searchbus.length>0 &&  bno.indexOf(searchbus)>=0) && checkpos(comp_ids,data.vehicles[n].company_id)>=0) || (checkpos(company_id,data.vehicles[n].company_id)>=0 && (searchbus.length>0 &&  bno.indexOf(searchbus)>=0)) || (checkpos(company_id,data.vehicles[n].company_id)>=0 && (searchbus.length<=0))){
									var spd=data.vehicles[n].speed;
								if(speed==2 || (speed==0 && spd<=0) || (speed==1 && spd>0)){

									//var ll=new google.maps.LatLng();
									
									var ll=[data.vehicles[n].lat,data.vehicles[n].long];
									//alert(ll);
								
								//if(bound==2 || isPointInPoly(polygone,ll)){
									var ok=false;
									if(bound==2){
										ok=true;
									}else if(bound==0 && inside(ll,polygone)){
									ok=true;
									}else if(bound==1 && !inside(ll,polygone)){
									ok=true;
									}

									
								if(ok){	
								
								if(compareDtTm(data.vehicles[n].last_time,dt1,tm1,dt2,tm2)){

								if(i<100){
								tr = $('<tr/>');
								tr.append('<td><input type="checkbox" name="bus_no" id="bus_no" value="'+data.vehicles[n].bus_id+'" class="cbox2" onchange="updateMap()"><br></td>');
								tr.append('<td style="color:#000000;cursor:pointer"  class="textStyle" onclick="locationHistory('+data.vehicles[n].bus_id+')">'+data.vehicles[n].bus_serial+'</td>');
								$("#buslist").append(tr);
								i++;
								}

								searchdata.push(data.vehicles[n]);
								}
								}


								}
								

							
								}
							}
						
						addmarker(searchdata,null);*/
   
	}//function close



var myVar1;
var myVar2;
var myVar0;
	function updateCompanies(){
		document.getElementById("map_view").style.display='block';
	//getCompanies();
	myVar1=setTimeout(function() { filter_companies(all_companies); }, 200);
	myVar2=setTimeout(function() {filter_vehicle(vehicledata); }, 500);
	
	
	}

	


	var all_maktabs;
	function getMaktabs_all() {
			$.ajax({
			type: "POST",
			dataType:'json',
			url: "index.php",
			data:{'task':'getMaktabs','mosasa_id':''},	cache: false,
			success: function(data)
				{
				 all_maktabs=data;
				 filter_maktabs(data);
				},
			error:function(jqXHR, textStatus, errorThrown) {
			//alert(textStatus);
			}
			});//ajax close


	}//function close

	var maktab_ids=[];

	function filter_maktabs(data) {
				clearTimeout(myVar0);
				$('#companylist').empty();
				$('#maktablist').empty();
				$('#buslist').empty();
				document.getElementById("searchbus").value = '';
				var mosasa_id = selectedValues($('input[name="mosasa_id"]'));
				maktab_ids=[];

				for(var n=0;n<data.maktabs.length;n++){
				if(mosasa_id.length<=0 || checkpos(mosasa_id,data.maktabs[n].mos_id)>=0){
				if(checkpos(maktab_ids,data.maktabs[n].id)<0){
				maktab_ids.push(data.maktabs[n].id);
				tr = $('<tr/>');
				tr.append('<td><input type="checkbox" name="maktab_id" id="maktab_id" value="'+data.maktabs[n].id+'" class="cbox2" onchange="updateCompanies()"><br></td>');
				tr.append('<td style="color:#000000;"  class="textStyle">'+data.maktabs[n].name+'</td>');
				$("#maktablist").append(tr);
				}
				}
				//if(n>100)
				//	break;
				}
   
	}//function close

	var all_companies;
	function getCompanies_all() {
			$.ajax({
			type: "POST",
			dataType:'json',
			url: "index.php",
			data:{'task':'getCampanies','mosasa_id':''},	cache: false,
			success: function(data)
				{
				 all_companies=data;
				 filter_companies(data);
				},
			error:function(jqXHR, textStatus, errorThrown) {
			//alert(textStatus);
			}
			});//ajax close


	}//function close

	var comp_ids=[];

	function filter_companies(data) {
				clearTimeout(myVar1);
				$('#companylist').empty();
				$('#buslist').empty();
				document.getElementById("searchbus").value = '';
				var mosasa_id = selectedValues($('input[name="mosasa_id"]'));
				var maktab_id = selectedValues($('input[name="maktab_id"]'));
				//alert(maktab_id);
				comp_ids=[];

				for(var n=0;n<data.companies.length;n++){
				if((mosasa_id.length<=0 || checkpos(mosasa_id,data.companies[n].mos_id)>=0)){
				
				if((maktab_id.length<=0 || checkpos(maktab_id,data.companies[n].mak_id)>=0)){
				
				if(checkpos(comp_ids,data.companies[n].id)<0){
				comp_ids.push(data.companies[n].id);
				tr = $('<tr/>');
				tr.append('<td><input type="checkbox" name="company_id" id="company_id" value="'+data.companies[n].id+'" class="cbox2" onchange="updateVehicles()"><br></td>');
				tr.append('<td style="color:#000000;"  class="textStyle">'+data.companies[n].name+'-'+data.companies[n].id+'</td>');
				$("#companylist").append(tr);
				}
				}

				}
				//if(n>100)
				//	break;
				}
				//alert(comp_ids.length);
   
	}//function close


	

	function getCompanies() {
		
	//$('#buslist').empty();
	//$('input[name="searchbus"]').val='';
	document.getElementById("searchbus").value = '';
	$('#companylist').empty();
	$('#buslist').empty();
	var mosasa_id = selectedValues($('input[name="mosasa_id"]'));

     
					$.ajax({
					type: "POST",
					dataType:'json',
					url: "index.php",
					data:{'task':'getCampanies','mosasa_id':mosasa_id},	cache: false,
					success: function(data)
							{
							
							//if(data.result == "success")
							//{

						

							

							
							
							for(var n=0;n<data.data.length;n++){
							
							tr = $('<tr/>');
							tr.append('<td><input type="checkbox" name="company_id" id="company_id" value="'+data.data[n].id+'" class="cbox2" onchange="updateVehicles()"><br></td>');
							tr.append('<td style="color:#000000;"  class="textStyle">'+data.data[n].name+'</td>');
							
							
							$("#companylist").append(tr);
							//if(n>100)
							//	break;
							}

							

							
							//}
							//else
						//	{
							
						//	}	
					},
					error:function(jqXHR, textStatus, errorThrown) {
					//alert(textStatus);
					}
					});//ajax close

   
	}//function close





	var searchdata=[];



	function locationHistory(busid){

		//alert(busid);
		//window.location.href = "locationHistory.php?busid="+busid;
		var url="locationHistory.php?busid="+busid;
		window.open(url, '_blank');
	}


function getVehicles() {
  //filter_vehicle(vehicledata);
  myVar2=setTimeout(function() {filter_vehicle(vehicledata); }, 200);
}




		function getVehicles1() {
		
					var company_id = selectedValues($('input[name="company_id"]'));
					var searchbus = $('input[name="searchbus"]').val();
					$('#buslist').empty();
					

     
					$.ajax({
					type: "POST",
					dataType:'json',
					url: "index.php",
					data:{'task':'getVehicles','searchbus':searchbus,'company_id':company_id},	cache: false,
					success: function(data)
							{
							
							//if(data.result == "success")
							//{

						

							

							

							for(var n=0;n<data.vehicles.length;n++){
							tr = $('<tr/>');
							tr.append('<td><input type="checkbox" name="bus_no" id="bus_no" value="'+data.vehicles[n].bus_id+'" class="cbox2" onchange="updateMap()"><br></td>');
							tr.append('<td style="color:#000000;"  class="textStyle">'+data.vehicles[n].bus_serial+'</td>');
							
							
							$("#buslist").append(tr);
							if(n>98)
								break;
							}

							vehicledata=data;

							addmarker(vehicledata,null);
							//updateMap();

							
							//}
							//else
						//	{
							
						//	}	
					},
					error:function(jqXHR, textStatus, errorThrown) {
					//alert(textStatus);
					}
					});//ajax close

   
	}//function close


//$('#searchbus').onkeyup(function(event){
//getVehicles();
//});
	


function updateVehicles(){
//getVehicles();
	//filter_vehicle(vehicledata);
	document.getElementById("map_view").style.display='block';
	 myVar2=setTimeout(function() {filter_vehicle(vehicledata); }, 200);
}

function updateMap(){
var bus_no = selectedValues($('input[name="bus_no"]'));
if(bus_no.length>0)
addmarker(searchdata,bus_no);
else
addmarker(searchdata,null);

}


function selectedValues(ele){
  var arr = [];
  for(var i = 0; i < ele.length; i++){
    if(ele[i].type == 'checkbox' && ele[i].checked){
      arr.push(ele[i].value);
    }
  }
  return arr;
}


var bus_loc_his;
function getLocationHistory(busid) {
		

	//var path_id = $('input[name="path_id_get"]').val();

     
					$.ajax({
					type: "GET",
					dataType:'json',
					url: "index.php",
					data:{'task':'getBusLocationHistory','busid':busid},	cache: false,
					success: function(data)
							{
							
							
							initialize(null);
							bus_loc_his=data;
							addmarker(bus_loc_his,null);
							//}

					},
					error:function(jqXHR, textStatus, errorThrown) {
					//alert(textStatus);
					}
					});//ajax close

   
	}//function close


function filterLocationHistoryByDate() {
	var dt1 = $('input[name="date1"]').val();
	var dt2 = $('input[name="date2"]').val();
	var tm1 = $('input[name="time1"]').val();
    var tm2 = $('input[name="time2"]').val();
addmarker(bus_loc_his,dt1,tm1,dt2,tm2);
}


	function compareDtTm(locdttm,dt1,tm1,dt2,tm2){
	//	alert(dt1);
	if(dt1==null || dt2==null || dt1.length<=0 || dt2.length<=0)
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

	

	var polygone= [[39.917665416,21.457788943],
[39.918211327,21.457322163],
[39.921307335,21.458108834],
[39.922847832,21.455001132],[39.924066501,21.453168315],[39.92592716,21.450369875],[39.927594217,21.447862507],[39.928872857,21.445939278],[39.930984663,21.44396589],[39.933693926,21.442004978],[39.935803224,21.440478243],[39.937844802,21.439218803],[39.940238221,21.438167124],[39.945005317,21.436072296],[39.946927688,21.435227484],[39.947290956,21.4347087],[39.94838,21.433153407],[39.949941923,21.430922716],[39.952486134,21.427288979],[39.955988999,21.422285709],[39.959754728,21.41690653],[39.961594035,21.414288217],[39.962727917,21.411759854],[39.96399663,21.408261198],[39.965506359,21.403794257],[39.966011666,21.402919069],[39.967447235,21.40238569],[39.969486192,21.401628095],[39.972512777,21.400401086],[39.975314645,21.399193157],[39.977245112,21.398212387],[39.980244077,21.396124292],[39.983065076,21.394160009],[39.985336117,21.392414511],[39.987184495,21.390391127],[39.989122284,21.388269787],[39.992719519,21.384043422],[39.994565945,21.381547357],[39.995739439,21.379960934],[39.999129019,21.375378393],[40.000163703,21.373030904],[40.005905605,21.35812793],[40.006329992,21.353967143],[40.006877986,21.348594209],[40.007450005,21.342985378],[40.007727927,21.340260146],[40.009193626,21.336976652],[40.010626884,21.333765688],[40.012038049,21.330604075],[40.01194857,21.328241688],[40.008735851,21.328113358],[40.006962862,21.328130632],[40.00393601,21.328368031],[40.000733283,21.328819073],[39.998972476,21.329052418],[39.996113124,21.329431303],[39.992502914,21.329412785],[39.988245346,21.32885124],[39.984557394,21.328134028],[39.98172438,21.327595441],[39.978394051,21.326937775],[39.973772115,21.326272747],[39.970445911,21.32629198],[39.967349743,21.326781643],[39.964206769,21.327710118],[39.962099444,21.328665835],[39.95940416,21.330011032],[39.956404549,21.331508038],[39.953856149,21.332779794],[39.949967395,21.334682466],[39.946602244,21.336402675],[39.943549221,21.338141005],[39.94121879,21.339748971],[39.939678897,21.341160093],[39.938482624,21.342256302],[39.935212732,21.345623824],[39.932844782,21.348072598],[39.930554411,21.350441036],[39.927989199,21.353120041],[39.926811526,21.354099103],[39.925293454,21.355361127],[39.923865543,21.356166439],[39.92197617,21.356990263],[39.917464332,21.358009927],[39.911077646,21.359371569],[39.897752585,21.362208655],[39.894450992,21.362923567],[39.893555007,21.363141956],[39.89255055,21.36345844],[39.890835169,21.364266298],[39.889428281,21.365262904],[39.887111317,21.367439213],[39.88239304,21.371815403],[39.879301062,21.374720312],[39.878748713,21.375343068],[39.877417977,21.377242328],[39.876614938,21.378831026],[39.874895246,21.384026396],[39.884684672,21.387108196],[39.893176053,21.389866924],[39.896938443,21.391502653],[39.895729508,21.392561826],[39.896804063,21.393572434],[39.897555198,21.396098911],[39.896413759,21.397271448],[39.895072228,21.398649498],[39.893861256,21.399957647],[39.892564415,21.401467179],[39.891082346,21.40217687],[39.890018563,21.402639714],[39.889662645,21.40291825],[39.889395972,21.403829949],[39.88585616,21.407211792],[39.884636423,21.408348131],[39.883186011,21.408884194],[39.882250649,21.409394562],[39.881265905,21.40985349],[39.880606946,21.410850971],[39.879526865,21.412110799],[39.873955115,21.416642869],[39.867412718,21.421394523],[39.864998108,21.422940824],[39.863762515,21.423381964],[39.861924405,21.42343385],[39.863345077,21.424055286],[39.862513446,21.42512234],[39.859821848,21.426204511],[39.859367606,21.427020689],[39.859628953,21.428246159],[39.860640477,21.429663509],[39.861413788,21.429173368],[39.861761125,21.42907739],[39.861026915,21.431438125],[39.863997698,21.429692575],[39.865052893,21.430924389],[39.867492971,21.432748904],[39.869391597,21.43404147],[39.870915703,21.435079034],[39.874908517,21.437797079],[39.879266436,21.440763432],[39.885963713,21.445321681],[39.890553209,21.44844502],[39.892891627,21.450036307],[39.896178272,21.452272744],[39.895336815,21.455200375],[39.897010421,21.456069177],[39.900797498,21.456369391],[39.902219698,21.456428467],[39.903870638,21.456009837],[39.906328159,21.456172705],[39.909759159,21.45651367],[39.911919994,21.457574128],[39.914074736,21.45804999],[39.916430808,21.458238055]
,[39.917665416,21.457788943]];

polygone1=[
[21.498892, 39.721131],[21.516396, 39.873803],[21.375337, 39.908181],[21.351145, 39.767810]
]
;


	function isPointInPoly(poly, pt){
		
        for(var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
            ((poly[i][1] <= pt[1] && pt[1] < poly[j][1]) || (poly[j][1] <= pt[1] && pt[1] < poly[i].y))
            && (pt[0] < (poly[j][0] - poly[i][0]) * (pt[1] - poly[i][1]) / (poly[j][1] - poly[i][1]) + poly[i][0])
            && (c = !c);

        return c;
    }


	function isLatLngInZone(latLngs,lat,lng){
  // latlngs = [{"lat":22.281610498720003,"lng":70.77577162868579},{"lat":22.28065743343672,"lng":70.77624369747241},{"lat":22.280860953131217,"lng":70.77672113067706},{"lat":22.281863655593973,"lng":70.7762061465462}];
  vertices_y = new Array();
  vertices_x = new Array();
  longitude_x = lng;
  latitude_y = lat;
  //latLngs = JSON.parse(latLngs);
  var r = 0;
  var i = 0;
  var j = 0;
  var c = false;
  var point = 0;

  for(r=0; r<latLngs.length; r++){
   vertices_y.push(latLngs[r][0]);
   vertices_x.push(latLngs[r][1]);
  }
  points_polygon = vertices_x.length;
  for(i = 0, j = points_polygon; i < points_polygon; j = i++){
   point = i;
   if(point == points_polygon)
    point = 0;
   if ( ((vertices_y[point]  >  latitude_y != (vertices_y[j] > latitude_y)) && (longitude_x < (vertices_x[j] - vertices_x[point]) * (latitude_y - vertices_y[point]) / (vertices_y[j] - vertices_y[point]) + vertices_x[point]) ) ){
    c = true;
	break;
   }
  }
  //alert(c);
return c;
}

function inside(point, vs) {
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html



    var x = point[0], y = point[1];

	//alert(vs.length+' '+x+' '+y);

    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i][1], yi = vs[i][0];
        var xj = vs[j][1], yj = vs[j][0];

        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }

    return inside;
};

