var myInput = document.getElementById("password");
var letter = document.getElementById("letter");
var capital = document.getElementById("capital");
var number = document.getElementById("number");
var length = document.getElementById("length");

// When the user clicks on the password field, show the message box
myInput.onfocus = function () {
	document.getElementById("message").style.display = "block";
};

// When the user clicks outside of the password field, hide the message box
myInput.onblur = function () {
	document.getElementById("message").style.display = "none";
};

// When the user starts to type something inside the password field
myInput.onkeyup = function () {
	// Validate lowercase letters
	var lowerCaseLetters = /[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g;
	if (myInput.value.match(lowerCaseLetters)) {
		letter.classList.remove("invalid");
		letter.classList.add("valid");
	} else {
		letter.classList.remove("valid");
		letter.classList.add("invalid");
	}

	// Validate capital letters
	var upperCaseLetters = /[A-Z]/g;
	if (myInput.value.match(upperCaseLetters)) {
		capital.classList.remove("invalid");
		capital.classList.add("valid");
	} else {
		capital.classList.remove("valid");
		capital.classList.add("invalid");
	}

	// Validate numbers
	var numbers = /[0-9]/g;
	if (myInput.value.match(numbers)) {
		number.classList.remove("invalid");
		number.classList.add("valid");
	} else {
		number.classList.remove("valid");
		number.classList.add("invalid");
	}

	// Validate length
	if (myInput.value.length >= 8) {
		length.classList.remove("invalid");
		length.classList.add("valid");
	} else {
		length.classList.remove("valid");
		length.classList.add("invalid");
	}
};

var confirm_password = document.getElementById("confirm_password");
var match = document.getElementById("match");

// When the user clicks on the password field, show the message box
confirm_password.onfocus = function () {
	document.getElementById("message2").style.display = "block";
};

// When the user clicks outside of the password field, hide the message box
confirm_password.onblur = function () {
	document.getElementById("message2").style.display = "none";
};

// When the user starts to type something inside the password field
confirm_password.onkeyup = function () {
	// Validate lowercase letters
	if (myInput.value === confirm_password.value) {
		match.classList.remove("invalid-match");
		match.classList.add("valid");
	} else {
		match.classList.remove("valid");
		match.classList.add("invalid-match");
	}
};

var eye_icon = document.getElementById("eye-icon");
eye_icon.addEventListener("click", function () {
	var conf = document.getElementById("confirm_password");
	if (conf.type == "password") {
		conf.type = "text";
	} else {
		conf.type = "password";
	}
});
