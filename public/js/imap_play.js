var slider = document.getElementById("myRange");
var speed=1;
function speedup(){
if(speed<10)
speed++;
else
speed=1;
document.getElementById("forward").src="images/forward.png";
document.getElementById("forward").title=speed;
document.getElementById("speedtxt").innerHTML=speed+'x';
}

var play=0;

slider.oninput = function() {
  var c_sld_val=parseInt(slider.value);
  var total=mdata.length;
	pos=total-parseInt(1*c_sld_val*total/100);
	//alert(pos);
}

function increaseSliderVal(total,pos){

//var c_sld_val=parseInt(slider.value);
//if((c_sld_val)<100){
//c_sld_val=c_sld_val+1;
var c_sld_val=parseInt(100*(total-pos)/total);
//alert(c_sld_val);
slider.value=c_sld_val;
//}
}

function playpause(){
if(play==0){
	play=1;
	document.getElementById("statusview").style.display='block';
	document.getElementById("play_pause").src="images/pause.png";
	setTimeout(function() {  animateMarker(); }, 100);
	
}
else{
	play=0;
	document.getElementById("play_pause").src="images/play.png";
	document.getElementById("statusview").style.display='none';
}
}


