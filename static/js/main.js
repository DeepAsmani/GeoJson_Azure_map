var map;
var popup;
document.addEventListener("DOMContentLoaded", function () {
  map = new atlas.Map("map", {
    center: [cityLongitude, cityLatitude],
    zoom: 12,
    view: "Auto",
    authOptions: {
      authType: "subscriptionKey",
      subscriptionKey: "{{ azure_subscription_key }}", // Replace with your actual key
    },
  });

  map.events.add("ready", function () {
    popup = new atlas.Popup({
      position: [0, 0],
    });

    map.controls.add(
      new atlas.control.StyleControl({
        mapStyles: "all",
      }),
      {
        position: "top-right",
      }
    );

    var wardDataSource = new atlas.source.DataSource();
    map.sources.add(wardDataSource);
    var ward = new atlas.layer.PolygonLayer(wardDataSource, null, {
      fillColor: "gray",
      fillOpacity: 0.7,
    });
    map.events.add("click", ward, featureClicked);
    map.layers.add(ward);
    wardDataSource.importDataFromUrl(wardGeojson);

    map.imageSprite.add("library", "static/img/Library.png").then(function () {
      var librariesDataSource = new atlas.source.DataSource();
      map.sources.add(librariesDataSource);
      var library = new atlas.layer.SymbolLayer(librariesDataSource, null, {
        iconOptions: {
          image: "library",
          size: 0.12,
          allowOverlap: true,
          ignorePlacement: true,
        },
        filter: [
          "any",
          ["==", ["geometry-type"], "Point"],
          ["==", ["geometry-type"], "MultiPoint"],
        ],
      });
      map.events.add("click", library, featureClicked);
      map.layers.add(library);
      librariesDataSource.importDataFromUrl(librariesGeojson);
    });

    map.imageSprite.add("gym", "static/img/gym.png").then(function () {
      var gymsDataSource = new atlas.source.DataSource();
      map.sources.add(gymsDataSource);
      var gym = new atlas.layer.SymbolLayer(gymsDataSource, null, {
        iconOptions: {
          image: "gym",
          allowOverlap: true,
          ignorePlacement: true,
          size: 0.1,
        },
        filter: [
          "any",
          ["==", ["geometry-type"], "Point"],
          ["==", ["geometry-type"], "MultiPoint"],
        ],
      });
      map.events.add("click", gym, featureClicked);
      map.layers.add(gym);
      gymsDataSource.importDataFromUrl(gymsGeojson);
    });

    var swimmingPoolsDataSource = new atlas.source.DataSource();
    map.sources.add(swimmingPoolsDataSource);
    var swimmingPools = new atlas.layer.SymbolLayer(
      swimmingPoolsDataSource,
      null,
      {
        iconOptions: {
          image: "marker-darkblue",
          allowOverlap: true,
          ignorePlacement: true,
        },
        filter: [
          "any",
          ["==", ["geometry-type"], "Point"],
          ["==", ["geometry-type"], "MultiPoint"],
        ],
      }
    );
    map.events.add("click", swimmingPools, featureClicked);
    map.layers.add(swimmingPools);
    swimmingPoolsDataSource.importDataFromUrl(swimmingPoolsGeojson);

    map.imageSprite.add("zonal", "static/img/offices.png").then(function () {
      var zonalOfficeDataSource = new atlas.source.DataSource();
      map.sources.add(zonalOfficeDataSource);
      var zoneoffice = new atlas.layer.SymbolLayer(
        zonalOfficeDataSource,
        null,
        {
          iconOptions: {
            image: "zonal",
            allowOverlap: true,
            ignorePlacement: true,
            size: 0.1,
          },
          filter: [
            "any",
            ["==", ["geometry-type"], "Point"],
            ["==", ["geometry-type"], "MultiPoint"],
          ],
        }
      );
      map.events.add("click", zoneoffice, featureClicked);
      map.layers.add(zoneoffice);
      zonalOfficeDataSource.importDataFromUrl(zonalOfficeGeojson);
    });

    // map.imageSprite.add("wardoffice", "static/img/office.png").then(function () {
    //   var wardOfficeDataSource = new atlas.source.DataSource();
    //   map.sources.add(wardOfficeDataSource);
    //   var wardOffice = new atlas.layer.SymbolLayer(wardOfficeDataSource, null, {
    //     iconOptions: {
    //       image: "wardoffice",
    //       allowOverlap: true,
    //       ignorePlacement: true,
    //       size:0.1
    //     },
    //     filter: [
    //       "any",
    //       ["==", ["geometry-type"], "Point"],
    //       ["==", ["geometry-type"], "MultiPoint"],
    //     ],
    //   });
    //   map.events.add("click", wardOffice, featureClicked);
    //   map.layers.add(wardOffice);
    //   wardOfficeDataSource.importDataFromUrl(wardOfficeGeojson);
    // });

    legend = new atlas.control.LegendControl({
      title: "Ahemdabad City's Municipal Corporation Facilty",
      showToggle: true,
      legends: [
        {
          type: "category",
          subtitle: "Facilty",
          layout: "column",
          itemLayout: "row",
          footer: "",
          strokeWidth: 3,
          items: [
            {
              color: "Gray",
              label: "Wards",
              shape: "circle",
            },
            {
              color: "Red",
              size: 0.1,
              label: "Libraries",
              shape: "static/img/Library.png",
            },
            {
              shape: "/static/img/gym.png",
              size: 0.1,
              color: "Black",
              label: "Gyms",
            },
            {
              color: "Darkblue",
              label: "Swimming Pools",
              shape: "circle",
            },
            {
              color: "Blue",
              label: "Zone Offices",
              shape: "static/img/offices.png",
            },
            // {
            //   color: "Yellow",
            //   label: "Ward Offices",
            //   shape: "static/img/office.png",
            // },
          ],
        },
      ],
    });
    map.controls.add(legend, {
      position: "bottom-left",
    });
  });
});

function zoomMap(offset) {
  var cam = map.getCamera();

  map.setCamera({
    //Zoom the map within the range of min/max zoom of the map.
    zoom: Math.max(cam.minZoom, Math.min(cam.maxZoom, cam.zoom + offset)),
    type: "ease",
    duration: 250,
  });
}

// Number of degrees to change pitch the map per click.
const pitchStep = 10;

function pitchMap(offset) {
  map.setCamera({
    // Pitch the map within the range of 0 - 60 degrees.
    pitch: Math.max(
      0,
      Math.min(60, map.getCamera().pitch + offset * pitchStep)
    ),
    type: "ease",
    duration: 250,
  });
}

// Number of degrees to change rotate the map per click.
const bearingStep = 15;

function rotateMap(offset) {
  map.setCamera({
    bearing: map.getCamera().bearing + offset * bearingStep,
    type: "ease",
    duration: 250,
  });
}

function featureClicked(e) {
  //Make sure the event occurred on a shape feature.
  if (e.shapes && e.shapes.length > 0) {
    //By default, show the popup where the mouse event occurred.
    var pos = e.position;
    var offset = [0, 0];
    var properties;

    if (e.shapes[0] instanceof atlas.Shape) {
      properties = e.shapes[0].getProperties();

      //If the shape is a point feature, show the popup at the points coordinate.
      if (e.shapes[0].getType() === "Point") {
        pos = e.shapes[0].getCoordinates();
        offset = [0, -18];
      }
    } else {
      properties = e.shapes[0].properties;

      //If the shape is a point feature, show the popup at the points coordinate.
      if (e.shapes[0].type === "Point") {
        pos = e.shapes[0].geometry.coordinates;
        offset = [0, -18];
      }
    }
    console.log(e.shapes[0]);
    //Update the content and position of the popup.
    popup.setOptions({
      //Create a table from the properties in the feature.
      content: atlas.PopupTemplate.applyTemplate(properties),
      position: pos,
      pixelOffset: offset,
    });

    //Open the popup.
    popup.open(map);
  }
}
