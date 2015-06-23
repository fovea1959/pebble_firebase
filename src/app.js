var UI = require('ui');
var ajax = require('ajax');
var Vector2 = require('vector2');
var Accel = require('ui/accel');
var Vibe = require('ui/vibe');

var parseFeed = function(data) {
  var items = [];
  for(var key in data) {
    items.push({
      title: data[key].title + ' ' + data[key].prio,
      subtitle: data[key].summary,
      datakey: key,
      prio: data[key].prio
    });
  }
  
  items.sort(function(a,b) { return a.prio - b.prio; });
  
  for (var i = 0; i < items.length; i++) {
    console.log (i + " " + items[i].title);
  }

  // Finally return whole array
  return items;
};

// Show splash screen while waiting for data
var splashWindow = new UI.Window();

// Text element to inform user
var text = new UI.Text({
  position: new Vector2(0, 0),
  size: new Vector2(144, 168),
  text:'Downloading firebase data...',
  font:'GOTHIC_28_BOLD',
  color:'black',
  textOverflow:'wrap',
  textAlign:'center',
	backgroundColor:'white'
});

// Add to splashWindow and show
splashWindow.add(text);
splashWindow.show();

// Make request to openweathermap.org
ajax(
  {
    url:'https://amber-heat-3201.firebaseio.com/Pebble.json',
    type:'json'
  },
  function(data) {
    console.log ('received ' + JSON.stringify(data, null, 2));
    // Create an array of Menu items
    var menuItems = parseFeed(data);

    // Construct Menu to show to user
    var resultsMenu = new UI.Menu({
      sections: [{
        title: 'Current Items',
        items: menuItems
      }]
    });

    // Add an action for SELECT
    resultsMenu.on('select', function(e) {
      console.log ('selected ' + JSON.stringify(e.item, null, 2));
      // Get that forecast
      var fbitem = data[e.item.datakey];

      // Create the Card for detailed view
      var detailCard = new UI.Card({
        title:'Details',
        subtitle: e.item.title,
        body: fbitem.detail,
        action: {
          up: 'images/icon_start.png',
          down: 'images/icon_abort.png'
        }
      });
      detailCard.on('click', 'up', function() {
        console.log('Up clicked!');
      });
      detailCard.on('click', 'down', function() {
        console.log('Down clicked!');
      });
      detailCard.show();
    });

    // Show the Menu, hide the splash
    resultsMenu.show();
    splashWindow.hide();
    
    // Register for 'tap' events
    resultsMenu.on('accelTap', function(e) {
      // Make another request to openweathermap.org
      ajax(
        {
          url:'https://amber-heat-3201.firebaseio.com/Pebble.json',
          type:'json'
        },
        function(data) {
          console.log ('tapped: received ' + JSON.stringify(data, null, 2));
          // Create an array of Menu items
          var newItems = parseFeed(data);
          
          // Update the Menu's first section
          resultsMenu.items(0, newItems);
          
          // Notify the user
          Vibe.vibrate('short');
        },
        function(error) {
          console.log('Download failed: ' + error);
        }
      );
    });
  },
  function(error) {
    console.log("Download failed: " + error);
  }
);

// Prepare the accelerometer
Accel.init();