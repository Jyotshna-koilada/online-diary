const form = document.getElementById("form");

const formEvent = form.addEventListener("submit", (event) => {
  event.preventDefault();
  let mail = new FormData(form);
  sendMail(mail);
});

const sendMail = (mail) => {
  fetch("https://localhost:3000/contact", {
    method: "post",
    body: mail,
  }).then((response) => {
    return response.json();
  });
};
