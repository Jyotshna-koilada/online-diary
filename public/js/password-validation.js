const inputPassword = document.getElementById("inputPassword");
const confirmPassword = document.getElementById("confirmPassword");
const letter = document.getElementById("letter");
const capital = document.getElementById("capital");
const digit = document.getElementById("digit");
const noSpace = document.getElementById("no-space");
const hyphenUnderscore = document.getElementById("hyphen-underscore");
const length = document.getElementById("length");
const upperCaseLetters = /[A-Z]/g;
const lowerCaseLetters = /[a-z]/g;
const digits = /[0-9]/g;
const hyphenUnderscoreSet = /[-_]/g;

inputPassword.onfocus = () => {
  document.getElementById("passwordMessage").style.display = "block";
}
inputPassword.onblur = () => {
  document.getElementById("passwordMessage").style.display = "none";
}

function validToInvalid(element){
  element.classList.remove("valid");
  element.classList.add("invalid");
}
function invalidToValid(element){
  element.classList.remove("invalid");
  element.classList.add("valid");
}

inputPassword.onkeyup = () => {
  if(inputPassword.value.match(upperCaseLetters))
    invalidToValid(capital);
  else
    validToInvalid(capital);

  if(inputPassword.value.match(lowerCaseLetters))
    invalidToValid(letter);
  else
    validToInvalid(letter);

  if(inputPassword.value.match(digits))
    invalidToValid(digit);
  else
    validToInvalid(digit);

  if(inputPassword.value.includes(" "))
    validToInvalid(noSpace);
  else
    invalidToValid(noSpace);

  if(inputPassword.value.match(hyphenUnderscoreSet))
    invalidToValid(hyphenUnderscore);
  else
    validToInvalid(hyphenUnderscore);

  if(inputPassword.value.length >= 8 && inputPassword.value.length <= 15)
    invalidToValid(length);
  else
    validToInvalid(length);
}

confirmPassword.onkeyup = () => {
  if(inputPassword.value != confirmPassword.value)
    confirmPassword.setCustomValidity("Passwords don't match...");
  else
    confirmPassword.setCustomValidity("");
}
