// Listen for form submit
document
  .getElementById("scheduleForm")
  .addEventListener("submit", saveSchedule);

// Save schedule
function saveSchedule(e) {
  // Get form values
  var eT = $("#eventTitle").val();
  var eL = $("#eventLocation").val();
  var eTz = $("#eventTimezone").val();
  var eDesc = $("#eventDescription").val();
  var eDate = $("#eventDate").val();
  var eStart = $("#eventStart").val();
  var eEnd = $("#eventEnd").val();
  var eR = $("#eventReminders").val();
  var eP = $("#eventPrivacy").val();

  //Form validation
  if (!validateForm(eT, eStart, eEnd, eL, eTz, eDate, eDesc)) {
    return false;
  }

  var repArray = new Array(0);
  var eRepetition = null;
  var repFrequency = null;
  var eID = generateToken();
  var iA = null;

  writeUserData(
    eID,
    eDate,
    eStart,
    eEnd,
    eT,
    eL,
    eTz,
    eDesc,
    repArray,
    repFrequency,
    eR,
    eP,
    iA
  );

  // Clear form
  document.getElementById("scheduleForm").reset();

  // Re-fetch schedule
  fetchSchedule();

  // Prevent form from submitting
  e.preventDefault();
}

// Fetch events
function fetchSchedule() {
  // Get schedule from localStorage
  var schedule = JSON.parse(localStorage.getItem("schedule"));
  // Get output id
  var scheduleResults = document.getElementById("scheduleResults");

  // Build output
  scheduleResults.innerHTML = "";
  for (var i = 0; i < schedule.length; i++) {
    var name = schedule[i].name;
    var day = schedule[i].day;
    var start = schedule[i].start;
    var end = schedule[i].end;
    var location = schedule[i].location;

    scheduleResults.innerHTML +=
      '<div class="card">' +
      '<div class="card-body">' +
      "<h4>" +
      name +
      "</h4>" +
      "<h5>Day: " +
      day +
      "</h5>" +
      "<h5>Start time: " +
      start +
      "</h5>" +
      "<h5>End time: " +
      end +
      "</h5>" +
      "<h5>Location: " +
      location +
      "</h5>" +
      " <a onclick=\"deleteEvent('" +
      name +
      '\')" class="btn btn-danger" href="#">Delete</a> ' +
      "</div>" +
      "</div>";
  }
}

//take form data and create a JSON object of all the data and
//upload to firebase database /eventss
function writeUserData(
  eI,
  eDay,
  eS,
  eE,
  eT,
  eL,
  eTz,
  eDesc,
  rA,
  rF,
  eR,
  pV,
  iA
) {
  //set() overwrites data at the specified location (here events/eventID)
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      //user is signed in
      firebase
        .database()
        .ref("events/" + eI)
        .set({
          eventOwner: firebase.auth().currentUser.displayName,
          eventOwnerEmail: firebase.auth().currentUser.email,
          eventID: eI,
          eventDate: eDay,
          eventStartTime: eS,
          eventEndTime: eE,
          eventTitle: eT,
          eventLocation: eL,
          eventTimezone: eTz,
          eventDescription: eDesc,
          repetitionaDaysArray: rA,
          repetitionFrequency: rF,
          eventReminders: eR,
          privacySetting: pV,
          invitedUsers: iA
        })
        .then(function() {
          //add the newly created event to the users' list of participating events
          var userID = firebase.auth().currentUser.uid;

          console.log(userID);

          firebase
            .database()
            .ref("users/" + userID)
            .once("value")
            .then(function(snapshot) {
              var eventArray = snapshot.val().events;

              if (eventArray[0] === "0") {
                eventArray.shift();
                eventArray.push(eI);
                updateEventsArray(eventArray, userID);
              } else {
                eventArray.push(eI);
                updateEventsArray(eventArray, userID);
              }

              alert("Event created successfully!");

              window.location.href = "index.html";
            });
        })
        .catch(function(error) {
          var errorMessage = error.message;

          alert("ERROR: " + errorMessage);
        });
    } else {
      //user is not signed in
      alert("ERROR: Must be logged in to setup a new event");
    }
  });
}

// Delete event
function deleteEvent(name) {
  // Get bookmarks from localStorage
  var schedule = JSON.parse(localStorage.getItem("schedule"));
  // Loop through the bookmarks
  for (var i = 0; i < schedule.length; i++) {
    if (schedule[i].name == name) {
      // Remove from array
      schedule.splice(i, 1);
    }
  }
  // Re-set back to localStorage
  localStorage.setItem("schedule", JSON.stringify(schedule));

  // Re-fetch bookmarks
  fetchSchedule();
}

// Validate Form
function validateForm(
  title,
  start,
  end,
  location,
  timezone,
  date,
  description
) {
  if (
    !title ||
    !start ||
    !end ||
    !location ||
    !timezone ||
    !date ||
    !description
  ) {
    alert("Please fill in the form");
    return false;
  }

  var expression = /\b((1[0-2]|0?[1-9]):([0-5][0-9]) ([AaPp][Mm]))/;
  var regex = new RegExp(expression);

  if (!start.match(regex)) {
    alert("Please use a valid start time");
    return false;
  }
  if (!end.match(regex)) {
    alert("Please use a valid end time");
    return false;
  }

  return true;
}

function rand() {
  return Math.random()
    .toString(36)
    .substr(2); // remove `0.`
}

function generateToken() {
  return rand() + rand(); // to make it longer
}

//redirect to homepage if user logs out/tries to access unauthorised
$(document).ready(function() {
  firebase.auth().onAuthStateChanged(function(user) {
    //if user is signed out, redirect to home page
    if (!user) {
      window.location.href = "index.html";
    }
  });
});
