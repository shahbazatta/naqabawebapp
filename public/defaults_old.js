import { _ as __rest, S as Supercluster, f as fastDeepEqual, L as Loader } from './vendor.js';

/**
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const LOADER_OPTIONS = {
    apiKey: "AIzaSyAN0ZcCiG3WT9NUgfJXgFLebI4s2QEXzJE",//AIzaSyCvNlA2IYGWidUGQm3zMfN9PCOBrI9kKKw
    version: "weekly",
    libraries: [],
};

/**
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Cluster {
    constructor({ markers, position }) {
        this.markers = markers;
        if (position) {
            if (position instanceof google.maps.LatLng) {
                this._position = position;
            }
            else {
                this._position = new google.maps.LatLng(position);
            }
        }
    }
    get bounds() {
        if (this.markers.length === 0 && !this._position) {
            return undefined;
        }
        return this.markers.reduce((bounds, marker) => {
            return bounds.extend(marker.getPosition());
        }, new google.maps.LatLngBounds(this._position, this._position));
    }
    get position() {
        return this._position || this.bounds.getCenter();
    }
    /**
     * Get the count of **visible** markers.
     */
    get count() {
        return this.markers.filter((m) => m.getVisible())
            .length;
    }
    /**
     * Add a marker to the cluster.
     */
    push(marker) {
        this.markers.push(marker);
    }
    /**
     * Cleanup references and remove marker from map.
     */
    delete() {
        if (this.marker) {
            this.marker.setMap(null);
            delete this.marker;
        }
        this.markers.length = 0;
    }
}

/**
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * @hidden
 */
class AbstractAlgorithm {
    constructor({ maxZoom = 16 }) {
        this.maxZoom = maxZoom;
    }
    /**
     * Helper function to bypass clustering based upon some map state such as
     * zoom, number of markers, etc.
     *
     * ```typescript
     *  cluster({markers, map}: AlgorithmInput): Cluster[] {
     *    if (shouldBypassClustering(map)) {
     *      return this.noop({markers, map})
     *    }
     * }
     * ```
     */
    noop({ markers }) {
        return noop(markers);
    }
}
/**
 * @hidden
 */
const noop = (markers) => {
    const clusters = markers.map((marker) => new Cluster({
        position: marker.getPosition(),
        markers: [marker],
    }));
    return clusters;
};

/**
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * A very fast JavaScript algorithm for geospatial point clustering using KD trees.
 *
 * @see https://www.npmjs.com/package/supercluster for more information on options.
 */
class SuperClusterAlgorithm extends AbstractAlgorithm {
    constructor(_a) {
        var { maxZoom, radius = 60 } = _a, options = __rest(_a, ["maxZoom", "radius"]);
        super({ maxZoom });
        this.superCluster = new Supercluster(Object.assign({ maxZoom: this.maxZoom, radius }, options));
        this.state = { zoom: null };
    }
    calculate(input) {
        let changed = false;
        if (!fastDeepEqual(input.markers, this.markers)) {
            changed = true;
            // TODO use proxy to avoid copy?
            this.markers = [...input.markers];
            const points = this.markers.map((marker) => {
                return {
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        coordinates: [
                            marker.getPosition().lng(),
                            marker.getPosition().lat(),
                        ],
                    },
                    properties: { marker },
                };
            });
            this.superCluster.load(points);
        }
        const state = { zoom: input.map.getZoom() };
        if (!changed) {
            if (this.state.zoom > this.maxZoom && state.zoom > this.maxZoom) ;
            else {
                changed = changed || !fastDeepEqual(this.state, state);
            }
        }
        this.state = state;
        if (changed) {
            this.clusters = this.cluster(input);
        }
        return { clusters: this.clusters, changed };
    }
    cluster({ map }) {
        return this.superCluster
            .getClusters([-180, -90, 180, 90], Math.round(map.getZoom()))
            .map(this.transformCluster.bind(this));
    }
    transformCluster({ geometry: { coordinates: [lng, lat], }, properties, }) {
        if (properties.cluster) {
            return new Cluster({
                markers: this.superCluster
                    .getLeaves(properties.cluster_id, Infinity)
                    .map((leaf) => leaf.properties.marker),
                position: new google.maps.LatLng({ lat, lng }),
            });
        }
        else {
            const marker = properties.marker;
            return new Cluster({
                markers: [marker],
                position: marker.getPosition(),
            });
        }
    }
}

/**
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Provides statistics on all clusters in the current render cycle for use in {@link Renderer.render}.
 */
class ClusterStats {
    constructor(markers, clusters) {
        this.markers = { sum: markers.length };
        const clusterMarkerCounts = clusters.map((a) => a.count);
        const clusterMarkerSum = clusterMarkerCounts.reduce((a, b) => a + b, 0);
        this.clusters = {
            count: clusters.length,
            markers: {
                mean: clusterMarkerSum / clusters.length,
                sum: clusterMarkerSum,
                min: Math.min(...clusterMarkerCounts),
                max: Math.max(...clusterMarkerCounts),
            },
        };
    }
}
class DefaultRenderer {
    /**
     * The default render function for the library used by {@link MarkerClusterer}.
     *
     * Currently set to use the following:
     *
     * ```typescript
     * // change color if this cluster has more markers than the mean cluster
     * const color =
     *   count > Math.max(10, stats.clusters.markers.mean)
     *     ? "#ff0000"
     *     : "#0000ff";
     *
     * // create svg url with fill color
     * const svg = window.btoa(`
     * <svg fill="${color}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
     *   <circle cx="120" cy="120" opacity=".6" r="70" />
     *   <circle cx="120" cy="120" opacity=".3" r="90" />
     *   <circle cx="120" cy="120" opacity=".2" r="110" />
     *   <circle cx="120" cy="120" opacity=".1" r="130" />
     * </svg>`);
     *
     * // create marker using svg icon
     * return new google.maps.Marker({
     *   position,
     *   icon: {
     *     url: `data:image/svg+xml;base64,${svg}`,
     *     scaledSize: new google.maps.Size(45, 45),
     *   },
     *   label: {
     *     text: String(count),
     *     color: "rgba(255,255,255,0.9)",
     *     fontSize: "12px",
     *   },
     *   // adjust zIndex to be above other markers
     *   zIndex: 1000 + count,
     * });
     * ```
     */
    render({ count, position }, stats) {
        // change color if this cluster has more markers than the mean cluster
        //const color = count > Math.max(10, stats.clusters.markers.mean) ? "#ff0000" : "#0000ff";
		var color;
		if(count<10)
			color="#209FEC";
		else if(count<20)
			color="#EEC225";
		else if(count<30)
			color="#F56526";
		else if(count<40)
			color="#FA0001";
		else 
			color="#C40100";
		
		
        // create svg url with fill color
        const svg = window.btoa(`
  <svg fill="${color}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
    <circle cx="120" cy="120" opacity=".6" r="70" />
    <circle cx="120" cy="120" opacity=".3" r="90" />
    <circle cx="120" cy="120" opacity=".2" r="110" />
  </svg>`);
        // create marker using svg icon
        return new google.maps.Marker({
            position,
            icon: {
                url: `data:image/svg+xml;base64,${svg}`,
                scaledSize: new google.maps.Size(45, 45),
            },
            label: {
                text: String(count),
                color: "rgba(255,255,255,0.9)",
                fontSize: "12px",
            },
            title: `${count} AVL devices`,
            // adjust zIndex to be above other markers
            zIndex: Number(google.maps.Marker.MAX_ZINDEX) + count,
        });
    }
}

/**
 * Copyright 2019 Google LLC. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Extends an object's prototype by another's.
 *
 * @param type1 The Type to be extended.
 * @param type2 The Type to extend with.
 * @ignore
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extend(type1, type2) {
    /* istanbul ignore next */
    // eslint-disable-next-line prefer-const
    for (let property in type2.prototype) {
        type1.prototype[property] = type2.prototype[property];
    }
}
/**
 * @ignore
 */
class OverlayViewSafe {
    constructor() {
        // MarkerClusterer implements google.maps.OverlayView interface. We use the
        // extend function to extend MarkerClusterer with google.maps.OverlayView
        // because it might not always be available when the code is defined so we
        // look for it at the last possible moment. If it doesn't exist now then
        // there is no point going ahead :)
        extend(OverlayViewSafe, google.maps.OverlayView);
    }
}

/**
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var MarkerClustererEvents;
(function (MarkerClustererEvents) {
    MarkerClustererEvents["CLUSTERING_BEGIN"] = "clusteringbegin";
    MarkerClustererEvents["CLUSTERING_END"] = "clusteringend";
    MarkerClustererEvents["CLUSTER_CLICK"] = "click";
})(MarkerClustererEvents || (MarkerClustererEvents = {}));
const defaultOnClusterClickHandler = (_, cluster, map) => {
    map.fitBounds(cluster.bounds);
};
/**
 * MarkerClusterer creates and manages per-zoom-level clusters for large amounts
 * of markers. See {@link MarkerClustererOptions} for more details.
 *
 */
class MarkerClusterer extends OverlayViewSafe {
    constructor({ map, markers = [], algorithm = new SuperClusterAlgorithm({}), renderer = new DefaultRenderer(), onClusterClick = defaultOnClusterClickHandler, }) {
        super();
        this.markers = [...markers];
        this.clusters = [];
        this.algorithm = algorithm;
        this.renderer = renderer;
        this.onClusterClick = onClusterClick;
        if (map) {
            this.setMap(map);
        }
    }
    addMarker(marker, noDraw) {
        if (this.markers.includes(marker)) {
            return;
        }
        this.markers.push(marker);
        if (!noDraw) {
            this.render();
        }
    }
    addMarkers(markers, noDraw) {
        markers.forEach((marker) => {
            this.addMarker(marker, true);
        });
        if (!noDraw) {
            this.render();
        }
    }
    removeMarker(marker, noDraw) {
        const index = this.markers.indexOf(marker);
        if (index === -1) {
            // Marker is not in our list of markers, so do nothing:
            return false;
        }
        marker.setMap(null);
        this.markers.splice(index, 1); // Remove the marker from the list of managed markers
        if (!noDraw) {
            this.render();
        }
        return true;
    }
    removeMarkers(markers, noDraw) {
        let removed = false;
        markers.forEach((marker) => {
            removed = this.removeMarker(marker, true) || removed;
        });
        if (removed && !noDraw) {
            this.render();
        }
        return removed;
    }
    clearMarkers(noDraw) {
        this.markers.length = 0;
        if (!noDraw) {
            this.render();
        }
    }
    /**
     * Recalculates and draws all the marker clusters.
     */
    render() {
        const map = this.getMap();
        if (map instanceof google.maps.Map && this.getProjection()) {
            google.maps.event.trigger(this, MarkerClustererEvents.CLUSTERING_BEGIN, this);
            const { clusters, changed } = this.algorithm.calculate({
                markers: this.markers,
                map,
                mapCanvasProjection: this.getProjection(),
            });
            // allow algorithms to return flag on whether the clusters/markers have changed
            if (changed || changed == undefined) {
                // reset visibility of markers and clusters
                this.reset();
                // store new clusters
                this.clusters = clusters;
                this.renderClusters();
            }
            google.maps.event.trigger(this, MarkerClustererEvents.CLUSTERING_END, this);
        }
    }
    onAdd() {
        this.idleListener = this.getMap().addListener("idle", this.render.bind(this));
        this.render();
    }
    onRemove() {
        google.maps.event.removeListener(this.idleListener);
        this.reset();
    }
    reset() {
        this.markers.forEach((marker) => marker.setMap(null));
        this.clusters.forEach((cluster) => cluster.delete());
        this.clusters = [];
    }
    renderClusters() {
        // generate stats to pass to renderers
        const stats = new ClusterStats(this.markers, this.clusters);
        const map = this.getMap();
        this.clusters.forEach((cluster) => {
            if (cluster.markers.length === 1) {
                cluster.marker = cluster.markers[0];
            }
            else {
                cluster.marker = this.renderer.render(cluster, stats);
                if (this.onClusterClick) {
                    cluster.marker.addListener("click", 
                    /* istanbul ignore next */
                    (event) => {
                        google.maps.event.trigger(this, MarkerClustererEvents.CLUSTER_CLICK, cluster);
                        this.onClusterClick(event, cluster, map);
                    });
                }
            }
            cluster.marker.setMap(map);
        });
    }
}



/*
var trees = [
	{
		geometry: {
			type: "Point",
			coordinates: [
				-73.84421521958048,
				40.723091773924274
			]
		},
		status: "Alive",
		health: "Fair",
		spc_common: "red maple"
	},
	
	{
		geometry: {
			type: "Point",
			coordinates: [
				-74.09660153562089,
				40.59258559746177
			]
		},
		status: "Alive",
		health: "Good",
		spc_common: "Norway maple"
	},
	{
		geometry: {
			type: "Point",
			coordinates: [
				-73.79587098829472,
				40.76495851787223
			]
		},
		status: "Alive",
		health: "Fair",
		spc_common: "Norway maple"
	}
];
*/
/**
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var markers;
var element;
var markerCluster;

var trees=[];
const mapOptions = {
    center: { lat: 24.47275733947754, lng: 39.60734176635742 },
    zoom: 5,
	mapTypeId: 'roadmap',
	zoomControl: false,
    scaleControl: false,
    streetViewControl: false,
    disableDefaultUI: true,
};
loder=new Loader(LOADER_OPTIONS);
Loader.prototype.filter_vehicle1=filter_vehicle;
loder.load().then(() => {
	element = document.getElementById("map");
    map = new google.maps.Map(element, mapOptions);
	 
	getListFromServer();
	
	//getVehicles_data(map);
	
	
//setTimeout(function() {Loader.instance.load()}, 2000);



	
});







function getListFromServer() {
	//localStorage.removeItem("comp_data1");
	//localStorage.removeItem("comp_data3");
	var data=localStorage.getItem("comp_data3");
		if(data==null){
		$.ajax({
		type: "GET",
		dataType:'json',
		url: "/api/getCompanyData",//'avl_comp':'الأجهزة المحمولة'
		data:{},	cache: false,
		success: function(data)
		{
			parseData(data);
			localStorage.setItem("comp_data3",JSON.stringify(data));
			getVehicles_data(map);
		},
		error:function(jqXHR, textStatus, errorThrown) {
		}
		});//ajax close
		}else{
			var data1=JSON.parse(data);
			parseData(data1);
			getVehicles_data(map);
		}

}//function close

var company_list = [];
var trans_comp_list = [];
var company_list_ar = [];
var trans_comp_list_ar = [];
var dev_comp_list = ["BCE", "Teltonika", "Machinestalk", "Ruptela", "Queclink"];
var dev_comp_list_value = ["3000", "3001", "3002", "3003", "3004"];
var imei_list = [];

function parseData(data) {
    company_list = [];
    var len = data.length;
	
    if (len <= 0) {

    } else {
		len=data[0].comp_ar.length;
		
		for (var i = 0; i < len; i++) {
		company_list.push(data[0].comp_ar[i].id);
		company_list_ar.push(data[0].comp_ar[i].name);
		}
		
		len=data[0].trans_ar.length;
		
		for (var i = 0; i < len; i++) {
		trans_comp_list.push(data[0].trans_ar[i].id);
		trans_comp_list_ar.push(data[0].trans_ar[i].name);
		}
		
      /*  for (var i = 0; i < len; i++) {
         //   var cnm = data[i].avl_comp;
          //  if (company_list.indexOf(cnm) === -1){
                company_list.push(data.comp_ar[i].id);
				  company_list_ar.push(data.comp_ar[i].name);
			//}

            var cnm = data[i].trnspt_comp;
            if (trans_comp_list.indexOf(cnm) === -1){
                trans_comp_list.push(cnm);
				trans_comp_list_ar.push(data[i].trnspt_comp_ar);
			}

            //  var cnm=data[i].device_comp;
            //if (dev_comp_list.indexOf(cnm) === -1)
            //   dev_comp_list.push(cnm);

            var cnm = data[i].imei;
            if (imei_list.indexOf(cnm) === -1)
                imei_list.push(cnm);
        }*/
    }


    addAllFilterList();

}
function addAllFilterList() {
    $('#companylist').empty();
    var len = company_list.length;

    for (var n = 0; n < len; n++) {
        var tr = $('<tr/>');
        tr.append('<td><input type="checkbox" name="comp_id" id="comp_id" value="' + company_list[n] + '" class="cbox2" onchange="updateFilterList1();"><br></td>');
        tr.append('<td style="color:#000000;"  class="textStyle">' + company_list_ar[n] + '</td>');
        $("#companylist").append(tr);
    }




    $('#transport_comp_list').empty();
    var len = trans_comp_list.length;

    for (var n = 0; n < len; n++) {
        tr = $('<tr/>');
        tr.append('<td><input type="checkbox" name="trans_comp_id" id="trans_comp_id" value="' + trans_comp_list[n] + '" class="cbox2" onchange="updateFilterList1()"><br></td>');
        tr.append('<td style="color:#000000;"  class="textStyle">' + trans_comp_list_ar[n] + '</td>');
        $("#transport_comp_list").append(tr);
    }


    $('#dev_comp_list').empty();
    var len = dev_comp_list.length;

    for (var n = 0; n < len; n++) {
        tr = $('<tr/>');
        tr.append('<td><input type="checkbox" name="dev_comp_id" id="dev_comp_id" value="' + dev_comp_list_value[n] + '" class="cbox2" onchange="updateFilterList1()"><br></td>');
        tr.append('<td style="color:#000000;"  class="textStyle">' + dev_comp_list[n] + '</td>');
        $("#dev_comp_list").append(tr);
    }

}


function loadMapData(map) {

    var image_n = {
        url: 'images/marker_img_new1.png'
    };
    var image_r = {
        url: 'images/marker_img_new3.png'
    };

    //const element = document.getElementById("map");
    // const map = new google.maps.Map(element, mapOptions);
    if (markerCluster != null)
        markerCluster.clearMarkers();
    if (markers != null) {
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(null);
        }
        markers = [];
    }
    markers = trees.map((x) => new google.maps.Marker({
        position: {
            lat: x.c[1],
            lng: x.c[0],
        },
        map,
        title: '' + x.a,
        data: x,

        icon: x.h > 0 ? image_n : image_r,

    }));

    /*for (var i = 0; i < markers.length; i++) {
    var marker =markers[i];
    google.maps.event.addListener(marker,'click',function() {
    //var element = document.getElementById("map");
    element.style.height='90%';
    updateDeviceDetails(marker.data);
    alert(marker.title);
    });
    
    }*/


    var listeners = [];
    for (var i = 0; i < markers.length; i++) {
        (function(index) { //create a closure, variable 'index' will take its value from variable i, but won't be affected by changed i in the outer scope
            var marker = markers[index]; //use this scope's index variable instead of i
			//marker.style.transform = 'rotate(' + 50 + 'deg)';
            listeners[index] = new google.maps.event.addListener(marker, 'click', function() {
                //  element.style.height='90%';
                updateDeviceDetails(marker.data);
                //  alert(marker.title);
            });
        })(i);
    }


    markerCluster = new MarkerClusterer({
        markers,
    });



    markerCluster.setMap(map);
	document.getElementById("loading_id").style.display="none";
}
function updateDeviceDetails(data){
	deviceselected=data.a;
	var devln=Object.keys(data.m).length;
	var row='';
	row+='<div style="width:190px;float:right;text-align:right;padding-right:10px;font-weight:bold">رقم IMEI:</div>'+
	'<div style="width:180px;text-align:right;padding-left:10px;font-weight:bold">رقم اللوحة:</div>';
	
	row+='<div style="width:190px;float:right;text-align:right;padding-right:10px">'+data.a+'</div>'+
	'<div style="width:180px;text-align:right;padding-left:10px">'+data.m.p+'</div>';
	
	
	
	row+='<div style="width:190px;float:right;text-align:right;padding-right:10px;margin-top:10px;font-weight:bold">الوقت ( الخادم ):</div>'+
	'<div style="width:180px;text-align:right;padding-left:10px;margin-top:10px;font-weight:bold">الوقت ( جهاز التتبع ):</div>';
	
	row+='<div style="width:190px;float:right;text-align:right;padding-right:10px;">'+getTimeFormat(data.k)+'</div>'+
	'<div style="width:180px;text-align:right;padding-left:10px">'+getTimeFormat(data.b)+'</div>';
	
	row+='<div style="width:190px;float:right;text-align:right;padding-right:10px;margin-top:10px;font-weight:bold">نوع الجهاز :</div>'+
	'<div style="width:180px;text-align:right;padding-left:10px;margin-top:10px;font-weight:bold">شركة النقل :</div>';
	
	row+='<div style="width:190px;float:right;text-align:right;padding-right:10px;">'+data.m.w+'</div>'+
	'<div style="width:180px;text-align:right;padding-left:10px">'+data.m.t+'</div>';
	
	row+='<div style="width:190px;float:right;text-align:right;padding-right:10px;margin-top:10px;font-weight:bold">السرعة :</div>'+
	'<div style="width:180px;text-align:right;padding-left:10px;margin-top:10px;font-weight:bold">الارتفاع :</div>';
	
	row+='<div style="width:190px;float:right;text-align:right;padding-right:10px;">'+data.h+' km/h</div>'+
	'<div style="width:180px;text-align:right;padding-left:10px">'+data.f+'</div>';
	
	row+='<div style="width:190px;float:right;text-align:right;padding-right:10px;margin-top:10px;font-weight:bold">الزاوية:</div>'+
	'<div style="width:180px;text-align:right;padding-left:10px;margin-top:10px;font-weight:bold">رقم المدخل:</div>';
	
	row+='<div style="width:190px;float:right;text-align:right;padding-right:10px;">'+data.g+'</div>'+
	'<div style="width:180px;text-align:right;padding-left:10px">'+data.i+'</div>';
	
	row+='<div style="width:190px;float:right;text-align:right;padding-right:10px;margin-top:10px;font-weight:bold">الرقم التشغيلي للحافلة:</div>'+
	'<div style="width:180px;text-align:right;padding-left:10px;margin-top:10px;font-weight:bold">الحالة:</div>';
	
	row+='<div style="width:190px;float:right;text-align:right;padding-right:10px;">'+data.m.r+'</div>'+
	'<div style="width:180px;text-align:right;padding-left:10px">'+'N/A'+'</div>';
	
	
	row+='<div style="width:390px;float:right;text-align:right;padding-right:10px;margin-top:10px;font-weight:bold">الموقع:</div>';
	
	row+='<div style="width:390px;float:right;text-align:right;padding-right:10px;">'+data.c[1]+','+data.c[0]+'</div>';
	
	
	
   document.getElementById("legend_data").innerHTML  = row;

   if( devln!=0){
    document.getElementById("avlcomp").innerHTML=data.m.y;
    document.getElementById("busno").innerHTML=data.m.n;
   }else{
	document.getElementById("avlcomp").innerHTML='&nbsp;';
	document.getElementById("busno").innerHTML='&nbsp;';
   }
document.getElementById("map_table").style.display='block';

}

function getVehicles_data(map) {

			$.ajax({
			type: "GET",
			dataType:'json',
			url: "/api/getDevicesData1",
			data:{},	cache: false,//'token':'cebc8011932a85c60a7e079b840bf083161812d3'
			success: function(data)
				{
			vehicledata=data;
			filter_vehicle(vehicledata);
			if(myVar2!=null)
			clearTimeout(myVar2);
			myVar2=setTimeout(function() {getVehicles_data(map)}, 60000);
			},
			error:function(jqXHR, textStatus, errorThrown) {
			}
			});//ajax close


	}//function close

	
function filter_vehicle(data) {
	var searchimei = $('input[name="searchimei"]').val();
	var dev_comp_id = selectedValues($('input[name="dev_comp_id"]'));
	var comp_id = selectedValues($('input[name="comp_id"]'));
	var trans_comp_id = selectedValues($('input[name="trans_comp_id"]'));
	var searchbus = $('input[name="searchbus"]').val();
	var searchbus_op_no = $('input[name="searchbus_op_no"]').val();
	if(trees!=null)
	trees=[];
	var ln=0;//data.length;
	if(data!=null)
		ln=data.length;
	var cnt=0;
	var cnt1=0;
	
	for(var n=0;n<ln;n++){
		if(data[n].c[0]!=null && data[n].c[1]>10 && data[n].c[1]<36 && data[n].c[0]>28 && data[n].c[0]<70){
       cnt1++;		
		if(isvalidData(data[n].i,dev_comp_id) && isvalidData(data[n].m.x,comp_id) && isvalidData(data[n].m.s,trans_comp_id)){
					
					
					if(searchimei==null || searchimei=='' || (data[n].a+'').indexOf(searchimei)>=0 ){
						if(searchbus==null || searchbus=='' || (data[n].m.n+'').indexOf(searchbus)>=0 ){
							if(searchbus_op_no==null || searchbus_op_no=='' || (data[n].m.r+'').indexOf(searchbus_op_no)>=0 ){
								trees.push(data[n]);
								if(deviceselected!=null){
									if(deviceselected==data[n].a)
										updateDeviceDetails(data[n]);
										
								}
								cnt++;
							}
						}
					}
		}
	}
	}
	document.getElementById("number-of-dev").innerHTML  = cnt1+" / "+cnt;
loadMapData(map);
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



function getTimeFormat(timestamp){
if(timestamp<10000000000)
		timestamp=timestamp*1000;
var m = new Date(timestamp);
return m.toLocaleString();
}
