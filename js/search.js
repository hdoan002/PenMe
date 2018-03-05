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
                                
                            }

                        });

                    });                    

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
        eventData = "";
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

//TODO: FIX (after deleting from events, seems to throw off, doesn't seem to read as an array as push() doesn't work)
//might need to copy array, remove, then update spot
$('#deleteBtn').on('click', function() {

    var tempStr = $('#eventInfo').text();

    //extract event id from modal for editing purposes
    var eventID = tempStr.substr(10, 16);

    deleteEvent(eventID);

});

function deleteEvent(eventID)
{

    firebase.auth().onAuthStateChanged(function(user) {

            if(user)
            {

                var currentUserID = user.uid;
                var currentUserEmail = user.email;
                var invitedUsersArr;

                firebase.database().ref('events/' + eventID).once("value").then(function(snapshot) {

                    invitedUsersArr = snapshot.val().invitedUsers.slice();

                    //remove the event from invited users' events then delete from event owner's collection
                    deleteInvitedUsersEvents(eventID, invitedUsersArr).then(function() {

                        firebase.database().ref('events/' + eventID).remove().then(function() {

                            firebase.database().ref("users/" + currentUserID).once("value").then(function(snapshot) {

                                //get a copy of the events array that holds events belonging to a user
                                var eventsArrayCopy = snapshot.val().events.slice();

                                eventsArrayCopy.forEach(function(childSnapshot) {

                                    if(childSnapshot === eventID)
                                    {
                                        var position = eventsArrayCopy.indexOf(childSnapshot);

                                        //remove the event from the array (copy) 
                                        //if last element in array, write "0" to avoid being deleted by firebase
                                        if(eventsArrayCopy.length === 1)
                                        {
                                            eventsArrayCopy[0] = "0"
                                        }
                                        else
                                        {
                                            eventsArrayCopy.splice(position, 1);
                                        }

                                         //update the events array to the modified copy
                                        firebase.database().ref('users/' + currentUserID).set(
                                            {
                                                userEmail: currentUserEmail,
                                                events: eventsArrayCopy

                                            }).then(function() {

                                                alert("Deleted event");
                                                window.location.reload();  

                                            });                                 
                                    }
                                    // i++;
                                });

                            });

                        }); 

                        
                    });

                });


            }
            else
            {
                // no user signed in
                alert("Must be logged in to do that");
            }

        });    

};

//global variable to hold event data
var eventData;

$('#editEvent').on('click', function() {

    $('#eventEditModal').css("display","block");

    var tempStr = $('#eventInfo').text();

    //extract event id from modal for editing purposes
    var eventID = tempStr.substr(10, 16);

    //fields to be editied
    // var eventDate;
    // var eventStartTime;
    // var eventEndTime;
    // var eventTitle;
    // var eventLocation;
    // var eventDescription;
    // var privacy;

    firebase.auth().onAuthStateChanged(function(user) {

        if(user)
        {
            //user is signed in
            firebase.database().ref('events/' + eventID).once("value").then(function(snapshot) {

                displayEditForm(snapshot.val());

                eventData = snapshot.val();

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

function displayEditForm(data)
{
    var eventDate = data.eventDate;  
    var eventStartTime = data.eventStartTime;
    var eventEndTime = data.eventEndTime;
    var eventTitle = data.eventTitle;
    var eventDescription = data.eventDescription;
    var eventLocation = data.eventLocation;
    var privacySetting = data.privacySetting;

    // var event 

    var dateDiv = document.createElement('div');

    dateDiv.setAttribute('id', 'dateDiv');

    document.getElementById('editForm').appendChild(dateDiv);

    var dateInput = document.createElement('input');
    var eventStartInput = document.createElement('input');
    var eventEndInput = document.createElement('input');

    dateInput.setAttribute('type', 'date');

    dateInput.setAttribute('class', 'form-control');

    dateInput.setAttribute('id', 'dateInput');

    dateInput.setAttribute('value', eventDate);    

    eventStartInput.setAttribute('type', 'time');

    eventStartInput.setAttribute('class', 'form-control');

    eventStartInput.setAttribute('id', 'eventStartInput');

    eventStartInput.setAttribute('value', eventStartTime);    

    eventEndInput.setAttribute('type', 'time');

    eventEndInput.setAttribute('class', 'form-control');

    eventEndInput.setAttribute('id', 'eventEndInput');

    eventEndInput.setAttribute('value', eventEndTime);

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

    titleInput.setAttribute('id', 'titleInput');

    titleInput.setAttribute('value', eventTitle);

    document.getElementById('titleDiv').appendChild(titleInput);

    // ==================================================================

    var descDiv = document.createElement('div');

    descDiv.setAttribute('class', 'form-group');

    descDiv.setAttribute('id', 'descDiv');

    document.getElementById('editForm').appendChild(descDiv);

    var descInput = document.createElement('textarea');

    descInput.setAttribute('class', 'form-control');

    descInput.setAttribute('id', 'descInput');

    descInput.innerHTML = eventDescription;

    document.getElementById('descDiv').appendChild(descInput);

    // ==================================================================

    var locationDiv = document.createElement('div');

    locationDiv.setAttribute('class', 'form-group');

    locationDiv.setAttribute('id', 'locationDiv');

    document.getElementById('editForm').appendChild(locationDiv);

    var locationInput = document.createElement('input');

    locationInput.setAttribute('class', 'form-control');

    locationInput.setAttribute('id', 'locationInput');

    locationInput.setAttribute('value', eventLocation);

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

    if(privacySetting === "public")
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
    eventData = "";
    
});

$('#eventEditSave').on("click", function() {

    // var repArray = new Array(0);

    var eventDate = document.getElementById('dateInput').value;

    var eventStart = document.getElementById('eventStartInput').value;

    var eventEnd = document.getElementById('eventEndInput').value;

    var eventTitle = document.getElementById('titleInput').value;

    var eventLocation = document.getElementById('locationInput').value;

    var eventDescription = document.getElementById('descInput').value;

    var privacyValue = document.getElementById('pList').value;

    var oldData = eventData;

    //call update function here
    updateEvent(eventDate, eventStart, eventEnd, eventTitle, eventLocation, eventDescription, privacyValue,
        oldData);

    $('#eventEditModal').css("display", "none");
    $('#editForm').empty();

});

function updateEvent(eD, eS, eE, eT, eL, eDesc, pV, oldEventData)
{

    //data taken from old event data object (unmodified)
    var eventOwner = oldEventData.eventOwner;
    var eventOwnerEmail = oldEventData.eventOwnerEmail;
    var eventID = oldEventData.eventID;
    var eventTimezone = oldEventData.eventTimezone;
    var repeatedDaysArray = oldEventData.repetitionDaysArray;

    var repetitionFrequency = oldEventData.repetitionFrequency;
    var eventReminders = oldEventData.eventReminders;
    var invitedUsers = oldEventData.invitedUsers;

    //new data that is modified in edit form
    var eventDate = eD;
    var eventStartTime = eS;
    var eventEndTime = eE;
    var eventTitle = eT;
    var eventLocation = eL;
    var eventDescription = eDesc;
    var privacyValue = pV;

    firebase.auth().onAuthStateChanged(function(user) {

        if(user)
        {
            //user is signed in
            firebase.database().ref('events/' + eventID).set({

                eventOwner: eventOwner,
                eventOwnerEmail: eventOwnerEmail,
                eventID: eventID,
                eventDate: eventDate,
                eventStartTime: eventStartTime,
                eventEndTime: eventEndTime,
                eventTitle: eventTitle,
                eventLocation: eventLocation,
                eventTimezone: eventTimezone,
                eventDescription: eventDescription,
                repetitionDaysArray: repeatedDaysArray,
                repetitionFrequency: repetitionFrequency,
                eventReminders: eventReminders,
                privacySetting: privacyValue,
                invitedUsers: invitedUsers                

            }).then(function() {

                alert("Update event successfully");

                setTimeout(function() {

                    window.location.reload();

                }, 750);   

            }).catch(function(error) {

                var errorMessage = error.message;
                alert("ERROR: "  + errorMessage);

            });
        }
        else
        {
            // no user signed in
            alert("ERROR: Must be logged in to update event")
        }

    });

};

function deleteInvitedUsersEvents(eventID, invitedUsersArray)
{
    return new Promise(function (resolve, reject) {

        var invitedUsers = invitedUsersArray;

        firebase.database().ref('users/').once("value").then(function(snapshot) {

            snapshot.forEach(function(childSnapshot) {

                var userEmail = childSnapshot.val().userEmail;
                var currentUserID = childSnapshot.key;
                if(invitedUsers.indexOf(userEmail) >= 0)
                {

                    //the userEmail is in the list of invited users, remove the event from their collection

                    //get a copy of the events array that holds events belonging to user
                    var eventsArrayCopy = childSnapshot.val().events.slice();

                    eventsArrayCopy.forEach(function(childSnapshot) {

                        if(childSnapshot === eventID)
                        {
                            var position = eventsArrayCopy.indexOf(childSnapshot);

                            //remove the event from the array (copy) 
                            //if last element in array, write "0" to avoid being deleted by firebase
                            if(eventsArrayCopy.length === 1)
                            {
                                eventsArrayCopy[0] = "0"
                            }
                            else
                            {
                                eventsArrayCopy.splice(position, 1);
                            }

                             //update the events array to the modified copy
                            firebase.database().ref('users/' + currentUserID).set(
                                {
                                    userEmail: userEmail,
                                    events: eventsArrayCopy

                                });
                                return resolve();                                
                        }

                    });                    
                }

            });

        });

        return resolve();

    });

};