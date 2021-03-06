// Generated by CoffeeScript 1.3.3
(function() {
  var changeLocation, lat, long, timesToChange;

  Canmore.archie = new Canmore.Architect;

  $(function() {
    AR.context.onLocationChanged = function(lat, long, alt, acc) {
      return Canmore.archie.locationChanged(lat, long, alt, acc);
    };
    return Canmore.archie.setMode('photo');
  });

  lat = 55.8891;

  long = -4.2887;

  timesToChange = 2;

  changeLocation = function() {
    if (!(timesToChange < 1)) {
      timesToChange--;
      lat = lat - 0.001;
      long = long - 0.001;
      return Canmore.archie.locationChanged(lat, long, 0, 3);
    }
  };

  changeLocation();

  setInterval(changeLocation, 5000);

}).call(this);
