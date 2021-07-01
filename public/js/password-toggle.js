function togglePasswordVisibility(icon, inputBox){
  var element = document.getElementById(inputBox);

  if (element.type === "password"){
    element.type = "text";
    icon.classList.remove("fa-eye");
    icon.classList.add("fa-eye-slash");
  }
  else{
    element.type = "password";
    icon.classList.remove("fa-eye-slash");
    icon.classList.add("fa-eye");
  }
}
