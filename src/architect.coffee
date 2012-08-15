root = (exports ? this)

class Architect
  DEFAULT_HEIGHT_SDU: 2.5
  RADIUS: 300
  MIN_SCALING_DISTANCE: 30
  DISTANCE_SCALE_LOG: 1.7
  MIN_SCALING_FACTOR: 0.1
  OFFSET_Y_RANDOM_FACTOR: 2
  REQUEST_INTERVAL: 50
  LOG_LEVEL: 2

  constructor: (canmoreRequestUrl) ->
    @lastLocation = new AR.GeoLocation(0, 0, 0)
    @currentLocation = new AR.GeoLocation(0, 0, 0)
    @photoGeoObjects = {}
    @placemarkGeoObjects = {}
    @imgResources = {}
    @locationChangedFunc = null
    @mode = null
    @requestBuffer = []
    @timeSinceLastRequest = @REQUEST_INTERVAL
    setInterval (=> @clearRequestBuffer()), @REQUEST_INTERVAL
    @request "loadedARView"
    
  log:(msg, level = 1) ->
    if level >= @LOG_LEVEL
      console.log msg

  request:(msg) ->
    @requestBuffer.push msg

  clearRequestBuffer: ->
    report = @requestBuffer.shift()
    if report == undefined
      return
    @sendRequest(report)

  sendRequest:(msg) ->
    document.location = "architectsdk://#{msg}"
        
  setLocation: (loc, lat, long, alt) ->
    [loc.latitude, loc.longitude, loc.altitude] = [lat, long, alt]

  setLastLocation: (loc) ->
    @setLocation(@lastLocation, loc.latitude, loc.longitude, loc.altitude)

  locationChanged: (lat, long, alt, acc) ->
    @log "changing location to " + [lat, long].join ", "
    @setLocation(@currentLocation, lat, long, alt)
    if @locationChangedFunc != null
      @locationChangedFunc()

  setMode:(mode) ->
    @log "setting mode #{mode}"
    return if mode == @mode
    if mode == "photo"
      @setupPhotoMode()
    else if mode == "placemark"
      @setupPlacemarkMode()

  setupPhotoMode: ->
    @log "setting up photo mode"
    @locationChangedFunc = null
    @mode = "photo"
    @disablePlacemarks()
    @enablePhotos()
    if @locationChangeSufficient() || @empty @photoGeoObjects
      @cleanUpPhotos()
      @updatePhotos()

  locationChangeSufficient: ->
    distance = @currentLocation.distanceTo(@lastLocation)
    @log "distance from last location is #{distance}"
    distance > @RADIUS / 5

  maybeUpdatePhotos: ->
    @log "conditionally updating photos"
    if @locationChangeSufficient()
      @setLastLocation @currentLocation
      @cleanUpPhotos()
      @updatePhotos()

  disablePhotos: ->
    @log "disabling photos"
    for id, photo of @photoGeoObjects
      photo.enabled = false

  enablePhotos: ->
    @log "enabling photos"
    for id, photo of @photoGeoObjects
      photo.enabled = true

  updatePhotos: ->
    @log "updating photos"
    @requestPhotoData()

  cleanUpPhotos: ->
    @log "cleaning up photos"
    for id, item of @photoGeoObjects
      distance = @currentLocation.distanceTo(item.locations[0])
      @log "Object #{id} is #{distance}m away"
      if distance > @RADIUS
        @log "Destroying object #{id}"
        @destroyGeoObject("photo", id)
      else
        @log "Resetting opacity and scale on object #{id}"
        for drawable in item.drawables.cam
          @setOpacityAndScaleOnDrawable(drawable, distance)

  requestPhotoData: ->
    @log "requesting photo data"
    @request "requestPhotoData.aos"
    
  setPhotoData: (data) ->
    @log "setting photo data"
    @cleanUpPhotos()
    for id, details of data
      @createGeoObject details.site_name, details.location, details.imgUri, id, "photoGeoObjects"
    @log "created photos"

  setupPlacemarkMode: ->
    @log "setting up placemark mode"
    @locationChangedFunc = null
    @mode = "placemark"
    if @empty(@placemarkGeoObjects)
      @requestPlacemarkData()
    @disablePhotos()
    @enablePlacemarks()
    if @locationChangeSufficient()
      @updatePlacemarks
    @locationChangedFunc = @maybeUpdatePlacemarks

  requestPlacemarkData: ->
    @log "requesting placemark data"
    @request "requestPlacemarkData.aos"
    
  setPlacemarkData: (data) ->
    @log "setting placemark data"
    @destroyPlacemarks()
    for id, details of data
      @createGeoObject details.site_name, details.location, details.imgUri, id, "placemarkGeoObjects"
    @log "created placemarks"

  destroyPlacemarks: ->
    for id, placemark of @placemarkGeoObjects
      @destroyGeoObject "placemark", id

  enablePlacemarks: ->
    for id, placemark of @placemarkGeoObjects
      placemark.enabled = true

  disablePlacemarks: ->
    @log "disabling placemarks"
    for id, placemark of @placemarkGeoObjects
      @log "disabling placemark #{id}"
      placemark.enabled = false

  maybeUpdatePlacemarks: ->
    @log "conditionally updating placemarks"
    if @locationChangeSufficient
      @setLastLocation @currentLocation
      @updatePlacemarks()

  updatePlacemarks: ->
    @log "updating placemarks"
    for id, placemark of @placemarkGeoObjects
      distance = @currentLocation.distanceTo(placemark.locations[0])
      @log "object #{id} is #{distance}m away"
      @log "resetting opacity and scale on object #{id}"
      for drawable in placemark.drawables.cam
        @setOpacityAndScaleOnDrawable(drawable, distance)

  scalingFactor: (distance) ->
    return 1 unless distance > @MIN_SCALING_DISTANCE
    logVal = Math.log(distance / @MIN_SCALING_DISTANCE) / Math.log(@DISTANCE_SCALE_LOG)
    Math.max(1 - (logVal / 10), @MIN_SCALING_FACTOR)

  setOpacityAndScaleOnDrawable: (drawable, distance) ->
    scalingFactor = @scalingFactor distance
    drawable.scale = scalingFactor
    drawable.opacity = scalingFactor
    drawable.offsetY = drawable.origOffsetY * scalingFactor

  destroyGeoObject: (type = "photo", id) ->
    @log "destroying #{type} geoObjects"
    collection = @["#{type}GeoObjects"]
    geo = collection[id]
    @log "disabling geoobject"
    geo.enabled = false
    @log "removing cam drawables"
    geo.drawables.cam = []
    @log "destroying geoobject"
    geo.destroy()
    @log "deleting object from collection"
    delete collection[id]

  createGeoObject: (siteName, location, imgUri, id, collectionName) ->
    @log "creating geoObject #{id}, #{siteName} in collection #{collectionName}"
    collection = @[collectionName]
    if collection[id] != undefined
      @log "object already exists"
      return
    location = new AR.GeoLocation location.lat, location.long, location.alt
    distance = @currentLocation.distanceTo location
    drawableOptions = 
      offsetY: (Math.random() * @OFFSET_Y_RANDOM_FACTOR) - @OFFSET_Y_RANDOM_FACTOR / 2
      enabled: true
    geoObject = new AR.GeoObject location, enabled: false
    imgRes = @createImageResource(imgUri, geoObject)
    imgDrawable = @createImageDrawable imgRes, drawableOptions
    imgDrawable.origOffsetY = imgDrawable.offsetY
    imgDrawable.triggers.onClick = => @objectWasClicked id, collectionName
    @setOpacityAndScaleOnDrawable imgDrawable, distance
    geoObject.drawables.addCamDrawable(imgDrawable)
    label = @createLabel siteName, drawableOptions
    @setOpacityAndScaleOnDrawable label, distance
    geoObject.drawables.addCamDrawable(label)
    collection[id] = geoObject

  objectWasClicked: (id, collection) ->
    @log "clicked #{id}, #{collection}"
    @request "clickedObject.aos?id=#{id}&collection=#{collection}"
      
  createImageResource: (uri, geoObject) ->
    @log "creating imageResource for #{uri}"
    imgRes = new AR.ImageResource uri,
      onError: =>
        @log "error loading image #{uri}"
      onLoaded: =>
        unless imgRes.getHeight() is 109 and imgRes.getWidth() is 109
          @log "loaded image #{uri}"
          geoObject.enabled = true
    return imgRes

  createImageDrawable: (imgRes, options) ->
    new AR.ImageDrawable imgRes, @DEFAULT_HEIGHT_SDU, options

  createLabel: (text, options, distance) ->
    options.offsetY = options.offsetY - 1.75
    options.style = { backgroundColor: "#ffffff" }
    label = new AR.Label text, 0.6, options
    label.origOffsetY = options.offsetY
    label

  empty: (object) ->
    for key, val of object
      return false
    true

  lengthOf: (object) ->
    count = 0
    for key, val of object
      count++
    count

root.Canmore =
  Architect: Architect