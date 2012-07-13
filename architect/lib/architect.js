// Generated by CoffeeScript 1.3.3
(function() {
  var Architect, root;

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  Architect = (function() {

    Architect.prototype.CANMORE_REQUEST_URL = '/';

    Architect.prototype.TEST_LOCATION = [55.8791, -4.2788, 59];

    Architect.prototype.LAT_METERS = 100000;

    Architect.prototype.LONG_METERS = 70000;

    Architect.prototype.RADIUS = 500;

    Architect.prototype.DEFAULT_HEIGHT_SDU = 4.5;

    Architect.prototype.DISTANCE_SCALE_FACTOR = 1.75;

    Architect.prototype.MIN_SCALING_DISTANCE = 50;

    Architect.prototype.OFFSET_Y_RANDOM_FACTOR = 3;

    function Architect(canmoreRequestUrl) {
      this.canmoreRequestUrl = canmoreRequestUrl || this.CANMORE_REQUEST_URL;
      this.lastLocation = new AR.GeoLocation(0, 0, 0);
      this.currentLocation = new AR.GeoLocation(0, 0, 0);
      this.photoGeoObjects = {};
      this.placemarkGeoObjects = {};
      this.locationChangedFunc = null;
      this.mode = null;
    }

    Architect.prototype.log = function(msg) {
      $.ajax("architectsdk://logmessage?" + encodeURIComponent(msg));
      return $("#status").html("<p>" + msg + "</p>");
    };

    Architect.prototype.setLocation = function(loc, lat, long, alt) {
      var _ref;
      return _ref = [lat, long, alt], loc.latitude = _ref[0], loc.longitude = _ref[1], loc.altitude = _ref[2], _ref;
    };

    Architect.prototype.setLastLocation = function(loc) {
      return this.setLocation(this.lastLocation, loc.latitude, loc.longitude, loc.altitude);
    };

    Architect.prototype.locationChanged = function(lat, long, alt, acc) {
      this.log("changing location to " + [lat, long].join(", "));
      this.setLocation(this.currentLocation, lat, long, alt);
      if (this.locationChangedFunc !== null) {
        return this.locationChangedFunc();
      }
    };

    Architect.prototype.setMode = function(mode, data) {
      if (data == null) {
        data = null;
      }
      this.log("setting mode " + mode);
      if (mode === this.mode) {
        return;
      }
      if (mode === 'photo') {
        return this.setupPhotoMode();
      } else {
        return this.setupPlacemarkMode(data);
      }
    };

    Architect.prototype.setupPhotoMode = function() {
      this.locationChangedFunc = null;
      this.mode = 'photo';
      this.disablePlacemarks;
      this.cleanUpPhotos;
      this.enablePhotos;
      return this.locationChangedFunc = this.maybeUpdatePhotos;
    };

    Architect.prototype.maybeUpdatePhotos = function() {
      this.log("conditionally updating photos");
      if (this.currentLocation.distanceTo(this.lastLocation) > this.RADIUS / 5) {
        this.setLastLocation(this.currentLocation);
        this.cleanUpPhotos;
        return this.updatePhotos();
      }
    };

    Architect.prototype.enablePhotos = function() {
      var id, photo, _ref, _results;
      this.log("enabling photos");
      _ref = this.photoGeoObjects;
      _results = [];
      for (id in _ref) {
        photo = _ref[id];
        _results.push(photo.enabled = true);
      }
      return _results;
    };

    Architect.prototype.updatePhotos = function() {
      this.log("updating photos");
      return this.getPhotosForLocation(this.currentLocation);
    };

    Architect.prototype.cleanUpPhotos = function() {
      var distance, drawable, id, item, _ref, _results;
      this.log("cleaning up photos");
      _ref = this.photoGeoObjects;
      _results = [];
      for (id in _ref) {
        item = _ref[id];
        distance = this.currentLocation.distanceTo(item.locations[0]);
        this.log("Object " + id + " is " + distance + "m away");
        if (distance > this.RADIUS) {
          this.log("Destroying object " + id);
          _results.push(this.destroyGeoObject('photo', id));
        } else {
          this.log("Resetting opacity and scale on object " + id);
          _results.push((function() {
            var _i, _len, _ref1, _results1;
            _ref1 = item.drawables.cam;
            _results1 = [];
            for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
              drawable = _ref1[_i];
              _results1.push(this.setOpacityAndScaleOnDrawable(drawable, distance));
            }
            return _results1;
          }).call(this));
        }
      }
      return _results;
    };

    Architect.prototype.createPhotoGeoObject = function(siteId) {
      var _this = this;
      this.log("creating photoGeoObject for id " + siteId);
      if (!this.photoGeoObjects[siteId]) {
        return this.serverRequest("details_for_site_id/", [siteId], function(siteDetails) {
          var location;
          _this.log("creating geoObject with loc " + siteDetails.lat + ", " + siteDetails.long + ": " + siteDetails.thumbs[0]);
          location = {
            lat: siteDetails.lat,
            long: siteDetails.long,
            alt: _this.currentLocation.altitude
          };
          return _this.createGeoObject(location, siteDetails.thumbs[0], siteId, 'photoGeoObjects');
        });
      }
    };

    Architect.prototype.getPhotosForLocation = function(loc) {
      var _this = this;
      this.log("getting photos for location " + loc.latitude + ", " + loc.longitude);
      return this.serverRequest("site_ids_for_location/", [loc.latitude, loc.longitude, this.RADIUS], function(siteIds) {
        var id, _i, _len, _results;
        _this.log("Found " + siteIds.length + " images");
        _results = [];
        for (_i = 0, _len = siteIds.length; _i < _len; _i++) {
          id = siteIds[_i];
          _results.push(_this.createPhotoGeoObject(id));
        }
        return _results;
      });
    };

    Architect.prototype.setupPlacemarkMode = function() {
      this.locationChangedFunc = null;
      this.mode = 'placemark';
      if (this.empty(this.placemarkGeoObjects)) {
        this.requestPlacemarkData();
      }
      this.enablePlacemarks();
      return this.locationChangedFunc = this.maybeUpdatePlacemarks;
    };

    Architect.prototype.requestPlacemarkData = function() {
      this.log("requesting placemark data");
      return document.location = "architectsdk://requestplacemarkdata";
    };

    Architect.prototype.setPlacemarkData = function(data) {
      var count, details, id, _results;
      this.log("setting placemark data");
      count = 0;
      this.destroyPlacemarks;
      _results = [];
      for (id in data) {
        details = data[id];
        count++;
        this.log(count);
        _results.push(this.createGeoObject(details.location, details.imgUri, id, 'placemarkGeoObjects'));
      }
      return _results;
    };

    Architect.prototype.destroyPlacemarks = function() {
      var id, placemark, _ref, _results;
      _ref = this.placemarkGeoObjects;
      _results = [];
      for (id in _ref) {
        placemark = _ref[id];
        _results.push(destroyGeoObject('placemark', id));
      }
      return _results;
    };

    Architect.prototype.enablePlacemarks = function() {
      var id, placemark, _ref, _results;
      _ref = this.placemarkGeoObjects;
      _results = [];
      for (id in _ref) {
        placemark = _ref[id];
        _results.push(placemark.enabled = true);
      }
      return _results;
    };

    Architect.prototype.disablePlacemarks = function() {
      var id, placemark, _ref, _results;
      _ref = this.placemarkGeoObjects;
      _results = [];
      for (id in _ref) {
        placemark = _ref[id];
        _results.push(placemark.enabled = false);
      }
      return _results;
    };

    Architect.prototype.maybeUpdatePlacemarks = function() {
      this.log("conditionally updating placemarks");
      if (this.currentLocation.distanceTo(this.lastLocation) > this.RADIUS / 5) {
        this.setLastLocation(this.currentLocation);
        return this.updatePlacemarks;
      }
    };

    Architect.prototype.updatePlacemarks = function() {
      var distance, drawable, id, placemark, _ref, _results;
      this.log("updating placemarks");
      _ref = this.placemarkGeoObjects;
      _results = [];
      for (id in _ref) {
        placemark = _ref[id];
        distance = this.currentLocation.distanceTo(placemark.locations[0]);
        this.log("object " + id + " is " + distance + "m away");
        this.log("resetting opacity and scale on object " + id);
        _results.push((function() {
          var _i, _len, _ref1, _results1;
          _ref1 = placemark.drawables.cam;
          _results1 = [];
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            drawable = _ref1[_i];
            _results1.push(this.setOpacityAndScaleOnDrawable(drawable, distance));
          }
          return _results1;
        }).call(this));
      }
      return _results;
    };

    Architect.prototype.setOpacityAndScaleOnDrawable = function(drawable, distance) {
      var opacity, scale, scalingFactor;
      scalingFactor = this.MIN_SCALING_DISTANCE / (distance / this.DISTANCE_SCALE_FACTOR);
      scale = Math.min(1, scalingFactor);
      opacity = Math.min(1, scalingFactor);
      drawable.scale = scale;
      return drawable.opacity = opacity;
    };

    Architect.prototype.destroyGeoObject = function(type, id) {
      var collection, drawable, geo, location, _i, _j, _len, _len1, _ref, _ref1;
      if (type == null) {
        type = 'photo';
      }
      collection = this["" + type + "GeoObjects"];
      geo = collection[id];
      _ref = geo.drawables.cam;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        drawable = _ref[_i];
        drawable.imageResource.destroy();
        drawable.destroy();
      }
      _ref1 = geo.locations;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        location = _ref1[_j];
        location.destroy();
      }
      geo.destroy();
      return delete collection[id];
    };

    Architect.prototype.createGeoObject = function(location, imgUri, id, collectionName) {
      var collection, distance, drawable, drawableOptions, geoObject, imgRes,
        _this = this;
      this.log("creating geoObject " + id + " in collection " + collectionName);
      collection = this[collectionName];
      location = new AR.GeoLocation(location.lat, location.long, location.alt);
      distance = this.currentLocation.distanceTo(location);
      drawableOptions = {
        offsetY: (Math.random() * this.OFFSET_Y_RANDOM_FACTOR) - this.OFFSET_Y_RANDOM_FACTOR / 2,
        enabled: true
      };
      geoObject = new AR.GeoObject(location, {
        enabled: false
      });
      imgRes = this.createImageResource(imgUri, geoObject);
      drawable = this.createImageDrawable(imgRes, drawableOptions);
      drawable.triggers.onClick = function() {
        return _this.objectWasClicked(id, collectionName);
      };
      this.setOpacityAndScaleOnDrawable(drawable, distance);
      geoObject.drawables.addCamDrawable(drawable);
      return collection[id] = geoObject;
    };

    Architect.prototype.objectWasClicked = function(id, collection) {
      this.log("clicked " + id + ", " + collection);
      return document.location = "architectsdk://clickedobject?id=" + id + "&collection=" + collection;
    };

    Architect.prototype.createImageResource = function(uri, geoObject) {
      var imgRes,
        _this = this;
      this.log("creating imageResource for " + uri);
      imgRes = new AR.ImageResource(uri, {
        onError: function() {
          return _this.log("error loading image " + uri);
        },
        onLoaded: function() {
          if (!(imgRes.getHeight() === 109 && imgRes.getWidth() === 109)) {
            _this.log("loaded image " + uri);
            return geoObject.enabled = true;
          }
        }
      });
      return imgRes;
    };

    Architect.prototype.createImageDrawable = function(imgRes, options) {
      return new AR.ImageDrawable(imgRes, this.DEFAULT_HEIGHT_SDU, options);
    };

    Architect.prototype.serverRequest = function(url, params, callback) {
      var requestUrl;
      params || (params = []);
      requestUrl = this.canmoreRequestUrl + url + params.join('/') + '?callback=?';
      return $.getJSON(requestUrl, function(data) {
        return callback(data);
      });
    };

    Architect.prototype.empty = function(object) {
      var key, val;
      for (key in object) {
        val = object[key];
        return false;
      }
      return true;
    };

    return Architect;

  })();

  root.Canmore = {
    Architect: Architect
  };

}).call(this);
