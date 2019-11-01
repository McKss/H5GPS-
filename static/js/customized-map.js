// 继承自BasicMap，定制化地图，与元素有关
function CustomizedMap() {
    BasicMap.call(this);
    
    this.pointerLngLat = [];
    this.bindViewPortMoveEvents = function() {
        // 窗口中心坐标
        var self = this;
        this.map.on('moveend', function (evt) {
            var center = self.view.getCenter();
            var zoom = self.view.getZoom();
            $("#lngInput").val(center[0]);
            $("#latInput").val(center[1]);
            $("#levelInput").val(zoom);
        });
    };
    this.bindMouseMoveEvents = function() {
        var self = this;
        this.map.on('pointermove', function(evt) {
            self.pointerLngLat[0] = evt.coordinate[0];
            self.pointerLngLat[1] = evt.coordinate[1];
            var x = new Number(evt.coordinate[0]);
            var y = new Number(evt.coordinate[1]);
            $('#pointerX').html(x.toFixed(10));
            $("#pointerY").html(y.toFixed(10));
        });
    };

    // 放在setMap后面
    this.isImg = false;
    this.elems = ["lngLabel", "latLabel", "zoomLabel", "annotationLabel", "switchBackgroundLayerButton"];
    this.switchBackgroundLayerType = function () {
        this.isImg ^= true;
        if (this.isImg) {
            this.map.getLayers().getArray()[0] = BasicMap.GetBackgroundLayerTiandituWGS84('img_c', '00c1b6f5154a797086ca8969e5883144');
            for (var i = 0; i < this.elems.length; i++) {
                document.getElementById(this.elems[i]).style.color = "white";
            }
            document.getElementById("switchBackgroundLayerButton").innerHTML = "切换为地图";
            this.map.updateSize();
        } else {
            this.map.getLayers().getArray()[0] = BasicMap.GetBackgroundLayerTiandituWGS84('vec_c', '00c1b6f5154a797086ca8969e5883144');
            for (var i = 0; i < this.elems.length; i++) {
                document.getElementById(this.elems[i]).style.color = "black";
            }
            document.getElementById("switchBackgroundLayerButton").innerHTML = "切换为影像";
            this.map.updateSize();
        }
    };
}

(function() {
    var Super = function() {};
    Super.prototype = BasicMap.prototype;
    CustomizedMap.prototype = new Super();
    CustomizedMap.prototype.constructor = CustomizedMap;
})();
