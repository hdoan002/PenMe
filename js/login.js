
//handle user login logic
$('.submit-login-btn').on("click", function() {

	var userArray = $('.login-form').serializeArray();

	var email = userArray[0].value;

	var password = userArray[1].value;

	firebase.auth().signInWithEmailAndPassword(email, password).then(function() {

		firebase.auth().onAuthStateChanged(function(user){

			if(user)
			{
				//user is signed in 
				setTimeout(function() {

					window.location.href="index.html";

				}, 500);					
			}

		});

	}).catch(function(error) {
		
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
			setTimeout(function() {

				window.location.href="index.html";

			}, 500);						
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
			setTimeout(function() {

				window.location.href="index.html";

			}, 500);						
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