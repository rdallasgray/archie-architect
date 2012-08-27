// Generated by CoffeeScript 1.3.3
(function(){var e,t;t=typeof exports!="undefined"&&exports!==null?exports:this,e=function(){function e(e){var t=this;this.lastLocation=new AR.GeoLocation(0,0,0),this.currentLocation=new AR.GeoLocation(0,0,0),this.photoGeoObjects={},this.placemarkGeoObjects={},this.imgResources={},this.locationChangedFunc=null,this.mode=null,this.requestBuffer=[],this.timeSinceLastRequest=this.REQUEST_INTERVAL,setInterval(function(){return t.clearRequestBuffer()},this.REQUEST_INTERVAL),this.request("loadedARView")}return e.prototype.DEFAULT_HEIGHT_SDU=2.5,e.prototype.RADIUS=300,e.prototype.MIN_SCALING_DISTANCE=30,e.prototype.DISTANCE_SCALE_LOG=1.7,e.prototype.MIN_SCALING_FACTOR=.1,e.prototype.OFFSET_Y_RANDOM_FACTOR=2,e.prototype.REQUEST_INTERVAL=50,e.prototype.LOG_LEVEL=2,e.prototype.log=function(e,t){t==null&&(t=1);if(t>=this.LOG_LEVEL)return console.log(e)},e.prototype.request=function(e){return this.requestBuffer.push(e)},e.prototype.clearRequestBuffer=function(){var e;e=this.requestBuffer.shift();if(e===void 0)return;return this.sendRequest(e)},e.prototype.sendRequest=function(e){return document.location="architectsdk://"+e},e.prototype.setLocation=function(e,t,n,r){var i;return i=[t,n,r],e.latitude=i[0],e.longitude=i[1],e.altitude=i[2],i},e.prototype.setLastLocation=function(e){return this.setLocation(this.lastLocation,e.latitude,e.longitude,e.altitude)},e.prototype.locationChanged=function(e,t,n,r){this.log("changing location to "+[e,t].join(", ")),this.setLocation(this.currentLocation,e,t,n);if(this.locationChangedFunc!==null)return this.locationChangedFunc()},e.prototype.setMode=function(e){this.log("setting mode "+e);if(e===this.mode)return;if(e==="photo")return this.setupPhotoMode();if(e==="placemark")return this.setupPlacemarkMode()},e.prototype.setupPhotoMode=function(){this.log("setting up photo mode"),this.locationChangedFunc=null,this.mode="photo",this.disablePlacemarks(),this.enablePhotos();if(this.locationChangeSufficient()||this.empty(this.photoGeoObjects))return this.cleanUpPhotos(),this.updatePhotos()},e.prototype.locationChangeSufficient=function(){var e;return e=this.currentLocation.distanceTo(this.lastLocation),this.log("distance from last location is "+e),e>this.RADIUS/5},e.prototype.maybeUpdatePhotos=function(){this.log("conditionally updating photos");if(this.locationChangeSufficient())return this.setLastLocation(this.currentLocation),this.cleanUpPhotos(),this.updatePhotos()},e.prototype.disablePhotos=function(){var e,t,n,r;this.log("disabling photos"),n=this.photoGeoObjects,r=[];for(e in n)t=n[e],r.push(t.enabled=!1);return r},e.prototype.enablePhotos=function(){var e,t,n,r;this.log("enabling photos"),n=this.photoGeoObjects,r=[];for(e in n)t=n[e],r.push(t.enabled=!0);return r},e.prototype.updatePhotos=function(){return this.log("updating photos"),this.requestPhotoData()},e.prototype.cleanUpPhotos=function(){var e,t,n,r,i,s;this.log("cleaning up photos"),i=this.photoGeoObjects,s=[];for(n in i)r=i[n],e=this.currentLocation.distanceTo(r.locations[0]),this.log("Object "+n+" is "+e+"m away"),e>this.RADIUS?(this.log("Destroying object "+n),s.push(this.destroyGeoObject("photo",n))):(this.log("Resetting opacity and scale on object "+n),s.push(function(){var n,i,s,o;s=r.drawables.cam,o=[];for(n=0,i=s.length;n<i;n++)t=s[n],o.push(this.setOpacityAndScaleOnDrawable(t,e));return o}.call(this)));return s},e.prototype.requestPhotoData=function(){return this.log("requesting photo data"),this.request("requestPhotoData.aos")},e.prototype.setPhotoData=function(e){var t,n;this.log("setting photo data"),this.cleanUpPhotos();for(n in e)t=e[n],this.createGeoObject(t.site_name,t.location,t.imgUri,n,"photoGeoObjects");return this.log("created photos")},e.prototype.setupPlacemarkMode=function(){return this.log("setting up placemark mode"),this.locationChangedFunc=null,this.mode="placemark",this.empty(this.placemarkGeoObjects)&&this.requestPlacemarkData(),this.disablePhotos(),this.enablePlacemarks(),this.locationChangeSufficient()&&this.updatePlacemarks,this.locationChangedFunc=this.maybeUpdatePlacemarks},e.prototype.requestPlacemarkData=function(){return this.log("requesting placemark data"),this.request("requestPlacemarkData.aos")},e.prototype.setPlacemarkData=function(e){var t,n;this.log("setting placemark data"),this.destroyPlacemarks();for(n in e)t=e[n],this.createGeoObject(t.site_name,t.location,t.imgUri,n,"placemarkGeoObjects");return this.log("created placemarks")},e.prototype.destroyPlacemarks=function(){var e,t,n,r;n=this.placemarkGeoObjects,r=[];for(e in n)t=n[e],r.push(this.destroyGeoObject("placemark",e));return r},e.prototype.enablePlacemarks=function(){var e,t,n,r;n=this.placemarkGeoObjects,r=[];for(e in n)t=n[e],r.push(t.enabled=!0);return r},e.prototype.disablePlacemarks=function(){var e,t,n,r;this.log("disabling placemarks"),n=this.placemarkGeoObjects,r=[];for(e in n)t=n[e],this.log("disabling placemark "+e),r.push(t.enabled=!1);return r},e.prototype.maybeUpdatePlacemarks=function(){this.log("conditionally updating placemarks");if(this.locationChangeSufficient)return this.setLastLocation(this.currentLocation),this.updatePlacemarks()},e.prototype.updatePlacemarks=function(){var e,t,n,r,i,s;this.log("updating placemarks"),i=this.placemarkGeoObjects,s=[];for(n in i)r=i[n],e=this.currentLocation.distanceTo(r.locations[0]),this.log("object "+n+" is "+e+"m away"),this.log("resetting opacity and scale on object "+n),s.push(function(){var n,i,s,o;s=r.drawables.cam,o=[];for(n=0,i=s.length;n<i;n++)t=s[n],o.push(this.setOpacityAndScaleOnDrawable(t,e));return o}.call(this));return s},e.prototype.scalingFactor=function(e){var t;return e>this.MIN_SCALING_DISTANCE?(t=Math.log(e/this.MIN_SCALING_DISTANCE)/Math.log(this.DISTANCE_SCALE_LOG),Math.max(1-t/10,this.MIN_SCALING_FACTOR)):1},e.prototype.setOpacityAndScaleOnDrawable=function(e,t){var n;return n=this.scalingFactor(t),e.scale=n,e.opacity=n,e.offsetY=e.origOffsetY*n},e.prototype.destroyGeoObject=function(e,t){var n,r;return e==null&&(e="photo"),this.log("destroying "+e+" geoObjects"),n=this[""+e+"GeoObjects"],r=n[t],this.log("disabling geoobject"),r.enabled=!1,this.log("removing cam drawables"),r.drawables.cam=[],this.log("destroying geoobject"),r.destroy(),this.log("deleting object from collection"),delete n[t]},e.prototype.createGeoObject=function(e,t,n,r,i){var s,o,u,a,f,l,c,h=this;this.log("creating geoObject "+r+", "+e+" in collection "+i),s=this[i];if(s[r]!==void 0){this.log("object already exists");return}return t=new AR.GeoLocation(t.lat,t.long,t.alt),o=this.currentLocation.distanceTo(t),u={offsetY:Math.random()*this.OFFSET_Y_RANDOM_FACTOR-this.OFFSET_Y_RANDOM_FACTOR/2,enabled:!0},a=new AR.GeoObject(t,{enabled:!1}),l=this.createImageResource(n,a),f=this.createImageDrawable(l,u),f.origOffsetY=f.offsetY,f.triggers.onClick=function(){return h.objectWasClicked(r,i)},this.setOpacityAndScaleOnDrawable(f,o),a.drawables.addCamDrawable(f),c=this.createLabel(e,u),this.setOpacityAndScaleOnDrawable(c,o),a.drawables.addCamDrawable(c),s[r]=a},e.prototype.objectWasClicked=function(e,t){return this.log("clicked "+e+", "+t),this.request("clickedObject.aos?id="+e+"&collection="+t)},e.prototype.createImageResource=function(e,t){var n,r=this;return this.log("creating imageResource for "+e),n=new AR.ImageResource(e,{onError:function(){return r.log("error loading image "+e)},onLoaded:function(){if(n.getHeight()!==109||n.getWidth()!==109)return r.log("loaded image "+e),t.enabled=!0}}),n},e.prototype.createImageDrawable=function(e,t){return new AR.ImageDrawable(e,this.DEFAULT_HEIGHT_SDU,t)},e.prototype.createLabel=function(e,t,n){var r;return t.offsetY=t.offsetY-1.75,t.style={backgroundColor:"#ffffff"},r=new AR.Label(e,.6,t),r.origOffsetY=t.offsetY,r},e.prototype.empty=function(e){var t,n;for(t in e)return n=e[t],!1;return!0},e.prototype.lengthOf=function(e){var t,n,r;t=0;for(n in e)r=e[n],t++;return t},e}(),t.Canmore={Architect:e},Canmore.archie=new Canmore.Architect("http://glowing-moon-5208.heroku.com/"),AR.context.onLocationChanged=function(e,t,n,r){return Canmore.archie.locationChanged(e,t,n,r)}}).call(this)