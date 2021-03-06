
//handle user sign-up logic

$('.submit-signup-btn').on('click', function() {

	var userArray = $('.new-user-form').serializeArray();

	var firstName = userArray[0].value;

	var lastName = userArray[1].value;

	var email = userArray[2].value;
	
	var password = userArray[3].value;

	firebase.auth().createUserWithEmailAndPassword(email, password).then(function() {

			firebase.auth().onAuthStateChanged(function(user) {

				//user is signed  in
				if(user)
				{
					var eventsArray = new Array(0);
					eventsArray.push("0");

					firebase.database().ref('users/' + user.uid).set(
					{
						userEmail: user.email,
						events: eventsArray

					}).then(function() {

						user.updateProfile({

							displayName: (firstName + " " + lastName)

						}).then(function() {

							//return to homepage upon account creation
							setTimeout(function() {

								window.location.href="index.html";

							}, 1000);						

						});

					}).catch(function(error) {

						var errorMessage = error.message;

						alert("ERROR: " + errorMessage);

					});		

				}

			});
		}).catch(function(error) {

			 // Handle Errors here.
			 var errorMessage = error.message;
			 alert("ERROR: " + errorMessage);

		});	
});

$('.google-signin-btn').on('click', function() {

	firebase.auth().useDeviceLanguage();
	var provider = new firebase.auth.GoogleAuthProvider();

	firebase.auth().signInWithPopup(provider).then(function(result) {

		var token = result.credential.accessToken;

		var user = result.user;

		if(user)
		{
			var eventsArray = new Array(0);
			eventsArray.push("0");

			var userID = user.uid;

			firebase.database().ref('users/' + user.uid).set(
			{
				userEmail: user.email,
				events: eventsArray

			}).then(function() {

				//return to homepage upon account creation
				setTimeout(function() {

					window.location.href="index.html";

				}, 1000);	

			}).catch(function(error) {

				var errorMessage = error.message;

				alert("ERROR: " + errorMessage);

			});		

		}

	}).catch(function(error) {

	  // Handle Errors here.
	  var errorMessage = error.message;
	  // The email of the user's account used.
	  var email = error.email;
	  // The firebase.auth.AuthCredential type that was used.
	  var credential = error.credential;		

	  alert("Error: " + error.message);
	});

});

$('.fb-signin-btn').on('click', function() {

	firebase.auth().useDeviceLanguage();
	var provider = new firebase.auth.FacebookAuthProvider();

	firebase.auth().signInWithPopup(provider).then(function(result) {

		var token = result.credential.accessToken;

		var user = result.user;

		if(user)
		{
			var eventsArray = new Array(0);
			eventsArray.push("0");

			firebase.database().ref('users/' + user.uid).set(
			{
				userEmail: user.email,
				events: eventsArray

			}).then(function() {

				//return to homepage upon account creation
				setTimeout(function() {

					window.location.href="index.html";

				}, 1000);	

			}).catch(function(error) {

				var errorMessage = error.message;

				alert("ERROR: " + errorMessage);

			});		

		}

	}).catch(function(error) {

	  // Handle Errors here.
	  var errorMessage = error.message;
	  // The email of the user's account used.
	  var email = error.email;
	  // The firebase.auth.AuthCredential type that was used.
	  var credential = error.credential;		

	  alert("Error: " + error.message);
	});

});