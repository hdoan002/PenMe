var database = firebase.database();

//Populates the table with current events and dates for the user
function populateTable() {
    var table, expiredTable, row, eventCell, dateCell, eventNode, dateNode;
    table = document.getElementById("searchTable");
    expiredTable = document.getElementById("expiredSearchTable");
    var eventsRef = database.ref('events').orderByChild("eventDate");

    eventsRef.once("value")
        .then(function(snapshot) {

            //convert the snapshot into an array to sort events by start date
            var arrayCopy = snapshotToArray(snapshot);

            //sort the array of events based on soonest start time
            var sortedArray = sortByStartTime(arrayCopy);

              sortedArray.reverse().forEach(function(childSnapshot) {

                    var key = childSnapshot.key;

                    //only display events that belong to current logged in user
                    var userID = firebase.auth().currentUser.uid;

                    firebase.database().ref('users/' + userID).once("value").then(function(res) {

                        var eventsArrayCopy = res.val().events.slice();

                        eventsArrayCopy.forEach(function(data, index, array) {

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

                                var dateCheckResult = checkDate(childData);

                                if(dateCheckResult === 0)
                                {
                                    //event has expired
                                    expiredTable.prepend(row);
                                    $(".expiredTitle").css("display", "block");
                                    $("#expiredSearchTable").css("display", "table");
                                }
                                else
                                {
                                    //event hasn't expired
                                    table.appendChild(row);
                                }

                                if(index == array.length - 1)
                                {
                                    //add the header row at the end
                                    var newRow = document.createElement("tr");
                                    newRow.setAttribute('class', 'header');
                                    var eventHeader = document.createElement("th");
                                    eventHeader.setAttribute('style', 'width:60%');
                                    var dateHeader = document.createElement("th");   
                                    dateHeader.setAttribute('style', 'width:40%');

                                    eventHeader.innerHTML = "Meeting";
                                    dateHeader.innerHTML = "Date";
                                    newRow.appendChild(eventHeader);
                                    newRow.appendChild(dateHeader);;

                                    $("#expiredSearchTable").prepend(newRow);
                                }
                              
                            }

                        });

                    });                    

              });
        });

}

//function to hide expired events table when looking for events
// $('#searchInput').on("focus", function() {

//     $(".expiredTable").css("display", "none");

// });

// $('#searchInput').on("blur", function() {

//     $(".expiredTable").css("display", "block");

// });

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
        $('#editEventSearch').css("display", "none");

        $('#expiredSpanSearch').css("display", "block");

        $('.modalContent').addClass("expiredEvent");
    }
    else
    {
        //event is not expired
        $('#editEvent').css("display", "inline-block");

        $('#expiredSpanSearch').css("display", "none");

        $('.modalContent').removeClass("expiredEvent");        
    }

    var startTime = militaryTo12HourConversion(data.eventStartTime);
    var endTime = militaryTo12HourConversion(data.eventEndTime);
    
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

    var table2 = document.getElementById("expiredSearchTable");
    var tr2 = table2.getElementsByTagName("tr");
    var td2;

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

    for (i = 0; i < tr2.length; i++) {
        td2 = tr2[i].getElementsByTagName("td")[0];
        if (td2) {
            if (td2.innerHTML.toUpperCase().indexOf(filter) > -1) {
                tr2[i].style.display = "";
            } 
            else {
                tr2[i].style.display = "none";
            }
        } 
    }
};

populateTable();

//redirect to homepage if user logs out/tries to access unauthorised
// $(document).ready(function()
// {

//   firebase.auth().onAuthStateChanged(function(user) {

//     //if user is signed out, redirect to home page
//     if(!user)
//     {
//       window.location.href = "index.html"
//     }

//   });

// });

function snapshotToArray(snapshot) {

    var returnArr = [];

    snapshot.forEach(function(childSnapshot) {
        var item = childSnapshot.val();
        item.key = childSnapshot.key;

        returnArr.push(item);
    });

    return returnArr;
};

function sortByStartTime(arr){

    arr.sort(function(a, b) {

        var aYear = a.eventDate.substr(0, 4);
        var aMonth = a.eventDate.substr(5, 2) - 1;
        var aDay = a.eventDate.substr(8, 2);
        var aHour = a.eventStartTime.substr(0, 2);
        var aMin = a.eventStartTime.substr(3, 2);

        var aDate = new Date(aYear, aMonth, aDay, aHour, aMin);

        var bYear = b.eventDate.substr(0, 4);
        var bMonth = b.eventDate.substr(5, 2) - 1;
        var bDay = b.eventDate.substr(8, 2);
        var bHour = b.eventStartTime.substr(0, 2);
        var bMin = b.eventStartTime.substr(3, 2);

        var bDate = new Date(bYear, bMonth, bDay, bHour, bMin);

        if(aDate < bDate)
        {
            return -1;
        }
        if(aDate > bDate)
        {
            return 1;
        }

        return 0;


    });

    return arr;
   
};

function militaryTo12HourConversion(intTime) {

    // if (intTime == "00:00") {
    //     return "12:00 AM";
    // }
    // else if (intTime == "24:00") {
    //     return "11:59 PM";
    // }

    let hour = intTime.substr(0, 2);
    let timePeriod = (hour < 12) ? "AM" : "PM";
    if(hour < 10) hour = hour.substr(1, 1);
    else if(hour > 12) hour = Math.abs(hour - "12");
    let minute = intTime.substr(3, 2);
    return hour + ':' + minute + ' ' + timePeriod;

};