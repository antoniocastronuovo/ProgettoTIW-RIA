"use strict";
/**

 *  The 3 teacher modals
 */

 function SingleGradeModal(_orchestrator, _gradeModal) {
    this.orchestrator = _orchestrator;
    this.gradeModal = _gradeModal;

    this.show = function(courseId, examDate, studentPC) {
        //Display the container
        var self = this;
        //Retrieve the list of grades with AJAX
        makeCall("GET", "GetTeacherGradeDetails?courseId="+courseId+"&date="+examDate+":00.0&personCode=" + studentPC, null,
            
        function(req) {
                if(req.readyState == 4) {
                    var gradeJson = req.responseText; //Get the Json list
                    if(req.status == 200) { //if response is successful
                        //Hide alerts
                        document.querySelector("#gradeModal #gradeError").style.display = "none"; 
                        document.querySelector("#gradeModal #gradeSuccess").style.display = "none";
                        
                        var gradeToShow = JSON.parse(gradeJson); //parse the list
                        if(gradeToShow == null) {
                            errorAlert.textContent = "Impossibile visualizzare il voto richiesto";
                            errorAlert.style.display = "block";
                            return;
                        }
                        self.update(gradeToShow); //self is visible by the closure
                    }
                }
            }
        );
    }

    this.update = function(gradeData) {
        var fullName = document.querySelector("#gradeModal #fullName");
        fullName.textContent = gradeData.student.firstName + " " + gradeData.student.lastName;
        var personCode = document.querySelector("#gradeModal #pc");
        personCode.textContent = gradeData.student.personCode;
        var mail = document.querySelector("#gradeModal #mail");
        mail.textContent = gradeData.student.email;
        var matricola = document.querySelector("#gradeModal #matricola");
        matricola.textContent = gradeData.student.matricola;
        var courseName = document.querySelector("#gradeModal #courseName");
        courseName.textContent = gradeData.examSession.course.name;
        var data = document.querySelector("#gradeModal #examDate");
        data.textContent = gradeData.examSession.dateTime;
        var gradeStatus = document.querySelector("#gradeModal #gradeStatus");
        gradeStatus.textContent = gradeData.gradeStatus;
        //Set form hidden field values
        document.querySelector("#gradeModal #personCodeHidden").value = gradeData.student.personCode;
        document.querySelector("#gradeModal #examDateHidden").value = gradeData.examSession.dateTime + ":00.0";
        document.querySelector("#gradeModal #courseHidden").value = gradeData.examSession.course.courseID;

        var gradeConfirmed = document.querySelector("#gradeModal #gradeConfirmed");
        var gradeSelect = document.querySelector("#gradeModal #gradeSelect");
        var changeBtn = document.querySelector("#gradeModal #changeGradeBtn");
        if(gradeData.gradeStatus == "NON INSERITO" || gradeData.gradeStatus == "INSERITO") {
            gradeConfirmed.style.display = "none";
            gradeSelect.style.display = "block";
            document.querySelector("#gradeModal #selectedGrade").textContent = getGradeAsString(gradeData.grade, gradeData.laude);
            document.querySelector("#gradeModal #selectedGrade").value = getGradeValue(gradeData.grade, gradeData.laude);
            changeBtn.style.display = "block";
            
        }else{
            gradeConfirmed.style.display = "block";
            gradeConfirmed.textContent = getGradeAsString(gradeData.grade, gradeData.laude);
            gradeSelect.style.display = "none";
            changeBtn.style.display = "none";
        }
        //finally show the modal
        this.gradeModal.style.display = "block";
    }
    
    this.reset = function() {
        this.gradeModal.style.display = "none";
    }
    
    this.registerEventListeners = function() {
    	var self = this;
        var gradeSelect = document.querySelector("#gradeModal #gradeSelect");
        var errorAlert = document.querySelector("#gradeModal #gradeError");
        var successAlert = document.querySelector("#gradeModal #gradeSuccess");
        var defaultSelected = document.querySelector("#gradeModal #selectedGrade");
        var gradeStatus = document.querySelector("#gradeModal #gradeStatus");

        var changeBtn = document.querySelector("#gradeModal #changeGradeBtn");        
        changeBtn.addEventListener("click", (e) => {
            makeCall("POST", "EditStudentGrade", e.target.closest("form"),
	            function(req) {
	                if(req.readyState == 4) {
	                    
	                    if(req.status == 200) { //if response is successful
	                        var newGrade = JSON.parse(req.responseText); //Get the Json list
	                        successAlert.textContent = "Voto aggiornato correttamente a " + getGradeAsString(newGrade.grade, newGrade.laude);
	                        successAlert.style.display = "block";
	                        errorAlert.style.display = "none";
	                        //Update select
	                        gradeSelect.selectedIndex = 0;
	                        defaultSelected.textContent = getGradeAsString(newGrade.grade, newGrade.laude);
	                        defaultSelected.value = getGradeValue(newGrade.grade, newGrade.laude);
	                        //Update grade status
	                        gradeStatus.textContent = newGrade.gradeStatus;
	                        //Updates grade list
	                        self.orchestrator.refreshGradesList(newGrade.examSession.course.courseID, newGrade.examSession.dateTime);
	                    }else{
	                        successAlert.style.display = "none";
	                        errorAlert.textContent = req.responseText;
	                        errorAlert.style.display = "block";
	                    }
	                }
	            }, false);
	        }, false);
        
      //Add listeners to close buttons
        var xBtn = document.querySelector("#gradeModal #xBtn");
        xBtn.addEventListener("click", (e) => {
        	self.reset();
        }, false);

        var closeBtn = document.querySelector("#gradeModal #closeBtn");
        closeBtn.addEventListener("click", (e) => {
            self.reset();
        }, false);
    }
}

function InsertGradesModal(_orchestrator, _insertModal) {
    this.orchestrator = _orchestrator;
    this.insertModal = _insertModal;

    this.show = function(courseId, examDate) {
        //Display the container
        var self = this;
        //Retrieve the list of grades with AJAX
        makeCall("GET", "GetExamGradesData?courseId="+courseId+"&date="+examDate+":00.0", null,
            function(req) {
                if(req.readyState == 4) {
                    var gradesListJson = req.responseText; //Get the Json list
                    if(req.status == 200) { //if response is successful
                        var gradesToShow = JSON.parse(gradesListJson); //parse the list
                        
                        //Filter the grades with status 'NON INSERITO'
                        gradesToShow = gradesToShow.filter(grade => grade.gradeStatus === "NON INSERITO");
                        self.update(courseId, examDate, gradesToShow); //self is visible by the closure
                    }
                }
            }
        );
    }

    this.update = function(courseId, examDate, gradesData) {
        //Hide the progress bar
        var progressDiv = document.querySelector("#insertModal #progressSection");
        progressDiv.style.visibility = "hidden";
        //If grades are present, display the table
        var table = document.querySelector("#insertModal #insertGradesTable");
        var alert = document.querySelector("#insertModal #noGradesAlert");
        var errorAlert = document.querySelector("#insertModal #errorGradesAlert");
        var insertBtn = document.querySelector("#insertModal #sendGradesBtn");
        if(gradesData.length == 0) {
             table.style.display = "none";
             alert.style.display = "block";
             insertBtn.style.display = "none";
             return;
        }else{
            alert.style.display = "none";
            insertBtn.style.display = "inline";
            var row, matricola, lastName, firstName, email, degree, evaluation, status, option;
            var list = document.querySelector("#insertModal #insertList");
            var self = this;
            list.innerHTML = ""; //empty the list
            gradesData.forEach(gr => {
                row = document.createElement("tr");
                row.setAttribute("personCode", gr.student.personCode);
                row.setAttribute("courseId", courseId);
                row.setAttribute("examDate", examDate);
                //Create matricola table column
                matricola = document.createElement("td");
                matricola.textContent = gr.student.matricola;
                row.appendChild(matricola);
                //Create last name table column
                lastName = document.createElement("td");
                lastName.textContent = gr.student.lastName;
                row.appendChild(lastName);
                //Create fistname table column
                firstName = document.createElement("td");
                firstName.textContent = gr.student.firstName;
                row.appendChild(firstName);
                //Create email table column
                email = document.createElement("td");
                email.textContent = gr.student.email;
                row.appendChild(email);
                //Create degree table column
                degree = document.createElement("td");
                degree.textContent = gr.student.degreeCourse.name;
                row.appendChild(degree);
                //Create select evalutation table column
                evaluation = document.createElement("td");
                row.appendChild(evaluation);
                //Create and append select list
                var selectList = document.createElement("select");
                selectList.className = "custom-select";
                selectList.id = "selectGrade";
                evaluation.appendChild(selectList);
                //Create and append the options
                option = document.createElement("option");
                option.value = -3;
                option.text = "ASSENTE";
                selectList.appendChild(option);
                selectList.name = "grade";
                option = document.createElement("option");
                option.value = -2;
                option.text = "RIMANDATO";
                selectList.appendChild(option);
                option = document.createElement("option");
                option.value = -1;
                option.text = "RIPROVATO";
                selectList.appendChild(option);
                for (var i = 18; i <= 30; i++) {
                    option = document.createElement("option");
                    option.value = i;
                    option.text = i;
                    selectList.appendChild(option);
                }
                option = document.createElement("option");
                option.value = 31;
                option.text = "30L";
                selectList.appendChild(option);
                //Create status table column
                status = document.createElement("td");
                status.textContent = gr.gradeStatus;
                status.className = "table-warning text-center";
                row.appendChild(status);
                //Append the row
                list.appendChild(row);
            });
            
            
            
        }
        
        //Show the modal
        this.insertModal.style.display = "block";
    }
    
    this.registerEventListeners = function() {
    	//Create insert button
        var self = this;
        
        var insertBtn = document.querySelector("#insertModal #sendGradesBtn");
    	insertBtn.addEventListener("click", (e) => {
            //Set listener to send button
            var alert = document.querySelector("#insertModal #noGradesAlert");
            var progressDiv = document.querySelector("#insertModal #progressSection");
            progressDiv.style.visibility = "visible";
            var progressBar = document.querySelector("#insertModal #progressBar");
            var list = document.querySelector("#insertModal #insertList");
            var rows = list.rows;
            var errorAlert = document.querySelector("#insertModal #errorGradesAlert");
            
            progressBar.textContent = "0 di " + (rows.length + 1) + " voti inseriti";
            var errors = 0;
            for(let i = 0; i < rows.length; i++) {
                var formData = new FormData();
                formData.append("course", rows[i].getAttribute("courseId"));
                formData.append("date", rows[i].getAttribute("examDate")+":00.0");
                formData.append("grade", rows[i].childNodes[5].firstChild.value);
                formData.append("personCode", rows[i].getAttribute("personCode"));
                //AJAX call to Edit student grade
                makeCall2("POST", "EditStudentGrade", formData,
                function(req) {
                    if(req.readyState == 4) {
                        if(req.status == 200) { //if response is successful
                            progressBar.textContent = (i + 1) +" di " + (rows.length) + " voti inseriti";
                            progressBar.style.width = (((i + 1) / rows.length) * 100) + "%";
                            if(i + 1 === rows.length) { //all grades are inserted
                                //updates grade list and modal
                                self.orchestrator.refreshGradesList(rows[i].getAttribute("courseId"), rows[i].getAttribute("examDate"));
                                setTimeout(function(){ self.show(rows[i].getAttribute("courseId"), rows[i].getAttribute("examDate")); }, 1000);
                                if(errors > 0) {
                                	errorAlert.style.display = "block";
                                	setTimeout(function(){ errorAlert.style.display = "none"; }, 3000);
                                }
                            }
                        }else{
                            errors++;
                        }
                    }
                });
            }
        }, false);
    	
    	//Add listeners to close buttons
        var xBtn = document.querySelector("#insertModal #insertXBtn");
        xBtn.addEventListener("click", (e) => {
            self.reset();
        }, false);
        //Set listener to close button
        var closeBtn = document.querySelector("#insertModal #insertCloseBtn");
        closeBtn.addEventListener("click", (e) => {
            self.reset();
        }, false);
    }
    
    this.reset = function() {
        this.insertModal.style.display = "none";
    }
}

function ReportModal(_reportModal,_bodyModalReport) {
    this.reportModal=_reportModal;
    this.bodyModalReport=_bodyModalReport;

    this.show = function(reportId,dateTime){
        //Display the container
        var self = this;
        //Retrieve the list of grades into the report
        makeCall("GET", "GetExamReport?reportId="+reportId, null,
            function(req) {
                if(req.readyState == 4) {
                    var reportJson = req.responseText; //Get the Json list
                    if(req.status == 200) { //if response is successful
                        var gradesToShow = JSON.parse(reportJson); //parse the list
                        if(gradesToShow.length == 0) {
                            self.errorAlert.textContent = "Impossibile visualizzare il verbale richiesto";
                            self.errorAlert.style.display = "block";
                            return;
                        }
                        self.update(gradesToShow,dateTime);
                    }
                }
            }
        );
    }

    this.update = function (gradesData,dateTime){
        var row,matricola,lastName,firstName,email,degreeCourse,grade;
        this.bodyModalReport.innerHTML = ""; //empty the table body
         //build updated list
        this.reportModal.style.display = "block";
        
        gradesData.forEach(gradeData => {
            row = document.createElement("tr");
            matricola = document.createElement("td");
            matricola.textContent = gradeData.student.matricola;
            lastName = document.createElement("td");
            lastName.textContent = gradeData.student.lastName;
            firstName = document.createElement("td");
            firstName.textContent = gradeData.student.firstName;
            email = document.createElement("td");
            email.textContent = gradeData.student.email;
            degreeCourse = document.createElement("td");
            degreeCourse.textContent = gradeData.student.degreeCourse.name;
            grade = document.createElement("td");
            grade.textContent = getGradeAsString(gradeData.grade, gradeData.laude);
            row.appendChild(matricola);
            row.appendChild(lastName);
            row.appendChild(firstName);
            row.appendChild(email);
            row.appendChild(degreeCourse);
            row.appendChild(grade);
            self.bodyModalReport.appendChild(row);
            var title = document.getElementById("reportTitle");
            title.textContent = "Verbale di " + gradeData.examSession.course.name + " - " + gradeData.examSession.dateTime;
            var subTitle = document.getElementById("reportSubTitle");
            subTitle.textContent = "Data di Verbalizzazione: " + dateTime;
        })
    }

    this.reset = function() {
        this.reportModal.style.display = "none";
    }
    
    this.registerEventListeners = function() {
    	var self = this;
    	
    	 var closeButton = document.querySelector("#reportModal #closeBtn");
         closeButton.addEventListener("click", (e) => {
             self.reset();
         });
         var xBtn = document.querySelector("#reportModal #xBtn");
         xBtn.addEventListener("click" , (e) => {
             self.reset();
         });
    }
}