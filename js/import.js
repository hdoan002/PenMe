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

  console.log("Saving Schedule");

  //Form validation
  if (!validateForm(eT, eStart, eEnd, eL, eTz, eDate, eDesc)) {
    return false;
  }

  var repArray = new Array(0);
  var eRepetition = "none";
  var repFrequency = "none";
  var eID = generateToken();
  var iA = "none";

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

  // Prevent form from submitting
  e.preventDefault();
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
          repetitionDaysArray: rA,
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
    .slice(2, 10); // remove `0.`
}

function generateToken() {
  //return token of length 16
  return rand() + rand();
}

function updateEventsArray(eventsArr, userID) {
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      //user is signed in
      firebase
        .database()
        .ref("users/" + userID)
        .set({
          events: eventsArr
        });
    } else {
      // no user signed in
      alert("Must be logged in to do that");
    }
  });
}

//redirect to homepage if user logs out/tries to access unauthorised
// $(document).ready(function() {
//   firebase.auth().onAuthStateChanged(function(user) {
//     //if user is signed out, redirect to home page
//     if (!user) {
//       window.location.href = "index.html";
//     }
//   });
// });
