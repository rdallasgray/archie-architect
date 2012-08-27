mockRels = [123456, 789101, 121314]

mockDetails =
  lat: 55.8791,
  long: -4.2787,
  thumb_link: "test.jpg"

window.$ = ->
  html:(msg) -> console.log msg

window.$.getJSON = (url, func) ->
  if /details_for_site_id/.test url then data = mockDetails
  else data = mockRels
  func(data)

window.AR =
  GeoLocation: (lat, long, alt) ->
    latitude: lat
    longitude: long
    altitude: alt
    distanceTo: (loc) -> 1000
    destroy: -> @destroyed = true
  GeoObject: (loc, options) ->
    locations: [loc]
    destroy: -> @destroyed = true
    drawables:
      cam: []
      addCamDrawable: (d) ->
        @cam.push d
  ImageResource: (uri, callbacks) ->
    uri: uri
    callbacks: callbacks
    getHeight: -> 10
    getWidth: -> 10
    destroy: -> @destroyed = true
  ImageDrawable: (imgRes, height, options) ->
    imageResource: imgRes
    height: height
    options: options
    destroy: -> @destroyed = true
    triggers: { onClick: "" }
  Label: (text, offset, options) ->
    {}
    

a = null
        
describe "Canmore.Architect", ->
  beforeEach ->
    a = new Canmore.Architect
    a.sendRequest = (msg) -> null

  it "sets up current and last location", ->
    expect(a.currentLocation.latitude).toEqual 0
    expect(a.lastLocation.longitude).toEqual 0
    
  it "sets up a GeoLocation", ->
    l = new AR.GeoLocation(10, 20, 30, 5)
    a.setLocation(l, 90, 80, 70, 3)
    expect(l.latitude).toBe(90)
    
  it "sets the last location", ->
    l = new AR.GeoLocation(10, 20, 30, 5)
    a.setLastLocation l
    expect(a.lastLocation.latitude).toBe(l.latitude)

  it "creates imageResources", ->
    geoObject = new AR.GeoObject(new AR.GeoLocation(1, 2, 3, 4), { test: "test" })
    a.setMode("placemark")
    res = a.createImageResource(mockDetails.thumb_link, geoObject, "placemarkGeoObjects")
    expect(res.uri).toBe(mockDetails.thumb_link)
    res.callbacks.onLoaded()
    expect(geoObject.enabled).toBe(true)

  it "creates ImageDrawables", ->
    geoObject = new AR.GeoObject(new AR.GeoLocation(1, 2, 3, 4), { test: "test" })    
    res = a.createImageResource(mockDetails.thumb_link, geoObject)
    d = a.createImageDrawable(res, { test: "test"})
    expect(d.height).toBe(2.5)
  
  it "creates GeoObjects", ->
    spyOn(a, 'createImageDrawable').andCallThrough()
    spyOn(a, 'createImageResource').andCallThrough()
    a.createGeoObject("test", { lat: 55.8791, long: -4.2787, alt: 0 }, "test.jpg", mockRels[0], "placemarkGeoObjects")
    expect(a.createImageResource).toHaveBeenCalled()
    expect(a.createImageDrawable).toHaveBeenCalled()
    expect(a.placemarkGeoObjects[mockRels[0]].drawables.cam[0].imageResource.uri).toBe(mockDetails.thumb_link)

  it "destroys GeoObjects", ->
    a.createGeoObject("test", { lat: 55.8791, long: -4.2787, alt: 0 }, "test.jpg", mockRels[0], "placemarkGeoObjects")
    o = a.placemarkGeoObjects[mockRels[0]]
    spyOn(o, 'destroy')
    a.destroyGeoObject "placemark", mockRels[0]
    expect(o.destroy).toHaveBeenCalled()
    expect(a.placemarkGeoObjects[mockRels[0]]).toBe undefined

  it "sets scale and opacity on drawables", ->
    geoObject = new AR.GeoObject(new AR.GeoLocation(1, 2, 3, 4), {})    
    res = a.createImageResource(mockDetails.thumb_link, geoObject, "placemarkGeoObjects")
    d = a.createImageDrawable(res, {})
    a.setOpacityAndScaleOnDrawable(d, 1000)
    expect(d.scale).toEqual(a.scalingFactor 1000)
    expect(d.opacity).toEqual(a.scalingFactor 1000)    

  it "cleans up images", ->
    spyOn(a, 'destroyGeoObject').andCallThrough()
    a.createGeoObject("test", { lat: 55.8791, long: -4.2787, alt: 0 }, "test.jpg", mockRels[0], "photoGeoObjects")
    a.locationChanged(1, 2, 3, 3)
    a.cleanUpPhotos()
    expect(a.destroyGeoObject).toHaveBeenCalled()
    expect(a.placemarkGeoObjects).toEqual({})

  it "sets the last location on a location change", ->
    a.setMode("placemark")
    a.locationChanged(53, -2, 0, 3)
    a.locationChanged(55, -4, 0, 3)
    expect(a.lastLocation.latitude).toEqual(55)

  it "updates images on a valid location change", ->
    spyOn(a, 'updatePhotos').andCallThrough()
    a.setMode("photo")
    a.locationChanged(54, -3, 0, 3)
    expect(a.updatePhotos).toHaveBeenCalled()