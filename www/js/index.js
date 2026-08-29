/* Attaching event listner with the buttons to trigger functions  */

document.addEventListener('DOMContentLoaded', function() {
    var loginButton = document.getElementById("loginButton");
    if(loginButton) {
    	loginButton.addEventListener("click", loginUser);
    }
    var dataButton = document.getElementById("dataButton");
	if (dataButton) {
       dataButton.addEventListener("click", getBankData);
    }
    var signOutButton = document.getElementById("signOutButton");
    if (signOutButton) {
        signOutButton.addEventListener("click", signOut);
    }
});





/* Global variable is created to reuse stored token value for authorization in function calls */

var globalToken;


/* Global variable to hide and make back to home button visible */
let isButtonVisible = false;



function showBackToHomeButton() {
    if (isButtonVisible == true) {
        document.getElementById('homeButton').style.display = 'inline-block'; 
    }
}


function hideHomeButton(){
	document.getElementById('homeButton').style.display = 'none';
	window.location = 'data.html';
}
//////////////////////////
/* Login Function code  */
//////////////////////////


function loginUser(){

	var userName,password;
	userName = document.getElementById("uname").value;
	password = document.getElementById("pwd").value;

	/* Exception handling for the login errors using if-else statements */

	if (userName === '' && password === '') {
            document.getElementById("loginResponse").innerHTML = "Username and Password is empty";
            return;
    }else if (userName === '') {
            document.getElementById("loginResponse").innerHTML = "Username is empty";
            return;
    }else if(password === '') {
    	 document.getElementById("loginResponse").innerHTML = "Password is empty";
            return;
    }
    else{					
		

	$.ajax({
			url: "https://apisandbox.openbankproject.com/my/logins/direct",
			type: "POST",
			dataType:"json",
			crossDomain: true,
			cache: false,
			contentType:"application/json; charset=utf-8",

			
			beforeSend: function(xhr) {			
			xhr.setRequestHeader("Authorization", 'DirectLogin username="' + userName + '\", password="' + password + '\", 	consumer_key="fndg0ikkn5ri1dvosfwlh1o15m1o0yezof25dqmp"');
			},

			success: function( data, textStatus, jQxhr ){
			console.log("Login Successful");
			console.log(data);
			
			/* Storing token value in global variable received in login response */
			globalToken = data.token; 
			
			/* Value of token stored in the local storage which can be retrieved to be used later */
			localStorage.setItem('userToken', globalToken);
			
			/* Redirecting user to data.html page */
			window.location = 'data.html'; 
			},
			error: function( jqXhr, textStatus, errorThrown ){
			console.log("in error");
			document.getElementById("loginResponse").innerHTML = "Login Failure";
			return;
			}
           });
        }
}


/////////////////////////////////////////////////
/* getBankAccountsTransactions function code   */
/////////////////////////////////////////////////



/* Function to insert transactions data in table */

function appendTransactionsRow(bank){

$("#tableBody").append("<tr><td>" + bank.id + "</td><td>" + bank.this_account.id + "</td><td>" + bank.other_account.id + "</td><td>" + bank.details.description + "</td><td>" + bank.details.value.amount + "</td></tr>");
}



/* Function to fetch transactions against requested account */

function accountTransactions(id,bank_id) {
console.log("ID: "+id);
console.log("Bank ID: "+bank_id);
getbankaccountstransactions(id,bank_id);
}


function getbankaccountstransactions(id,bank_id) 
{

		/* Retrieving token stored in local storage */
		var storedToken = localStorage.getItem('userToken');
		console.log("fetching accounts transactions");
		var APIURL = "https://apisandbox.openbankproject.com/obp/v4.0.0/my/banks/" + id + "/accounts/" + bank_id + "/transactions"
		console.log(APIURL);
		console.log("in get accounts transactions");

		/* Making backHome button visible */
		isButtonVisible = true;
		
		/* calling function to make backHome button visible */
		showBackToHomeButton();

		$.ajax({
				
				url: APIURL,
				type: "GET",
				dataType:"json",
				crossDomain: true,
				cache: true,
				contentType:"application/json; charset=utf-8",
						
						
				beforeSend: function(xhr) {
				xhr.setRequestHeader("Authorization", 'DirectLogin token=' + storedToken);
				},
				
				success: function( data, textStatus, jQxhr ){
				console.log("In account transaction");
				console.log(data);

				/* Clear tablebody and tablehead to dynamically insert new data received in getbankaccountstransactions response */
				$("#tableBody").html("");
				$("#tableHead").html("");
				$("#tableHead").append("<tr><th>Transaction_ID</th><th>From_Account</th><th>to_Account</th><th>Description</th><th>Amount</th></tr>");
						
				/* Give alert to user if no transactions found in the account else insert data into the table*/
				if (data.transactions.length === 0) 
				{
  			  		alert("No Transactions Exists in the account press ok to continue");
  			  		getAccounts(id);
				} 
				else 
				{
					data.transactions.forEach(appendTransactionsRow);
				}
				},
				
				error: function( jqXhr, textStatus, errorThrown )
				{
					console.log("in error");
					document.getElementById("fetchData").innerHTML = "Account Transaction Query Failed";
				}
    		    });

}




////////////////////////////////////
/* getBankAccounts function code  */
////////////////////////////////////


/* Function to insert available accounts data in table */

function appendAccountsRow(bank){

$("#tableBody").append("<tr><td>" + bank.bank_id + "</td><td>" + bank.id + "</td><td>" + bank.label + "</td><td><button onclick=\"accountTransactions('" + bank.bank_id + "', '" + bank.id + "')\">Get Transactions</button></td></tr>");
}


/* Function to fetch bank accounts */

function outputBankAccounts(BankId) {
console.log("Bank ID: "+ BankId);
getAccounts(BankId);
}



function getAccounts(BankId){
		
		/* Retrieving token stored in local storage */
		var storedToken = localStorage.getItem('userToken');
		console.log("fetching accounts");
		var APIURL = "https://apisandbox.openbankproject.com/obp/v4.0.0/banks/" + BankId + "/accounts"
		console.log(APIURL);

		/* Making backHome button visible */
		isButtonVisible = true;

		/* calling function to make backHome button visible */
		showBackToHomeButton();
		
		$.ajax({
				url: APIURL,
				type: "GET",
				dataType:"json",
				crossDomain: true,
				cache: true,
				contentType:"application/json; charset=utf-8",
				
				
				beforeSend: function(xhr) {
				xhr.setRequestHeader("Authorization", 'DirectLogin token=' + storedToken);
				},
				
				success: function( data, textStatus, jQxhr ){
				console.log("in account transaction success");
				console.log(data);

				/* Clear tablebody and tablehead to dynamically insert new data received in getAccounts response */
				$("#tableBody").html("");
				$("#tableHead").html("");
				$("#tableHead").append("<tr><th>Bank_ID</th><th>Account_ID</th><th>Label</th><th>Action</th></tr>");

				/* Give alert to user if no accounts found in the bank else insert data into the table*/
				if (data.length === 0) 
				{
  			    	alert("No Account Exists press ok to continue");
  			    	getBankData();
				} 
				else 
				{
					data.forEach(appendAccountsRow);
			    }
				},
				error: function( jqXhr, textStatus, errorThrown ){
				console.log("in error");
				document.getElementById("tableBody").innerHTML = "Account Query Failed";
		}

	});
}



/////////////////////////////
/* getBanks function code  */
/////////////////////////////


/* Function to insert available banks data in table */


function appendRow(bank){
$("#tableBody").append("<tr><td>" + bank.full_name + "</td><td>" + bank.id + "</td><td><a href='" + bank.website + "' target='_blank'>" + bank.website + "</a></td><td><button onclick=\"outputBankAccounts('" + bank.id + "')\">Get Accounts</button></td></tr>");

}


/* Function to fetch banks */

function getBankData() {

			/* Retrieving token stored in local storage */
			var storedToken = localStorage.getItem('userToken');
			console.log("in get data");
			
			$.ajax({
					url: "https://apisandbox.openbankproject.com/obp/v4.0.0/banks",
					type: "GET",
					dataType:"json",
					crossDomain: true,
					cache: false,
					contentType:"application/json; charset=utf-8",
			
			
					beforeSend: function(xhr) {
					xhr.setRequestHeader("Authorization", 'DirectLogin token=' + storedToken);
					xhr.setRequestHeader("Cache-Control", "no-cache, no-store, max-age=0");
					},
					
					success: function( data, textStatus, jQxhr ){
					console.log("in success");
					console.log(data);
		
					/* Clear tablebody and tablehead to dynamically insert new data received in getBankData response */
					$("#tableBody").html("");
					$("#tableHead").html("");
					$("#tableHead").append("<tr><th>Bank_Name</th><th>Bank_Id</th><th>Website</th><th>Action</th></tr>");
					data.banks.forEach(appendRow);
					},
					error: function( jqXhr, textStatus, errorThrown ){
					console.log("in error");
					document.getElementById("fetchData").innerHTML = "Query Failed";
					}
			
	  				});

}


/////////////////////////////
/* signOut function code  */
/////////////////////////////

function signOut() { 

	/* Removing stored token from the local storage */
    localStorage.removeItem('userToken');

    /* Removing token stored in global variable */    
    globalToken = null; 
    
    /* Redirecting user to login page on signout */
    window.location = 'index.html';
}