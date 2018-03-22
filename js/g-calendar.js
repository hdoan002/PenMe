 //Client ID and API key from the Developer Console
var CLIENT_ID = '536158657842-2rure9m2615ninag9pt020alkihhbtr6.apps.googleusercontent.com';
var API_KEY = 'AIzaSyBmp9Qe0xoTp0kNBCE8VjGb4zpCbqzr59U';

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = "https://www.googleapis.com/auth/calendar.readonly";

var authorizeButton = document.getElementById('gcalendar-btn');
var signoutButton = document.getElementById('gcalendar-remove-btn');
var refreshButton = document.getElementById('gcalendar-refresh-btn');

/**
 *  On load, called to load the auth2 library and API client library.
 */
function handleClientLoad() 
{
  gapi.load('client:auth2', initClient);
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient() {
  gapi.client.init({
    apiKey: API_KEY,
    clientId: CLIENT_ID,
    discoveryDocs: DISCOVERY_DOCS,
    scope: SCOPES
  }).then(function () {
    // Listen for sign-in state changes.
    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

    // Handle the initial sign-in state.
    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    authorizeButton.onclick = handleAuthClick;
    signoutButton.onclick = handleSignoutClick;
    refreshButton.onclick = handleRefreshClick;
  });
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    authorizeButton.style.display = 'none';
    refreshButton.style.display = 'block';
    signoutButton.style.display = 'block';
  } else {
    authorizeButton.style.display = 'block';
    refreshButton.style.display = 'none';
    signoutButton.style.display = 'none';
  }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick(event) 
{
  gapi.auth2.getAuthInstance().signIn().then(function() {

    listUpcomingEvents();

    // window.location.href="index.html";

  });
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick(event) 
{
  gapi.auth2.getAuthInstance().signOut();

  // .then(function() {

  //   var userID = firebase.auth().currentUser.uid;

    //clear the array of stored google calendar events
    // firebase.database().ref('calendar/').remove();
    // removeUserEvents(userID);
    // firebase.database().ref('calendario/' + userID).remove();

  // });
}

// refresh events to get more recent events 
function handleRefreshClick(event)
{
    listUpcomingEvents();
};

/**
 * Get 20 events from google primary calendar and add them to events collection
 */
function listUpcomingEvents() {
  gapi.client.calendar.events.list({
    'calendarId': 'primary',
    'timeMin': (new Date()).toISOString(),
    'showDeleted': false,
    'singleEvents': true,
    'maxResults': 15,
    'orderBy': 'startTime'
  }).then(async function(response) {
    var events = response.result.items;

    var userID = firebase.auth().currentUser.uid;

    if (events.length > 0) 
    {

      for(i = 0; i < events.length; i++)
      {

        await checkEvent(events[i]).then(async function(res) {

          await createObject(events[i], userID).then(async function(result)
          {

            await addUserEvent(result, userID);

            // await addInvitedUsers(result);

          });

        }).catch(function(error) {

            console.log("not importing duplicate event from calendar");

        });


      } 

    } 
    else 
    {
      alert("No upcoming events found.");
    }
  });

}    

function createObject(event, userID)
{

  return new Promise(async function(resolve, reject) 
  {

    var eI = event.iCalUID.substr(0, 16);
    var eDay = event.start.dateTime.substr(0, 10);
    var eDesc = event.description;
    var eE = event.end.dateTime.substr(11, 5);
    var eL = event.location;
    var eO = event.creator.displayName;
    var eOe = event.creator.email;
    var eR = event.reminders;
    var eS = event.start.dateTime.substr(11, 5);
    var eTz = event.start.timeZone;
    var eT = event.summary;
    var iA = event.attendees;      
    var pV = event.visibility;  
    var rA = event.recurrence;
    var rF;

    if(rA == undefined)
    {
      rA = "none";
      rF = "none";
    }
    if(iA == undefined)
    {
      iA = "none";
    }
    if(eR == undefined)
    {
      eR = "none";
    }
    if(pV == undefined)
    {
      pV = "public";
    }
    if(eDesc == undefined)
    {
      eDesc = "none";
    }
    if(eL == undefined)
    {
      eL = "none";
    }
    if(eTz == undefined)
    {
      eTz = "pst";
    }
    if(eO == undefined)
    {
      eO = eOe;
    }

    var eventsRef = firebase.database().ref('events/' + eI);

    eventsRef.once("value").then(function(snapshot) 
    {    
          if(snapshot.val() == null)
          {

            resolve(eI);

            eventsRef.set(
            {

              eventOwner: eO,
              eventOwnerEmail: eOe,
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

            });
  
          }
          else if(snapshot.val() != null)
          {

            var newID = generateToken();

            resolve(newID);

            var eventDate = snapshot.val().eventDate;

            if(eDay != eventDate)
            {

              firebase.database().ref('events/' + newID).set({

                eventOwner: eO,
                eventOwnerEmail: eOe,
                eventID: newID,
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

              });

            }

          }
    });

  });

};

function rand() {

    return Math.random().toString(36).slice(2, 10); // remove `0.`
};

function generateToken() {

  //return token of length 16
  return rand() + rand();

};

//redirect to homepage if user logs out/tries to access unauthorised
// $(document).ready(function () {

//   firebase.auth().onAuthStateChanged(function (user) {

//     //if user is signed out, redirect to home page
//     if (!user) {
//       window.location.href = "index.html"
//     }

//   });

// });


function addUserEvent(eventID, userID)
{
  return new Promise(function(resolve, reject) {

      firebase.database().ref('users/' + userID).once("value").then(function(snapshot) {

          var eventsArr = snapshot.val().events.slice();  
          eventsArr.push(eventID);
          var userEmail = snapshot.val().userEmail;

          firebase.database().ref('users/' + userID).set({

              events: eventsArr,
              userEmail: userEmail

          });

          resolve();

      });

  });
};

function checkEvent(event)
{
  //function to check if the event that is going to be added to events collection is already in collection (i.e. there is an event already
  //in the events collection that has the same title, date, and start/end time) (that belong to current user)

  return new Promise(function(resolve, reject) {

    firebase.database().ref('events/').once("value").then(function(snapshot) {

      snapshot.forEach(function(data, index, array) {

          var importedEventTitle = event.summary;
          var eventTitle = data.val().eventTitle;

          var importedEventDate = event.start.dateTime.substr(0, 10);
          var eventDate = data.val().eventDate;

          var importedEventStart = event.start.dateTime.substr(11, 5);
          var eventStart = data.val().eventStartTime;

          var importedEventEnd = event.end.dateTime.substr(11, 5);
          var eventEnd = data.val().eventEndTime;

          if(importedEventTitle == eventTitle && importedEventDate == eventDate && importedEventStart == eventStart &&
            importedEventEnd == eventEnd)
          {
            reject("found a duplicate event from calendar");
          }
      });

      resolve("finished array");

    });

  });


}

// function addInvitedUsers(eventID) {

//   return new Promise(function(resolve, reject){ 

//   var invitedUsers;

//   firebase.database().ref('events/' + eventID).once("value").then(function(snapshot) {

//         invitedUsers = snapshot.val().invitedUsers.slice();

//         alert("invited user's email " + invitedUsers[1].email);

//         // if(invitedUsers !== "none")
//         // {

//         //   firebase.database().ref('users/').once("value").then(function(snapshot) {

//         //       snapshot.forEach(function(childSnapshot) {

//         //           var userEmail = childSnapshot.val().userEmail;
//         //           if(invitedUsers.indexOf(userEmail) >= 0)
//         //           {
//         //               //the userEmail is in the list of invited users, add the event to their collection

//         //               var userID = childSnapshot.key;
//         //               //get a copy of the events array that holds events belonging to user
//         //               var eventArray = childSnapshot.val().events.slice();

//         //                 // add this event to the collection of events for this user
//         //     if (eventArray[0] === "0") 
//         //     {
//         //       eventArray.shift();
//         //       eventArray.push(eventID);
//         //       updateEventsArray(eventArray, userEmail, userID);
//         //     }
//         //     else 
//         //     {
//         //       eventArray.push(eventID);
//         //       updateEventsArray(eventArray, userEmail, userID);
//         //     }

//         //           }

//         //       });

//         //   });
          
//         // }
//         // else
//         // {
//         //  alert("no invited users");
//         // }
//         resolve();

//       });

//     });

// };