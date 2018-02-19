// Initialize Firebase
var config = {
    apiKey: "AIzaSyDb2Ntv17Xk9ivvxXn85ePLRz0li47rx6g",
    authDomain: "penme-4a3f4.firebaseapp.com",
    databaseURL: "https://penme-4a3f4.firebaseio.com",
    projectId: "penme-4a3f4",
    storageBucket: "penme-4a3f4.appspot.com",
    messagingSenderId: "536158657842"
};
firebase.initializeApp(config);

var database = firebase.database();

//Populates the table with current events and dates for the user
function populateTable() {
    var table, row, eventCell, dateCell, eventNode, dateNode;
    table = document.getElementById("searchTable");
    var eventsRef = database.ref('events');
    eventsRef.once("value")
        .then(function(snapshot) {
              snapshot.forEach(function(childSnapshot) {
                    //Grab database data
                    var key = childSnapshot.key;
                    var childData = childSnapshot.val();
                    //Create new row and column elements
                    row = document.createElement("tr");
                    eventCell = document.createElement("td");
                    dateCell = document.createElement("td");
                    //Add text data onto column elements
                    eventNode = document.createTextNode(childData.eventID);
                    dateNode = document.createTextNode(childData.eventDescription);
                    //Append everything on to the row
                    eventCell.appendChild(eventNode);
                    dateCell.appendChild(dateNode);
                    row.appendChild(eventCell);
                    row.appendChild(dateCell);
                    
                    //Add Modal Event Listener to display relevant event info for each row
                    row.addEventListener("click", function() {
                        displayEvent(childData);
                    });
                  
                    table.appendChild(row);
              });
        });
}

//Populate Modal Data based on the event
function displayEvent(data) {
    $('#eventModal').css("display","block");
    var eventText = $('#eventInfo').text(
    "Event ID: " + data.eventID + "\n" +
    "Title: " + data.eventTitle + "\n" +
    "Owner: " + data.eventOwner + "\n" +
    "Description: " + data.eventDescription + "\n" +
    "Privacy: " + data.privacySetting + "\n"); 
    eventText.html(eventText.html().replace(/\n/g,'</br>'));
}

//Close the modal if the user clicks anywhere outside of the modal.
window.onclick = function(event) {
    if(event.target == document.getElementById("eventModal")) {
        $('#eventModal').css("display", "none");
    }
}

//Handles searching through the table
function lookUp() {
    // Declare variables 
    var input, filter, table, tr, td, i;
    input = document.getElementById("searchInput");
    filter = input.value.toUpperCase();
    table = document.getElementById("searchTable");
    tr = table.getElementsByTagName("tr");

    // Loop through all table rows, and hide those who don't match the search query
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[0];
        if (td) {
            if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } 
            else {
                tr[i].style.display = "none";
            }
        } 
    }
    
}

populateTable();