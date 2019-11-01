// 封装最简单仅显示功能的天地图，与元素无关
function BasicMap() {
    this.map = null;
    this.projection = null;
    this.view = null;
    this.layers = [];
    this.tiandituBackgroundLayer = null;
    this.tiandituAnnotationLayer = null;

    // 1. 设置投影和天地图底图
    this.setTiandituWGS84Layers = function (tk) {
        this.projection = ol.proj.get("EPSG:4326");
        this.tiandituBackgroundLayer = BasicMap.GetBackgroundLayerTiandituWGS84("vec_c", tk);
        this.tiandituAnnotationLayer = BasicMap.GetBackgroundLayerTiandituWGS84("cva_c", tk);
        this.layers = [this.tiandituBackgroundLayer, this.tiandituAnnotationLayer];
    };

    // 2.
    this.setView = function () {
        var lng = 109.64101147270823, lat = 29.064790457953674, zoom = 4;
        // if (gpsOn) {
        // }
        this.view = new ol.View({
            projection: this.projection,
            center: [lng, lat],
            zoom: zoom,
            maxZoom: 18, // 18级以上没有天地图底图
            minZoom: 3
        });

    };

    // 3.
    this.setMap = function (mapDivId) {
        this.map = new ol.Map({
            controls: ol.control.defaults({ attribution: false }).extend([new ol.control.ScaleLine()]),
            target: mapDivId,
            layers: this.layers,
            view: this.view
        });
    };

    this.lookAt = function lookAt(lng, lat, level) {
        this.view.setCenter([lng, lat]);
        this.view.setZoom(level);
    };

    this.gpsOn = function gpsOn() {
        var lng, lat, zoom;
        var self = this;
        function showPosition(position) {
            lng = position.coords.longitude;
            lat = position.coords.latitude;
            // console.log(lng + ", " + lat);
            zoom = 18;
            // self.lookAt(lng, lat, zoom);

            // 从国行移动设备中定位获取的坐标数据用的是GCJ02，天地图底图服务用的是wgs84
            gcjCoord = BasicMap.GCJ02ToWGS84(lng, lat); 
            self.lookAt(gcjCoord[0], gcjCoord[1], zoom); 
            var heading = position.coords.heading;
            var speed = position.coords.speed;
            var altitude = position.coords.altitude;
            var accuracy = position.coords.accuracy;
            var altitudeAccuracy = position.coords.altitudeAccuracy;
            var info = "heading: " + heading + "\nspeed: " + speed + "\naltitude: " + altitude + "\naccuracy: " + accuracy + "\naltitudeAccuracy: " + altitudeAccuracy;
            alert(info);
        }

        function showError(error) {
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    alert("User denied the request for Geolocation.");
                    break;
                case error.POSITION_UNAVAILABLE:
                    alert("Location information is unavailable.");
                    break;
                case error.TIMEOUT:
                    alert("The request to get user location timed out.");
                    break;
                case error.UNKNOWN_ERROR:
                    alert("An unknown error occurred.");
                    break;
            }
        }

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition, showError);
        }
        else {
            alert("Geolocation is not supported by this browser.");
        }

    };

    this.lookAtBounds = function (bounds) {
        this.view.fit(bounds, this.map.getSize());
        if (this.view.getZoom() > 18)
            this.map.getView().setZoom(18);
    };
}

BasicMap.GetBackgroundLayerTiandituWGS84 = function (layerType, tk) {
    var layer = new ol.layer.Tile({
        source: new ol.source.XYZ({
            url: 'http://t{0-6}.tianditu.com/DataServer?T=' + layerType + '&x={x}&y={y}&l={z}&tk=' + tk,
            projection: ol.proj.get("EPSG:4326")
        })
    });
    return layer;
};

BasicMap.PI = 3.1415926535897932384626;
BasicMap.A = 6378245.0;
BasicMap.EE = 0.00669342162296594323;

BasicMap.WGS84ToGCJ02 = function (lon, lat) {
    var dLat = BasicMap.TransformLat(lon - 105.0, lat - 35.0);
    var dLon = BasicMap.TransformLon(lon - 105.0, lat - 35.0);
    var radLat = lat / 180.0 * BasicMap.PI;
    var magic = Math.sin(radLat);
    magic = 1 - BasicMap.EE * magic * magic;
    var sqrtMagic = Math.sqrt(magic);
    dLat = (dLat * 180.0) / ((BasicMap.A * (1 - BasicMap.EE)) / (magic * sqrtMagic) * BasicMap.PI);
    dLon = (dLon * 180.0) / (BasicMap.A / sqrtMagic * Math.cos(radLat) * BasicMap.PI);
    var mgLat = lat + dLat;
    var mgLon = lon + dLon;
    return [mgLon, mgLat];
};

BasicMap.TransformLat = function(x, y) {
    var ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x)) + 
    (20.0 * Math.sin(6.0 * x * BasicMap.PI) + 20.0 * Math.sin(2.0 * x * BasicMap.PI)) * 2.0 / 3.0 + 
    (20.0 * Math.sin(y * BasicMap.PI) + 40.0 * Math.sin(y / 3.0 * BasicMap.PI)) * 2.0 / 3.0 + 
    (160.0 * Math.sin(y / 12.0 * BasicMap.PI) + 320 * Math.sin(y * BasicMap.PI / 30.0)) * 2.0 / 3.0;
    return ret;
};

BasicMap.TransformLon = function(x, y) {
    var ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x)) + 
    (20.0 * Math.sin(6.0 * x * BasicMap.PI) + 20.0 * Math.sin(2.0 * x * BasicMap.PI)) * 2.0 / 3.0 + 
    (20.0 * Math.sin(x * BasicMap.PI) + 40.0 * Math.sin(x / 3.0 * BasicMap.PI)) * 2.0 / 3.0 + 
    (150.0 * Math.sin(x / 12.0 * BasicMap.PI) + 300.0 * Math.sin(x / 30.0 * BasicMap.PI)) * 2.0 / 3.0;
    return ret;
};


BasicMap.Transform = function(lon, lat) {
    var dLat = BasicMap.TransformLat(lon - 105.0, lat - 35.0);
    var dLon = BasicMap.TransformLon(lon - 105.0, lat - 35.0);
    var radLat = lat / 180.0 * BasicMap.PI;
    var magic = Math.sin(radLat);
    magic = 1 - BasicMap.EE * magic * magic;
    var sqrtMagic = Math.sqrt(magic);
    dLat = (dLat * 180.0) / ((BasicMap.A * (1 - BasicMap.EE)) / (magic * sqrtMagic) * BasicMap.PI);
    dLon = (dLon * 180.0) / (BasicMap.A / sqrtMagic * Math.cos(radLat) * BasicMap.PI);
    var mgLat = lat + dLat;
    var mgLon = lon + dLon;
    return [mgLon, mgLat];
};

BasicMap.GCJ02ToWGS84 = function(lon, lat) {
    var gpsCoord = BasicMap.Transform(lon, lat);
    var gpsLon = lon * 2 - gpsCoord[0];
    var gpsLat = lat * 2 - gpsCoord[1];
    return [gpsLon, gpsLat];
};