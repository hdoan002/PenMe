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
    var eventsRef = database.ref('events').orderByChild("eventDate");

    eventsRef.once("value")
        .then(function(snapshot) {

            //convert the snapshot into an array to sort events by start date
            var arrayCopy = snapshotToArray(snapshot);

            // sortByStartTime(arrayCopy);

              arrayCopy.reverse().forEach(function(childSnapshot) {

                    var key = childSnapshot.key;

                    //only display events that belong to current logged in user
                    var userID = firebase.auth().currentUser.uid;

                    firebase.database().ref('users/' + userID).once("value").then(function(res) {

                        var eventsArrayCopy = res.val().events.slice();

                        eventsArrayCopy.forEach(function(data) {

                            if(key === data)
                            {
                                //Grab database data
                                var childData = childSnapshot;

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

    var startTime = militaryTo12Hour(data.eventStartTime);
    var endTime = militaryTo12Hour(data.eventEndTime);
    
    //Display event text
    var eventText = $('#eventInfo').text(
    "Title: " + data.eventTitle + "\n" +
    "Owner: " + data.eventOwner + "\n" +
    "Event Start Time: " + startTime + "\n" +
    "Event End Time: " + endTime + "\n" +
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
        $('.modalContent').css("margin-top","15%");
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

function snapshotToArray(snapshot) {

    var returnArr = [];

    snapshot.forEach(function(childSnapshot) {
        var item = childSnapshot.val();
        item.key = childSnapshot.key;

        returnArr.push(item);
    });

    return returnArr;
};

// function sortByStartTime(arr){

//     // var minDate = arr[0].eventDate;
//     var minStartTime = arr[0].eventStartTime;
//     var minYear = arr[0].eventDate.substr(0, 4);
//     var minMonth = arr[0].eventDate.substr(5, 2);
//     var minDay = arr[0].eventDate.substr(8, 2);

//     for (var i = 1; i < arr.length; i++) {
//         if(arr[i].eventDate.substr(5, 2) <= minMonth)
//         {
//             if(arr[i].eventDate.substr(8, 2) <= minDay)
//             {
//                 if(arr[i].eventStartTime < minStartTime)
//                 {
                            
//                 }
//             }
//         }
//     }   
// }

//     arr.sort(function(a, b){

//         var aYear = a.eventDate.substr(0, 4);
//         var aMonth = a.eventDate.substr(5, 2);
//         var aDay = a.eventDate.substr(8, 2);

//         var bYear = b.eventDate.substr(0, 4);
//         var bMonth = b.eventDate.substr(5, 2);
//         var bDay = b.eventDate.substr(8, 2);

//         alert(a.eventID + " " + a.eventStartTime + " " + a.eventDate + " ? " + b.eventID + " " + b.eventStartTime + " " + b.eventDate);

//         if((a.eventStartTime < b.eventStartTime) && ((aMonth <= bMonth) && (aDay <= bDay)))
//         {
//             // return -1;
//             alert(a.eventStartTime + " " + a.eventDate + " < " + b.eventStartTime + " " + b.eventDate);
//         } 
//         else if((a.eventStartTime > b.eventStartTime) && ((aMonth <= bMonth) && (aDay <= bDay)))
//         {
//             // return -1;
//             alert(a.eventStartTime + " " + a.eventDate + " < " + b.eventStartTime + " " + b.eventDate);
//         }          
//         else if((a.eventStartTime < b.eventStartTime) && ((aMonth >= bMonth) && (aDay >= bDay)))
//         {
//             // return 1;
//             alert(a.eventStartTime + " " + a.eventDate + " > " + b.eventStartTime + " " + b.eventDate);
//         }
//         else if((a.eventStartTime > b.eventStartTime) && ((aMonth >= bMonth) && (aDay >= bDay)))
//         {
//             // return 1;
//             alert(a.eventStartTime + " " + a.eventDate + " > " + b.eventStartTime + " " + b.eventDate);
//         }
//         else
//         {
//             // return 0;
//             alert("returning 0");
//         }

//     });

//     return arr;

// };

function militaryTo12Hour(intTime) {
    // if (intTime == "00:00") {
    //     return "12:00 AM";
    // }
    // else if (intTime == "24:00") {
    //     return "11:59 PM";
    // }

    let hour = intTime.substr(0, 2);
    let timePeriod = (hour < 12) ? "AM" : "PM";
    if(hour < 10) hour = hour.substr(1, 1);
    else if(hour > 10) hour = Math.abs(hour - "12");
    let minute = intTime.substr(3, 2);
    return hour + ':' + minute + ' ' + timePeriod;
};

// $('#deleteBtn').on('click', function() {

//     var tempStr = $('#eventInfo').text();

//     //extract event id from modal for editing purposes
//     var eventID = tempStr.substr(10, 16);

//     deleteEvent(eventID);

// });

// function deleteEvent(eventID)
// {

//     firebase.auth().onAuthStateChanged(function(user) {

//             if(user)
//             {

//                 var currentUserID = user.uid;
//                 var currentUserEmail = user.email;
//                 var invitedUsersArr;

//                 firebase.database().ref('events/' + eventID).once("value").then(function(snapshot) {

//                     invitedUsersArr = snapshot.val().invitedUsers.slice();

//                     //remove the event from invited users' events then delete from event owner's collection
//                     deleteInvitedUsersEvents(eventID, invitedUsersArr).then(function() {

//                         firebase.database().ref('events/' + eventID).remove().then(function() {

//                             firebase.database().ref("users/" + currentUserID).once("value").then(function(snapshot) {

//                                 //get a copy of the events array that holds events belonging to a user
//                                 var eventsArrayCopy = snapshot.val().events.slice();

//                                 eventsArrayCopy.forEach(function(childSnapshot) {

//                                     if(childSnapshot === eventID)
//                                     {
//                                         var position = eventsArrayCopy.indexOf(childSnapshot);

//                                         //remove the event from the array (copy) 
//                                         //if last element in array, write "0" to avoid being deleted by firebase
//                                         if(eventsArrayCopy.length === 1)
//                                         {
//                                             eventsArrayCopy[0] = "0"
//                                         }
//                                         else
//                                         {
//                                             eventsArrayCopy.splice(position, 1);
//                                         }

//                                          //update the events array to the modified copy
//                                         firebase.database().ref('users/' + currentUserID).set(
//                                             {
//                                                 userEmail: currentUserEmail,
//                                                 events: eventsArrayCopy

//                                             }).then(function() {

//                                                 alert("Deleted event");
//                                                 window.location.reload();  

//                                             });                                 
//                                     }
                                    
//                                 });

//                             });

//                         }); 

                        
//                     });

//                 });


//             }
//             else
//             {
//                 // no user signed in
//                 alert("Must be logged in to do that");
//             }

//         });    

// };

// //global variable to hold event data
// var eventData;

// $('#editEvent').on('click', function() {

//     $('#eventEditModal').css("display","block");

//     var tempStr = $('#eventInfo').text();

//     //extract event id from modal for editing purposes
//     var eventID = tempStr.substr(10, 16);

//     //fields to be editied
//     // var eventDate;
//     // var eventStartTime;
//     // var eventEndTime;
//     // var eventTitle;
//     // var eventLocation;
//     // var eventDescription;
//     // var privacy;

//     firebase.auth().onAuthStateChanged(function(user) {

//         if(user)
//         {
//             //user is signed in
//             firebase.database().ref('events/' + eventID).once("value").then(function(snapshot) {

//                 displayEditForm(snapshot.val());

//                 eventData = snapshot.val();

//             });    

//         }
//         else
//         {
//             // no user signed in
//             alert("Must be logged in to do that");
//         }

//     });

// });

// function displayEditForm(data)
// {
//     var eventDate = data.eventDate;  
//     var eventStartTime = data.eventStartTime;
//     var eventEndTime = data.eventEndTime;
//     var eventTitle = data.eventTitle;
//     var eventDescription = data.eventDescription;
//     var eventLocation = data.eventLocation;
//     var privacySetting = data.privacySetting;

//     var dateDiv = document.createElement('div');

//     dateDiv.setAttribute('id', 'dateDiv');

//     document.getElementById('editForm').appendChild(dateDiv);

//     var dateInput = document.createElement('input');
//     var dateLabel = document.createElement('label');
//     var eventStartInput = document.createElement('input');
//     var eventEndInput = document.createElement('input');

//     dateInput.setAttribute('type', 'date');

//     dateInput.setAttribute('class', 'form-control');

//     dateInput.setAttribute('id', 'dateInput');

//     dateLabel.setAttribute('for', 'dateInput');

//     dateLabel.innerHTML = "Event Date";

//     dateInput.setAttribute('value', eventDate);    

//     eventStartInput.setAttribute('type', 'time');

//     eventStartInput.setAttribute('class', 'form-control');

//     eventStartInput.setAttribute('id', 'eventStartInput');

//     eventStartInput.setAttribute('value', eventStartTime);    

//     eventEndInput.setAttribute('type', 'time');

//     eventEndInput.setAttribute('class', 'form-control');

//     eventEndInput.setAttribute('id', 'eventEndInput');

//     eventEndInput.setAttribute('value', eventEndTime);

//     document.getElementById('dateDiv').appendChild(eventStartInput);
//     document.getElementById('dateDiv').appendChild(eventEndInput);
//     // document.getElementById('dateDiv').appendChild(dateLabel);
//     document.getElementById('dateDiv').appendChild(dateInput);
  
//     // ==================================================================

//     var titleDiv = document.createElement('div');

//     titleDiv.setAttribute('class', 'form-group');

//     titleDiv.setAttribute('id', 'titleDiv');

//     document.getElementById('editForm').appendChild(titleDiv);

//     var titleInput = document.createElement('input');

//     titleInput.setAttribute('type', 'text');

//     titleInput.setAttribute('class', 'form-control');

//     titleInput.setAttribute('id', 'titleInput');

//     titleInput.setAttribute('value', eventTitle);

//     document.getElementById('titleDiv').appendChild(titleInput);

//     // ==================================================================

//     var descDiv = document.createElement('div');

//     descDiv.setAttribute('class', 'form-group');

//     descDiv.setAttribute('id', 'descDiv');

//     document.getElementById('editForm').appendChild(descDiv);

//     var descInput = document.createElement('textarea');

//     descInput.setAttribute('class', 'form-control');

//     descInput.setAttribute('id', 'descInput');

//     descInput.innerHTML = eventDescription;

//     document.getElementById('descDiv').appendChild(descInput);

//     // ==================================================================

//     var locationDiv = document.createElement('div');

//     locationDiv.setAttribute('class', 'form-group');

//     locationDiv.setAttribute('id', 'locationDiv');

//     document.getElementById('editForm').appendChild(locationDiv);

//     var locationInput = document.createElement('input');

//     locationInput.setAttribute('class', 'form-control');

//     locationInput.setAttribute('id', 'locationInput');

//     locationInput.setAttribute('value', eventLocation);

//     document.getElementById('locationDiv').appendChild(locationInput);

//     // ==================================================================

//     var privacyDiv = document.createElement('div');

//     privacyDiv.setAttribute('class', 'form-group');

//     privacyDiv.setAttribute('id', 'privacyDiv');

//     document.getElementById('editForm').appendChild(privacyDiv);

//     var privacyInput = document.createElement('select');

//     privacyInput.setAttribute('id', 'pList');

//     document.getElementById('privacyDiv').appendChild(privacyInput);    

//     var p1 = document.createElement('option');
//     var p2 = document.createElement('option');   

//     p1.setAttribute("value", "public");
//     p2.setAttribute("value", "private"); 

//     p1.innerHTML = "Public (Default)";
//     p2.innerHTML = "Private";

//     document.getElementById('pList').appendChild(p1);
//     document.getElementById('pList').appendChild(p2);

//     if(privacySetting === "public")
//     {
//         p1.setAttribute("selected", true);
//     }
//     else
//     {
//         p2.setAttribute("selected", true);
//     }

// };

// $('#eventEditCancel').on("click", function() {

//     $('#eventEditModal').css("display", "none");
//     $('#editForm').empty();
//     eventData = "";
    
// });

// $('#eventEditSave').on("click", function() {

//     var eventDate = document.getElementById('dateInput').value;

//     var eventStart = document.getElementById('eventStartInput').value;

//     var eventEnd = document.getElementById('eventEndInput').value;

//     var eventTitle = document.getElementById('titleInput').value;

//     var eventLocation = document.getElementById('locationInput').value;

//     var eventDescription = document.getElementById('descInput').value;

//     var privacyValue = document.getElementById('pList').value;

//     var oldData = eventData;

//     //check start and end times here before updating
//     checkFields(eventDate, eventStart, eventEnd).then(function() {

//         //call update function here
//         updateEvent(eventDate, eventStart, eventEnd, eventTitle, eventLocation, eventDescription, privacyValue,
//             oldData);

//         $('#eventEditModal').css("display", "none");
//         $('#editForm').empty();

//     }).catch(function(error) {

//         alert("ERROR: " + error);
        
//     });


// });

// function updateEvent(eD, eS, eE, eT, eL, eDesc, pV, oldEventData)
// {

//     //data taken from old event data object (unmodified)
//     var eventOwner = oldEventData.eventOwner;
//     var eventOwnerEmail = oldEventData.eventOwnerEmail;
//     var eventID = oldEventData.eventID;
//     var eventTimezone = oldEventData.eventTimezone;
//     var repeatedDaysArray = oldEventData.repetitionDaysArray;

//     var repetitionFrequency = oldEventData.repetitionFrequency;
//     var eventReminders = oldEventData.eventReminders;
//     var invitedUsers = oldEventData.invitedUsers;

//     //new data that is modified in edit form
//     var eventDate = eD;
//     var eventStartTime = eS;
//     var eventEndTime = eE;
//     var eventTitle = eT;
//     var eventLocation = eL;
//     var eventDescription = eDesc;
//     var privacyValue = pV;

//     firebase.auth().onAuthStateChanged(function(user) {

//         if(user)
//         {
//             //user is signed in
//             firebase.database().ref('events/' + eventID).set({

//                 eventOwner: eventOwner,
//                 eventOwnerEmail: eventOwnerEmail,
//                 eventID: eventID,
//                 eventDate: eventDate,
//                 eventStartTime: eventStartTime,
//                 eventEndTime: eventEndTime,
//                 eventTitle: eventTitle,
//                 eventLocation: eventLocation,
//                 eventTimezone: eventTimezone,
//                 eventDescription: eventDescription,
//                 repetitionDaysArray: repeatedDaysArray,
//                 repetitionFrequency: repetitionFrequency,
//                 eventReminders: eventReminders,
//                 privacySetting: privacyValue,
//                 invitedUsers: invitedUsers                

//             }).then(function() {

//                 alert("Update event successfully");

//                 setTimeout(function() {

//                     window.location.reload();

//                 }, 750);   

//             }).catch(function(error) {

//                 var errorMessage = error.message;
//                 alert("ERROR: "  + errorMessage);

//             });
//         }
//         else
//         {
//             // no user signed in
//             alert("ERROR: Must be logged in to update event")
//         }

//     });

// };

// function deleteInvitedUsersEvents(eventID, invitedUsersArray)
// {
//     return new Promise(function (resolve, reject) {

//         var invitedUsers = invitedUsersArray;

//         firebase.database().ref('users/').once("value").then(function(snapshot) {

//             snapshot.forEach(function(childSnapshot) {

//                 var userEmail = childSnapshot.val().userEmail;
//                 var currentUserID = childSnapshot.key;
//                 if(invitedUsers.indexOf(userEmail) >= 0)
//                 {

//                     //the userEmail is in the list of invited users, remove the event from their collection

//                     //get a copy of the events array that holds events belonging to user
//                     var eventsArrayCopy = childSnapshot.val().events.slice();

//                     eventsArrayCopy.forEach(function(childSnapshot) {

//                         if(childSnapshot === eventID)
//                         {
//                             var position = eventsArrayCopy.indexOf(childSnapshot);

//                             //remove the event from the array (copy) 
//                             //if last element in array, write "0" to avoid being deleted by firebase
//                             if(eventsArrayCopy.length === 1)
//                             {
//                                 eventsArrayCopy[0] = "0"
//                             }
//                             else
//                             {
//                                 eventsArrayCopy.splice(position, 1);
//                             }

//                              //update the events array to the modified copy
//                             firebase.database().ref('users/' + currentUserID).set(
//                                 {
//                                     userEmail: userEmail,
//                                     events: eventsArrayCopy

//                                 });
//                                 return resolve();                                
//                         }

//                     });                    
//                 }

//             });

//         });

//         return resolve();

//     });

// };

// function checkFields(eventDate, start, end) {

//     return new Promise(function(resolve, reject) {

//         var inputtedYear = eventDate.substr(0, 4);
//         var inputtedMonth = eventDate.substr(5, 2);
//         var inputtedDay = eventDate.substr(8, 2);

//         var today = new Date();

//         var dd = today.getDate();

//         var mm = today.getMonth()+1;

//         var yyyy = today.getFullYear();

//         if(dd < 10)
//         {
//             dd = '0' + dd;
//         }

//         if(mm < 10)
//         {
//             mm = '0' + mm;
//         }

//         if (inputtedYear < yyyy)
//         {
//             return reject("Date can not be before current date");
//         }
//         else if(inputtedYear == yyyy)
//         {
//             if(inputtedMonth < mm)
//             {
//                 return reject("Date can not be before current date");
//             }
//             else if(inputtedMonth == mm)
//             {
//                 if(inputtedDay < dd) //date is before current day
//                 {
//                     return reject("Date can not be before current date");
//                 }
//                 else if(inputtedDay == dd) //date is the same as current day
//                 {

//                     var hh = today.getHours();

//                     if(hh < 10)
//                     {
//                         hh = '0' + hh;
//                     }

//                     var mm = today.getMinutes();

//                     if(mm < 10)
//                     {
//                         mm = '0' + mm;
//                     }

//                     var time = hh + ":" + mm;

//                     //if the event end time is less than current time
//                     if(start < time)
//                     {
//                         return reject("Event start time can not be before current time");
//                     }
//                     else if(end < time)
//                     {
//                         return reject("Event end time can not be before current time"); //if event time is after current time
//                     }
//                     else if(start == end)
//                     {
//                         return reject("Event starting and ending times can not be the same");
//                     }
//                     else
//                     {
//                         return resolve();
//                     }

//                 }
//                 else if(inputtedDay > dd) //date is after current day
//                 {
//                     var hh = today.getHours();

//                     if(hh < 10)
//                     {
//                         hh = '0' + hh;
//                     }

//                     var mm = today.getMinutes();

//                     if(mm < 10)
//                     {
//                         mm = '0' + mm;
//                     }

//                     var time = hh + ":" + mm;

//                     //if the event end time is less than current time
//                     if(start > end)
//                     {
//                         return reject("Event start time can not be greater than ending event time");
//                     }
//                     else if(start == end)
//                     {
//                         return reject("Event starting and ending times can not be the same");
//                     }
//                     else
//                     {
//                         return resolve();
//                     }
//                 }
//             } 

//         }



//     });

// };


// function checkDate(event) {

//     var eventDate = event.eventDate;
//     var endTime = event.eventEndTime;
//     var startTime = event.eventStartTime;

//     var inputtedYear = eventDate.substr(0, 4);
//     var inputtedMonth = eventDate.substr(5, 2);
//     var inputtedDay = eventDate.substr(8, 2);

//     var today = new Date();

//     var dd = today.getDate();

//     var mm = today.getMonth()+1;

//     var yyyy = today.getFullYear();

//     if(dd < 10)
//     {
//         dd = '0' + dd;
//     }

//     if(mm < 10)
//     {
//         mm = '0' + mm;
//     }

//     if (inputtedYear < yyyy)
//     {
//         return 0;
//     }
//     else if(inputtedYear == yyyy)
//     {
//         if(inputtedMonth < mm)
//         {
//             return 0;
//         }
//         else if(inputtedMonth == mm)
//         {
//             if(inputtedDay < dd) //date is before current day
//             {
//                 return 0;
//             }
//             else if(inputtedDay == dd) //date is the same as current day
//             {

//                 var hh = today.getHours();

//                 if(hh < 10)
//                 {
//                     hh = '0' + hh;
//                 }

//                 var mm = today.getMinutes();

//                 if(mm < 10)
//                 {
//                     mm = '0' + mm;
//                 }

//                 var time = hh + ":" + mm;

//                 //if the event end time is less than current time
//                 if(endTime < time)
//                 {
//                     return 0;
//                 }
//                 else
//                 {
//                     return 1; //if event time is after current time
//                 }

//             }
//             else if(inputtedDay > dd) //date is after current day
//             {
//                 return 1;
//             }
//         } 

//     }

// };