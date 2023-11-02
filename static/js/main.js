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
      fillOpacity: 0.3,
    });
    map.events.add("click", ward, featureClicked);
    map.layers.add(ward);
    wardDataSource.importDataFromUrl(wardGeojson);


    function createSymbolLayer(dataSource, iconName, geojsonUrl, iconSize) {
      map.imageSprite
        .add(iconName, "static/img/" + iconName + ".png")
        .then(function () {
          var symbolLayer = new atlas.layer.SymbolLayer(dataSource, null, {
            iconOptions: {
              image: iconName,
              size: iconSize,
              allowOverlap: true,
              ignorePlacement: true,
            },
            filter: [
              "any",
              ["==", ["geometry-type"], "Point"],
              ["==", ["geometry-type"], "MultiPoint"],
            ],
          });
          map.events.add("click", symbolLayer, featureClicked);
          map.layers.add(symbolLayer);
          dataSource.importDataFromUrl(geojsonUrl);
        });
    }

    // Function to create Symbol Layer and DataSource
    function createSymbolLayerAndDataSource(iconName, geojsonUrl, iconSize) {
      var dataSource = new atlas.source.DataSource();
      map.sources.add(dataSource);
      createSymbolLayer(dataSource, iconName, geojsonUrl, iconSize);
    }

    createSymbolLayerAndDataSource("library", librariesGeojson, 0.12);
    createSymbolLayerAndDataSource("gym", gymsGeojson, 0.1);
    createSymbolLayerAndDataSource(
      "swimmingPools",
      swimmingPoolsGeojson,
      0.1
    );
    createSymbolLayerAndDataSource("offices", zonalOfficeGeojson, 0.1);

    legend = new atlas.control.LegendControl({
      title: "Ahemdabad City's Municipal Corporation Facility",
      showToggle: true,
      legends: [
        {
          type: "category",
          subtitle: "Facility",
          layout: "column",
          itemLayout: "row",
          footer: "",
          strokeWidth: 1,
          items: [
            {
              color: "Gray",
              label: "Wards",
              shape: "circle",
            },
            {
              color: "Red",
              size: 1,
              label: "Libraries",
              shape: "static/img/Library.png",
            },
            {
              shape: "/static/img/gym.png",
              size: 1,
              color: "Black",
              label: "Gyms",
            },
            {
              color: "Darkblue",
              label: "Swimming Pools",
              shape: "/static/img/swimmingPools.png",
            },
            {
              color: "Blue",
              label: "Zone Offices",
              shape: "static/img/offices.png",
            },
          ],
        },
      ],
    });

    map.controls.add(legend, {
      position: "bottom-left",
    });
  });

 

  // Function to handle feature click event
  function featureClicked(e) {
    if (e.shapes && e.shapes.length > 0) {
      var pos = e.position;
      var offset = [0, 0];
      var properties;

      if (e.shapes[0] instanceof atlas.Shape) {
        properties = e.shapes[0].getProperties();
        if (e.shapes[0].getType() === "Point") {
          pos = e.shapes[0].getCoordinates();
          offset = [0, -18];
        }
      } else {
        properties = e.shapes[0].properties;
        if (e.shapes[0].type === "Point") {
          pos = e.shapes[0].geometry.coordinates;
          offset = [0, -18];
        }
      }

      popup.setOptions({
        content: atlas.PopupTemplate.applyTemplate(properties),
        position: pos,
        pixelOffset: offset,
      });

      popup.open(map);
    }
  }
});


 // Function to handle map zoom
 function zoomMap(offset) {
  var cam = map.getCamera();

  map.setCamera({
    zoom: Math.max(cam.minZoom, Math.min(cam.maxZoom, cam.zoom + offset)),
    type: "ease",
    duration: 250,
  });
}

// Function to handle map pitch
const pitchStep = 10;

function pitchMap(offset) {
  map.setCamera({
    pitch: Math.max(
      0,
      Math.min(60, map.getCamera().pitch + offset * pitchStep)
    ),
    type: "ease",
    duration: 250,
  });
}

// Function to handle map rotation
const bearingStep = 15;

function rotateMap(offset) {
  map.setCamera({
    bearing: map.getCamera().bearing + offset * bearingStep,
    type: "ease",
    duration: 250,
  });
}
