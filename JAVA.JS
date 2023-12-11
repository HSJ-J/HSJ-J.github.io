function check() {
  var password = document.getElementById("password").value;
  var confirm = document.getElementById("confirm").value;

  if (password.length >= 6) {
    if (password.search("!") >= 0) {
      if (password == confirm) {
        window.location.href = "HOME PAGE.html";
      } else {
        document.getElementById("error").innerHTML =
          "two password is inconsistent";
      }
    } else {
      document.getElementById("error").innerHTML = "missing !";
    }
  } else {
    document.getElementById("error").innerHTML = "less than 6 digits";
  }
}

function myfunction1() {
  var x = prompt("Which country has the largest land area in the world");
  if (x.search("Russia") >= 0) {
    document.getElementById("new").innerHTML = "correct";
  } else {
    document.getElementById("new").innerHTML = "wrong";
  }
}
