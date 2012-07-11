// Generated by CoffeeScript 1.3.3
(function(){var e,t;t=typeof exports!="undefined"&&exports!==null?exports:this,e=function(){function e(e){this.canmoreRequestUrl=e||this.CANMORE_REQUEST_URL,this.lastLocation=new AR.GeoLocation(0,0,0),this.currentLocation=new AR.GeoLocation(0,0,0),this.geoObjects={},this.ARLoggerActivated=!1}return e.prototype.CANMORE_REQUEST_URL="/",e.prototype.TEST_LOCATION=[55.8791,-4.2788,59],e.prototype.LAT_METERS=1e5,e.prototype.LONG_METERS=7e4,e.prototype.RADIUS=500,e.prototype.DEFAULT_HEIGHT_SDU=4.5,e.prototype.DISTANCE_SCALE_FACTOR=1.75,e.prototype.MIN_SCALING_DISTANCE=100,e.prototype.OFFSET_Y_RANDOM_FACTOR=3,e.prototype.log=function(e){return $("#status").html("<p>"+e+"</p>")},e.prototype.setLocation=function(e,t,n,r){var i;return i=[t,n,r],e.latitude=i[0],e.longitude=i[1],e.altitude=i[2],i},e.prototype.setLastLocation=function(e){return this.setLocation(this.lastLocation,e.latitude,e.longitude,e.altitude)},e.prototype.locationChanged=function(e,t,n,r){this.log("changing location to "+[e,t].join(", ")),this.setLocation(this.currentLocation,e,t,n);if(this.currentLocation.distanceTo(this.lastLocation)>this.RADIUS/5)return this.setLastLocation(this.currentLocation),this.updateImages()},e.prototype.updateImages=function(){return this.cleanUpImages(),this.getImagesForLocation(this.currentLocation)},e.prototype.cleanUpImages=function(){var e,t,n,r,i,s;this.log("Cleaning up images"),i=this.geoObjects,s=[];for(n in i)r=i[n],e=this.currentLocation.distanceTo(r.locations[0]),this.log("Object "+n+" is "+e+"m away"),e>this.RADIUS/2?(this.log("Destroying object "+n),s.push(this.destroyGeoObject(n))):(this.log("Resetting opacity and scale on object "+n),s.push(function(){var n,i,s,o;s=r.drawables.cam,o=[];for(n=0,i=s.length;n<i;n++)t=s[n],o.push(this.setOpacityAndScaleOnDrawable(t,e));return o}.call(this)));return s},e.prototype.setOpacityAndScaleOnDrawable=function(e,t){var n,r,i;return i=this.MIN_SCALING_DISTANCE/(t/this.DISTANCE_SCALE_FACTOR),r=Math.min(1,i),n=Math.min(1,i),e.scale=r,e.opacity=n},e.prototype.destroyGeoObject=function(e){var t,n,r,i,s,o,u,a,f;n=this.geoObjects[e],a=n.drawables.cam;for(i=0,o=a.length;i<o;i++)t=a[i],t.imageResource.destroy(),t.destroy();f=n.locations;for(s=0,u=f.length;s<u;s++)r=f[s],r.destroy();return n.destroy(),delete this.geoObjects[e]},e.prototype.createGeoObject=function(e){var t=this;if(!this.geoObjects[e])return this.serverRequest("details_for_site_id/",[e],function(n){var r,i,s,o,u;return u=new AR.GeoLocation(n.lat,n.long,t.currentLocation.altitude),r=t.currentLocation.distanceTo(u),s={offsetY:Math.random()*t.OFFSET_Y_RANDOM_FACTOR-t.OFFSET_Y_RANDOM_FACTOR/2,enabled:!0},t.geoObjects[e]=new AR.GeoObject(u,{enabled:!1}),o=t.createImageResource(n.images[0],t.geoObjects[e]),i=t.createImageDrawable(o,s),t.setOpacityAndScaleOnDrawable(i,r),t.geoObjects[e].drawables.addCamDrawable(i)})},e.prototype.createImageResource=function(e,t){var n,r=this;return n=new AR.ImageResource(e,{onError:function(){return r.log("Error loading image "+e)},onLoaded:function(){r.log("Loaded image "+e);if(n.getHeight()!==109||n.getWidth()!==109)return t.enabled=!0}}),n},e.prototype.createImageDrawable=function(e,t){return new AR.ImageDrawable(e,this.DEFAULT_HEIGHT_SDU,t)},e.prototype.serverRequest=function(e,t,n){var r;return t||(t=[]),r=this.canmoreRequestUrl+e+t.join("/")+"?callback=?",this.log("Request url is "+r),$.getJSON(r,function(e){return n(e)})},e.prototype.getImagesForLocation=function(e,t){var n=this;return this.log("Loading images ..."),this.serverRequest("site_ids_for_location/",[e.latitude,e.longitude,this.RADIUS],function(e){var t,r,i,s;n.log("Found "+e.length+" images"),s=[];for(r=0,i=e.length;r<i;r++)t=e[r],s.push(n.createGeoObject(t));return s})},e}(),t.Canmore={Architect:e},Canmore.archie=new Canmore.Architect,$(function(){return AR.context.onLocationChanged=function(e,t,n,r){return Canmore.archie.locationChanged(e,t,n,r)}})}).call(this)