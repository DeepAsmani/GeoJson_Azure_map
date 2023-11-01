var map;
document.addEventListener("DOMContentLoaded", function () {
  map = new atlas.Map("map", {
    center: [cityLongitude, cityLatitude],
    zoom: 11,
    view: "Auto",
    authOptions: {
      authType: "subscriptionKey",
      subscriptionKey: "{{ azure_subscription_key }}", // Replace with your actual key
    },
  });

  map.events.add("ready", function () {
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

    map.layers.add(
      new atlas.layer.PolygonLayer(wardDataSource, null, {
        fillColor: "gray",
        fillOpacity: 0.7,
      })
    );

    wardDataSource.importDataFromUrl(wardGeojson);

    map.imageSprite.add("library", "static/img/Library.png").then(function () {
      var librariesDataSource = new atlas.source.DataSource();
      map.sources.add(librariesDataSource);

      map.layers.add(
        new atlas.layer.SymbolLayer(librariesDataSource, null, {
          iconOptions: {
            image: "library",
            size: 0.2,
            allowOverlap: true,
            ignorePlacement: true,
          },
          filter: [
            "any",
            ["==", ["geometry-type"], "Point"],
            ["==", ["geometry-type"], "MultiPoint"],
          ],
        })
      );
      librariesDataSource.importDataFromUrl(librariesGeojson);
    });

    map.imageSprite.add("gym", "static/img/gym.png").then(function () {
      var gymsDataSource = new atlas.source.DataSource();
      map.sources.add(gymsDataSource);
      map.layers.add(
        new atlas.layer.SymbolLayer(gymsDataSource, null, {
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
        })
      );
      gymsDataSource.importDataFromUrl(gymsGeojson);
    });

    var swimmingPoolsDataSource = new atlas.source.DataSource();
    map.sources.add(swimmingPoolsDataSource);
    map.layers.add(
      new atlas.layer.SymbolLayer(swimmingPoolsDataSource, null, {
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
      })
    );
    swimmingPoolsDataSource.importDataFromUrl(swimmingPoolsGeojson);

    var zonalOfficeDataSource = new atlas.source.DataSource();
    map.sources.add(zonalOfficeDataSource);
    map.layers.add(
      new atlas.layer.SymbolLayer(zonalOfficeDataSource, null, {
        iconOptions: {
          image: "marker-blue",
          allowOverlap: true,
          ignorePlacement: true,
        },
        filter: [
          "any",
          ["==", ["geometry-type"], "Point"],
          ["==", ["geometry-type"], "MultiPoint"],
        ],
      })
    );
    zonalOfficeDataSource.importDataFromUrl(zonalOfficeGeojson);

    var wardOfficeDataSource = new atlas.source.DataSource();
    map.sources.add(wardOfficeDataSource);
    map.layers.add(
      new atlas.layer.SymbolLayer(wardOfficeDataSource, null, {
        iconOptions: {
          image: "marker-yellow",
          allowOverlap: true,
          ignorePlacement: true,
        },
        filter: [
          "any",
          ["==", ["geometry-type"], "Point"],
          ["==", ["geometry-type"], "MultiPoint"],
        ],
      })
    );

    wardOfficeDataSource.importDataFromUrl(wardOfficeGeojson);

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
              shape: "circle",
            },
            {
              color: "Yellow",
              label: "Ward Offices",
              shape: "circle",
            },
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
          if (e.shapes[0].getType() === 'Point') {
              pos = e.shapes[0].getCoordinates();
              offset = [0, -18];
          }
      } else {
          properties = e.shapes[0].properties;

          //If the shape is a point feature, show the popup at the points coordinate.
          if (e.shapes[0].type === 'Point') {
              pos = e.shapes[0].geometry.coordinates;
              offset = [0, -18];
          }
      }
      console.log(e.shapes[0])
      //Update the content and position of the popup.
      popup.setOptions({
          //Create a table from the properties in the feature.
          content: atlas.PopupTemplate.applyTemplate(properties),
          position: pos,
          pixelOffset: offset
      });

      //Open the popup.
      popup.open(map);
  }
}
