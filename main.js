require([
  "esri/Map",
  "esri/views/MapView",
  "esri/layers/FeatureLayer",
  "esri/symbols/SimpleFillSymbol",
  "esri/layers/GraphicsLayer",
  "esri/Graphic",
  "esri/tasks/support/Query",
  "esri/widgets/ScaleBar",
  "esri/widgets/Home",
  "esri/widgets/BasemapToggle",
  "dojo/parser",
  "dijit/layout/BorderContainer",
  "dijit/layout/ContentPane",
  "dojo/domReady!"
], function(
  Map,
  MapView,
  FeatureLayer,
  SimpleFillSymbol,
  GraphicsLayer,
  Graphic,
  Query,
  ScaleBar,
  Home,
  BasemapToggle,
  parser
) {
  
  parser.parse(); 
  
  // Popup Template for POI layer.
  const popupTemplate = {
    // autocasts as new PopupTemplate()
    title: "Point of Interest: {Name}",
    content: [
      {
        type: "fields",
        fieldInfos: [
          {
            fieldName: "BuildingNu",
            label: "Building Number:"
          },
          {
            fieldName: "Phone",
            label: "Telephone Number:"
          },
          {
            fieldName: "URL",
            label: "Website:"
          },
          {
            fieldName: "NumberFloo",
            label: "Number of Floors:"
          },
          {
            fieldName: "SquareFoot",
            label: "Square Footage (Footprint):",
            format: {
              digitSeparator: true,
              places: 0
            }
          },
          {
            fieldName: "NumberPers",
            label: "Number of Personnel Assigned:"
          },
          {
            fieldName: "BuildingCu",
            label: "Building Custodian:"
          }
        ]
      }
    ]
  };

  // Point of Interest feature layer of base.
  var POI = new FeatureLayer({
    url:
      "https://services6.arcgis.com/p5xhIxHfrKahjaaS/arcgis/rest/services/POI/FeatureServer",
    popupTemplate: popupTemplate,
    outFields: ["*"]
  });

  // Boundary feature layer of base.
  var boundary = new FeatureLayer({
    url:
      "https://services6.arcgis.com/p5xhIxHfrKahjaaS/arcgis/rest/services/Boundary/FeatureServer",
    outFields: ["*"]
  });

  // Instantiate new map with streets.
  var map = new Map({ basemap: "streets" });

  // View constructed with map instance.
  var view = new MapView({
    container: "viewDiv", //DOM node that contains the view.
    map: map,
    zoom: 15,
    center: [127.772, 26.299],
    popup: {
      dockEnabled: true,
      dockOptions: {
        // Disables the dock button from the popup
        buttonEnabled: false,
        // Ignore the default sizes that trigger responsive docking
        breakpoint: false
      }
    }
  });

  // Empty graphics layer instantiated.
  var graphicsLayer = new GraphicsLayer();

  // Add layers to map.
  map.addMany([POI, boundary, graphicsLayer]);

  // Function to wrap query functions in.
  function showBuilding(event) {
    graphicsLayer.removeAll();
    var building = event.target.value;

    // var that stores the building query and selected dropdown value
    var whereClause = "Name = '" + building + "'";

    // Create an object of the Query class.
    var buildingQuery = new Query({
      outFields: ["*"],
      returnGeometry: true,
      where: whereClause
    });

    // Callback function to return selected building.
    POI.when(function() {
      return POI.queryFeatures(buildingQuery);
    }).then(displayResults);

    // Callback function to assign graphics properties to selection/result.
    function displayResults(results) {
      var poiBuildings = results.features.map(function(graphic) {
        graphic.symbol = new SimpleFillSymbol({
          popupTemplate: popupTemplate,
          outline: {
            width: 3,
            color: [254, 178, 76]
          }
        });
        return graphic;
      });

      //Add selected feature as graphic and log.
      graphicsLayer.addMany(poiBuildings);
      //console.log(building);

      // Zoom to selected feature.
      view.goTo({
        target: poiBuildings,
        zoom: 18
      });

      // Add popup to open when selection is zoomed to.
      view.popup.open({
        location: poiBuildings.geometry,
        features: poiBuildings
      });
    }
  }

  // Add event listener for changes to dropdown.
  document.getElementById("Selection").addEventListener("change", showBuilding);

  // Create home button.
  var homeBtn = new Home({
    view: view
  });

  // Add home button to the top left corner of view.
  view.ui.add(homeBtn, "top-left");

  // Add satellite basemap toggle option to bottom right corner of view.
  var toggle = new BasemapToggle({
    view: view,
    nextBasemap: "satellite"
  });

  view.ui.add(toggle, "bottom-right");

  // Scale bar displays both metric and non-metric units in bottom right corner of view.
  var scaleBar = new ScaleBar({
    view: view,
    unit: "dual"
  });

  view.ui.add(scaleBar, {
    position: "bottom-right"
  });
});