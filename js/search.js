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

                    var key = childSnapshot.key;

                    //only display events that belong to current logged in user
                    var userID = firebase.auth().currentUser.uid;

                    firebase.database().ref('users/' + userID).once("value").then(function(res) {

                        var eventsArrayCopy = res.val().events.slice();

                        eventsArrayCopy.forEach(function(data) {

                            if(key === data)
                            {
                                //Grab database data
                                var childData = childSnapshot.val();
                                //Create new row and column elements
                                row = document.createElement("tr");
                                eventCell = document.createElement("td");
                                dateCell = document.createElement("td");
                                //Add text data onto column elements
                                eventNode = document.createTextNode(childData.eventTitle);
                                dateNode = document.createTextNode(childData.eventDate);
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
                                
                            }

                        });

                    });                    

              });
        });
}

//Populate Modal Data based on the event
function displayEvent(data) {
    $('#eventModal').css("display","block");
    
    //House the event ID in the modal to capture for editing events
    $('#eventID').css("display", "none");
    $('#eventID').html(data.eventID);
    
    var dateCheckResult = checkDate(data);

    if(dateCheckResult === 0) //event is before current time
    {
         //mark event as expired and remove edit button
        $('#editEvent').css("display", "none");

        $('#expiredSpan').css("display", "block");

        $('.modalContent').addClass("expiredEvent");
    }
    else
    {
        $('#editEvent').css("display", "inline-block");

        $('#expiredSpan').css("display", "none");

        $('.modalContent').removeClass  ("expiredEvent");        
    }
    
    //Display event text
    var eventText = $('#eventInfo').text(
    "Title: " + data.eventTitle + "\n" +
    "Owner: " + data.eventOwner + "\n" +
    "Description: " + data.eventDescription + "\n" +
    "Privacy: " + data.privacySetting + "\n"); 
    eventText.html(eventText.html().replace(/\n/g,'</br>'));        


};

//Close the modal if the user clicks anywhere outside of the modal.
window.onclick = function(event) {
    if(event.target == document.getElementById("eventModal")) {
        $('#eventModal').css("display", "none");
    }
    else if(event.target == document.getElementById("eventEditModal")) {
        $('#eventEditModal').css("display", "none");
        $('#editForm').empty();
        eventData = "";
    }
};

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
};

populateTable();

//redirect to homepage if user logs out/tries to access unauthorised
$(document).ready(function()
{

  firebase.auth().onAuthStateChanged(function(user) {

    //if user is signed out, redirect to home page
    if(!user)
    {
      window.location.href = "index.html"
    }

  });

});

// function checkFields(eventDate, start, end) {

//     var startTotal = Number(start.substr(3,2)) + (Number(start.substr(0, 2)) * 60);

//     var endTotal = Number(end.substr(3,2)) + (Number(end.substr(0, 2)) * 60);

//     alert("start total minutes: " + startTotal);

//     alert("end total minutes: " + endTotal);

//     if(startTotal === endTotal)
//     {
//         return 0;
//     }
//     else if(endTotal < startTotal)
//     {
//         return 0;
//     }

//     return 1;

// };



    // return 1;