function validateForm(event) {
  // stops the default behavior of the form to prevent the page from refreshing and not displaying the error messages
  if (event) event.preventDefault();

    // gets all the user inputs from the form
    const cardNumber = document.forms["cardDetails"]["card-number"].value;
    const securityCode = document.forms["cardDetails"]["security-code"].value;
    let monthInput = document.forms["cardDetails"]["exp-month"].value;
    let yearInput = document.forms["cardDetails"]["exp-year"].value;

    let messages = []; // array used for storing messages for the user

    // gets the id for the error message element
    let errorElement = document.getElementById('error-message');

    // validation for all user inputs
    validateCardNumber(cardNumber, messages);
    validateExpirationDate(yearInput,monthInput,messages);
    validateSecurityCode(securityCode, messages);

    // validation returns an error message
    if (messages.length > 0){
      errorElement.innerText = messages.join(', ');
    }

    // if all validation passes without an error message being added to the array
    if (messages.length == 0){
      sessionStorage.setItem("cardNumber", cardNumber); // stores card number in a session variable to use of the success page;

      // formats the dataset to be sent to the api
      const payload = {
        master_card: Number(cardNumber),
        exp_year: Number(yearInput),
        exp_month: Number(monthInput),
        cvv_code: securityCode
      };

      sendRequest(payload,errorElement);


      // for testing to make sure send request returns
      //alert("Returned the Send Request!");

    }
}

// checks card number for errorful input
function validateCardNumber(cardNumber,messages){

  const cardPrefix = ["51","52","53","54","55"]; // declares the suitable prefixes for a card number

  // check card number was not left empty
  if (cardNumber == ""){
    messages.push("Card Number cannot be left empty")
    // card number being empty means other validation is not required
    return false; // returns the form immediately
  }

  // card number only contains numbers
  if(!/^\d+$/.test(cardNumber)){
    messages.push("Card Number must contain only digits")
  }

  // verifies the length of the card number
  if (cardNumber.length != 16) {
    //alert("Invalid Card Number Length.");
    messages.push("Card Number is not 16 digits long");
  }

  // card number does not begin witht he suitables digits
  if (!cardPrefix.some(prefix => cardNumber.startsWith(prefix))) {
    //alert("Card Number does not include suitable prefix.");
    messages.push("Card Number does not include suitable prefix");
  }

}

// checks expiration date for errorful input
function validateExpirationDate(yearInput, monthInput, messages){

  // current dates variables for comparison
  const today = new Date();
  const year_now = today.getFullYear();
  const month_now = (today.getMonth()+1);

  // parse to integers for validation
  monthInput = parseInt(monthInput);
  yearInput = parseInt(yearInput);

  // checks that the year and month input are both numbers and were not left on the placeholders ("MM", "YY")
  if (!Number.isInteger(yearInput) || !Number.isInteger(monthInput)){
    messages.push("A month and year must be selected");
    return false; 
  }

  // year inputted was in the past
  if(yearInput < year_now){
    messages.push("card has expired");
  }

  if(yearInput == year_now){ // year is the same as current
    if (monthInput < month_now){ // month is in the past
      messages.push("card has expired");
    }
  }

}

// checks security code for errorful input
function validateSecurityCode(securityCode, messages){
  // checks the secuirty code is valid length
  if (securityCode.length < 3 || securityCode.length > 4){
    messages.push("CVV/Security Code must be 3 or 4 digits!");
  } 
}


function sendRequest(payload, errorElement) {

  //testing
  //displayDetails(payload);

  fetch("https://mudfoot.doc.stu.mmu.ac.uk/node/api/creditcard", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    })

    // api call returns fail
    .then(response => {
      if (response.status === 200) {
        return response.json();
      } else {
        throw new Error("Server returned status: " + response.status);
      }
    })

    // api call returns success
    .then(result => {
      console.log("API success response:", result);
      //alert("API response OK!\n" + JSON.stringify(result, null, 2));

      // relocate to success page
      window.location.replace("/success.html");

    })

    // unknown error occurs
    .catch(error => {
      console.error("Error:", error);
      //alert("Something went wrong:\n" + error.message);
      errorElement.innerText = ("Something went wrong:\n" + error.message);
    });
    
}
  
  // for testing purposes only
  // outputs the payloads data types
  function displayDetails(payload){
    alert(`
        master_card: ${typeof(payload.master_card)}
        exp_year:    ${typeof(payload.exp_year)}
        exp_month:   ${typeof(payload.exp_month)}
        cvv_code:    ${typeof(payload.cvv_code)}
      `);
      return;
  }

  // navbar icon functionality
  function responsiveNavbar(){
    let responsiveNavbar = document.getElementById("responsiveNavbar");
    let navbarIcon = document.getElementById("navbarIcon");
    if (responsiveNavbar.className === "responsive-navbar") {
      responsiveNavbar.className += " show";
      navbarIcon.className += " active";
    } else {
      responsiveNavbar.className = "responsive-navbar";
      navbarIcon.className = "nav-icon"
    }

  }
 
  // finds the last 4 digits of the card number
  function finalDigits(){
    let storedValue = sessionStorage.getItem("cardNumber"); // puts the full card number into a variable
    storedValue = storedValue.substring(12,16); // finds the last 4 digits 
    document.getElementById("card-final-digits").innerHTML = "**** **** **** "+storedValue;
  }
