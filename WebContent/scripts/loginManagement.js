"use strict";

/**
 * Login management
 */

(function() { //avoid variables ending up in the global scope
	document.getElementById("loginButton").addEventListener('click', (e) => {
		//Get the closest form
		var form = e.target.closest("form");
		var errorAlert = document.getElementById("errorMessage");
		if(form.checkValidity()) { //check the non-emptyness of the login form
			// AJAX Call to check the credentials
			makeCall("POST", 'CheckLogin', e.target.closest("form"), 
				function(req) {
					if (req.readyState == XMLHttpRequest.DONE) {
			            if(req.status == 200){
							var loginResponse = JSON.parse(req.responseText);
			            	if(loginResponse.login == "ko") {
								// Credentials are not ok
								errorAlert.textContent = loginResponse.message;
			          	  		errorAlert.style.display = "block";		
							}else{
								sessionStorage.setItem('user', loginResponse.fullName);
								if(loginResponse.role === "teacher"){
									// redirect to teacher page
									window.location.href = "TeacherHome.html";
								}else{
									// redirect to student page
									window.location.href = "StudentHome.html";
								}
							}
			            }else{
							//DB not connected
							errorAlert.textContent = "Non riesco a connettermi al database.";
			          	  	errorAlert.style.display = "block";
						}	               
					}
				}
			);
		}else{
			form.reportValidity();
		}
	});
})();