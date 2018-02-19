


var userArray = new Array(0)

$('document').ready(function() {


});

//handle setup new event logic

//TO-DO: Handle required fields (data-required)
$('.setup-event-btn').on("click", function() {

	var eventTitle = $('#form-title').val();

	var eventLocation = $('#form-location').val();

	var eventTimezone = $('#form-timezone').val();

	var eventDescription = $('#form-desc').val();

	if(eventTitle === "" || eventLocation === "" || eventTimezone === "" || eventDescription === "")
	{
		alert("Please fill in the required fields");
	}
	else
	{
		createEvent();
	}

});

$('#form-add-attend-btn').on("click", function() {

	$('#inviteModal').css("display","block");

});

$('#closeBtn').on("click", function() {

	$('#inviteModal').css("display","none");

});

// use add button instead? 
$('.addUser').on('click', function(event) {

	event.preventDefault();

	var inviteEmail = $('#form-invitedUser').val();

	if(inviteEmail === "")
	{
		alert("Enter a valid email");
	}
	else
	{
		//create a list element of for each user to invite
		var newLi = document.createElement('li');

		newLi.setAttribute('id', 'invitedUser');

		document.getElementById('userList').appendChild(newLi);

		var newEmailSpan = document.createElement('span');

		newEmailSpan.setAttribute('class', 'userSpan');

		document.getElementById('invitedUser').appendChild(newEmailSpan);

		var newCloseSpan = document.createElement('span');

		newCloseSpan.setAttribute('class', 'closeSpan')

		document.getElementById('invitedUser').appendChild(newCloseSpan);

		newEmailSpan.innerHTML = inviteEmail;

		newCloseSpan.innerHTML = "&times;";

		newLi.removeAttribute('id');

		document.getElementById('form-invitedUser').value = "";

		userArray.push(inviteEmail);

		$('.closeSpan').on("click", function() {

			var pos = userArray.indexOf(inviteEmail);

			var removedItem = userArray.splice(pos, 1);

			$(this).parent().remove();

			//remove user from userArray

		});
	}

});


// $('.addUser').on('click', function(event) {

// 	event.preventDefault();

// 	var inviteEmail = $('#form-invitedUser').val();

// 	var newDiv = document.createElement('div');

// 	newDiv.setAttribute('id', 'invitedUser');

// 	newDiv.setAttribute('class', 'userListDiv');

// 	document.getElementById('userList').appendChild(newDiv);

// 	var newEmailSpan = document.createElement('span');

// 	newEmailSpan.setAttribute('class', 'userSpan');

// 	document.getElementById('invitedUser').appendChild(newEmailSpan);

// 	var newCloseSpan = document.createElement('span');

// 	newCloseSpan.setAttribute('class', 'closeSpan')

// 	document.getElementById('invitedUser').appendChild(newCloseSpan);

// 	newEmailSpan.innerHTML = inviteEmail;

// 	newCloseSpan.innerHTML = "&times;";

// 	userArray.push(inviteEmail);

// 	$('.closeSpan').on("click", function() {

// 	$(this).parent().remove();

// 	//remove user from userArray

// 	});

// });



// $('#form-invitedUser').on("keypress", function(event) {

// 	//13 is enter key
// 	if(key === 13)
// 	{
// 		var key = event.which || event.keyCode;

// 		var inviteEmail = $('#form-invitedUser').val();

// 		var newDiv = document.createElement('div');

// 		newDiv.setAttribute('class', 'invitedUser');

// 		document.getElementsByClassName("userList").appendChild(newDiv);

// 		var newUserSpan = document.createElement('span');

// 		document.getElementsByClassName("invitedUser").appendChild(newUserSpan);

// 		var newCloseSpan = document.createElement('span');

// 		newCloseSpan.setAttribute('class', 'closeSpan')

// 		document.getElementsByClassName("invitedUser").appendChild(newCloseSpan);

// 		newUserSpan.innerHTML = inviteEmail;

// 		newCloseSpan.innerHTML = "&times;";
// 	}

	

// 	// event.preventDefault();


// })

// When the user clicks anywhere outside of the modal, it should be closed
window.onclick = function(event) {
    if (event.target == document.getElementById('inviteModal')) 
    {
		$('#inviteModal').css("display","none");
    }
}

function createEvent()
{
	var i;

	//array to hold the checkboxes for repititions
	var repArray = new Array(0);

	// var eventArray = $('.event-form').serializeArray();

	// var eventTitle = eventArray[0].value;

	// var eventLocation = eventArray[1].value;

	// var eventTimezone = eventArray[2].value;

	// var eventDescription = eventArray[3].value;	

	var eventTitle = $('#form-title').val();

	var eventLocation = $('#form-location').val();

	var eventTimezone = $('#form-timezone').val();

	var eventDescription = $('#form-desc').val();

	var eventRepetition = document.querySelectorAll('.rep-box');

	for(i = 0; i < eventRepetition.length; i++)
	{
		if(eventRepetition[i].checked)
		{
			repArray.push(eventRepetition[i].value);
		}
	}

	var repFrequency = $('#rep').val();

	var eventReminders = $('#form-reminders').val();

	var privacyValue = $('#privacy').val();

	var eventID = generateToken();

	//get participants (invited people)
	writeUserData(eventID, eventTitle, eventLocation, eventTimezone, 
		eventDescription, repArray, repFrequency, eventReminders, 
		privacyValue, userArray);		

};

//take form data and create a JSON object of all the data and
//upload to firebase database /eventss
function writeUserData(eI, eT, eL, eTz, eD, rA, rF, eR, pV, iA) {
	//set() overwrites data at the specified location (here events/eventID)
	firebase.auth().onAuthStateChanged(function(user) {

		if(user)
		{
			//user is signed in
			firebase.database().ref('events/' + eI).set(
			{
				eventOwner: firebase.auth().currentUser.displayName,
				eventOwnerEmail: firebase.auth().currentUser.email,
				eventID: eI,
				eventTitle: eT,
				eventLocation: eL,
				eventTimezone: eTz,
				eventDescription: eD, 
				repetitionaDaysArray: rA, 
				repetitionFrequency: rF, 
				eventReminders: eR,
				privacySetting: pV, 
				invitedUsers: iA

			}).then(function() {

				alert("Event created successfully!");

				window.location.href = "index.html"

			}).catch(function(error) {

				var errorMessage = error.message;

				alert("ERROR: " + errorMessage);

			});		
		}
		else
		{
			//user is not signed in
			alert("ERROR: Must be logged in to setup a new event");
		}

	});

}	

function rand() {

    return Math.random().toString(36).substr(2); // remove `0.`

};

function generateToken() {

    return rand() + rand(); // to make it longer

};

//redirect to homepage if user logs out/tries to access unauthorised
// $(document).ready(function()
// {

  firebase.auth().onAuthStateChanged(function(user) {

    //if user is signed out, redirect to home page
    if(!user)
    {
      window.location.href = "index.html"
    }

  });

// });