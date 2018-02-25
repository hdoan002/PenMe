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
    else if(event.target == document.getElementById("eventEditModal")) {
        $('#eventEditModal').css("display", "none");
        $('#editForm').empty();
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

$('#deleteBtn').on('click', function() {

    var eventID = $('#eventDelete').val();
    deleteEvent(eventID);

});

function deleteEvent(eventID)
{

    firebase.auth().onAuthStateChanged(function(user) {

            if(user)
            {
                //user is signed in
                firebase.database().ref('events/' + eventID).remove().then(function() {

                    alert("Deleted event");
                    window.location.reload();

                }); 

            }
            else
            {
                // no user signed in
                alert("Must be logged in to do that");
            }

        });    

};

$('#editEvent').on('click', function() {

    $('#eventEditModal').css("display","block");

    var tempStr = $('#eventInfo').text();

    //extract event id from modal for editing purposes
    var eventID = tempStr.substr(10, 16);

    //fields to be editied
    var eventDate;
    var eventStartTime;
    var eventEndTime;
    var eventTitle;
    var eventLocation;
    var eventDescription;
    var privacy;

    firebase.auth().onAuthStateChanged(function(user) {

        if(user)
        {
            //user is signed in
            firebase.database().ref('events/' + eventID).once("value").then(function(snapshot) {

                eventDate = snapshot.val().eventDate;
                eventTitle = snapshot.val().eventTitle;
                eventStartTime = snapshot.val().eventStartTime;
                eventEndTime = snapshot.val().eventEndTime;
                eventLocation = snapshot.val().eventLocation;
                eventDescription = snapshot.val().eventDescription;
                privacy = snapshot.val().privacySetting;

                displayEditForm(eventDate, eventStartTime, eventEndTime, eventTitle, eventDescription,
                    eventLocation, privacy);

            });    

        }
        else
        {
            // no user signed in
            alert("Must be logged in to do that");
        }

    });

    //TODO: AFTER CLICKING EDIT BUTTON, DYNAMICALL ADD FORM FIELDS IN DIVS AND PREPOPULATE
    //HAVE A SAVE BUTTON TO CALL WRITE (SET/UPATE) FUNCTION OF ALL FIELDS UPON PRESS

});

function displayEditForm(eD, eS, eE, eT, eDesc, eL, p)
{

    var dateDiv = document.createElement('div');

    dateDiv.setAttribute('id', 'dateDiv');

    document.getElementById('editForm').appendChild(dateDiv);

    var dateInput = document.createElement('input');
    var eventStartInput = document.createElement('input');
    var eventEndInput = document.createElement('input');

    dateInput.setAttribute('type', 'date');

    dateInput.setAttribute('class', 'form-control');

    dateInput.setAttribute('value', eD);    

    eventStartInput.setAttribute('type', 'time');

    eventStartInput.setAttribute('class', 'form-control');

    eventStartInput.setAttribute('value', eS);    

    eventEndInput.setAttribute('type', 'time');

    eventEndInput.setAttribute('class', 'form-control');

    eventEndInput.setAttribute('value', eE);

    document.getElementById('dateDiv').appendChild(eventStartInput);
    document.getElementById('dateDiv').appendChild(eventEndInput);
    document.getElementById('dateDiv').appendChild(dateInput);

    // ==================================================================

    var titleDiv = document.createElement('div');

    titleDiv.setAttribute('class', 'form-group');

    titleDiv.setAttribute('id', 'titleDiv');

    document.getElementById('editForm').appendChild(titleDiv);

    var titleInput = document.createElement('input');

    titleInput.setAttribute('type', 'text');

    titleInput.setAttribute('class', 'form-control');

    titleInput.setAttribute('value', eT);

    document.getElementById('titleDiv').appendChild(titleInput);

    // ==================================================================

    var descDiv = document.createElement('div');

    descDiv.setAttribute('class', 'form-group');

    descDiv.setAttribute('id', 'descDiv');

    document.getElementById('editForm').appendChild(descDiv);

    var descInput = document.createElement('textarea');

    descInput.setAttribute('class', 'form-control');

    descInput.innerHTML = eDesc;

    document.getElementById('descDiv').appendChild(descInput);

    // ==================================================================

    var locationDiv = document.createElement('div');

    locationDiv.setAttribute('class', 'form-group');

    locationDiv.setAttribute('id', 'locationDiv');

    document.getElementById('editForm').appendChild(locationDiv);

    var locationInput = document.createElement('input');

    locationInput.setAttribute('class', 'form-control');

    locationInput.setAttribute('value', eL);

    document.getElementById('locationDiv').appendChild(locationInput);

    // ==================================================================

    var privacyDiv = document.createElement('div');

    privacyDiv.setAttribute('class', 'form-group');

    privacyDiv.setAttribute('id', 'privacyDiv');

    document.getElementById('editForm').appendChild(privacyDiv);

    var privacyInput = document.createElement('select');

    privacyInput.setAttribute('id', 'pList');

    document.getElementById('privacyDiv').appendChild(privacyInput);    

    var p1 = document.createElement('option');
    var p2 = document.createElement('option');   

    p1.setAttribute("value", "public");
    p2.setAttribute("value", "private"); 

    p1.innerHTML = "Public (Default)";
    p2.innerHTML = "Private";

    document.getElementById('pList').appendChild(p1);
    document.getElementById('pList').appendChild(p2);

    if(p === "public")
    {
        p1.setAttribute("selected", true);
    }
    else
    {
        p2.setAttribute("selected", true);
    }

}

$('#eventEditCancel').on("click", function() {

    $('#eventEditModal').css("display", "none");
    $('#editForm').empty();
    
});

$('#eventEditSave').on("click", function() {

    //call update function here

    $('#eventEditModal').css("display", "none");
    $('#editForm').empty();

});