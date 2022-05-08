"use strict";

function GradesList(_orchestrator, _coursesList, _container, _title, _errorAlert, _successAlert, _list, _multipleInsertionBtn, _publishBtn, _reportBtn) {
    this.orchestrator = _orchestrator; //the page orchestrator
    this.coursesList = _coursesList; //list of courses
    this.container = _container; //the div containing the grades list
    this.title = _title; //the card title
    this.errorAlert = _errorAlert; //the error alert
    this.successAlert = _successAlert; //the green alert
    this.list = _list; //the grades list
    this.multipleInsertionBtn = _multipleInsertionBtn; //the insertion button
    this.publishBtn = _publishBtn; //the publish button
    this.reportBtn = _reportBtn; //the report button
    
    this.show = function(courseId, examDate) {
        var self = this;
        //Retrieve the list of grades with AJAX
        makeCall("GET", "GetExamGradesData?courseId="+courseId+"&date="+examDate+":00.0", null,
            function(req) {
                if(req.readyState == 4) {
                    var gradesListJson = req.responseText; //Get the Json list
                    if(req.status == 200) { //if response is successful
                        var gradesToShow = JSON.parse(gradesListJson); //parse the list
                        if(gradesToShow.length == 0) {
                            self.errorAlert.textContent = "Non ci sono voti!";
                            self.errorAlert.style.display = "block";
                            return;
                        }
                        self.update(gradesToShow); //self is visible by the closure
                        //Insert exam info in btn section
                        var btnSection = document.getElementById("buttonsSection");
                        btnSection.setAttribute("courseId", courseId);
                        btnSection.setAttribute("examDate", examDate);
                    }
                }
            }
        );
    }

    this.update = function(gradesArray) {
        //Show the container of the grades list and hide the course container
        this.container.style.display = "block";
        this.coursesList.style.display = "none";
        //Empty the list
        this.list.innerHTML = "";
        //Insert a row for each grade
        var row, matricola, lastName, firstName, email, degree, evaluation, status, action, anchor, btn;
        var self = this;
        //Take the exam session and update the title
        var exam = gradesArray[0].examSession;
        this.title.textContent = "Appello d'esame " + exam.course.name + "[" + exam.course.courseID + "] - " + exam.dateTime;
        gradesArray.forEach(gr => {
            row = document.createElement("tr");
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
            //Create evalutation table column
            evaluation = document.createElement("td");
            evaluation.textContent = getGradeAsString(gr.grade, gr.laude);
            row.appendChild(evaluation);
            //Create status table column
            status = document.createElement("td");
            status.textContent = gr.gradeStatus;
            status.className = "table-warning text-center";
            row.appendChild(status);
            //Create action table column
            action = document.createElement("td");
            anchor = document.createElement("a");
            anchor.href ="#";
            //Set anchor attribute to perform the call
            anchor.setAttribute("courseId", gr.examSession.course.courseID);
            anchor.setAttribute("examDate", gr.examSession.dateTime);
            anchor.setAttribute("pc", gr.student.personCode);
            action.appendChild(anchor);
            btn = document.createElement("button");
            btn.type = "button";
            btn.className = "btn btn-primary";
            btn.style.width = "100%";
            btn.textContent = "Dettaglio";
            //Add the button event listener
            btn.addEventListener("click", (e) => {
                var clickedAnchor = e.target.closest("a");
                this.orchestrator.showGradeModal(clickedAnchor.getAttribute("courseId"), clickedAnchor.getAttribute("examDate"), clickedAnchor.getAttribute("pc"));
            }, false);
            anchor.appendChild(btn);
            row.appendChild(anchor);
            //Finally append the row
            self.list.appendChild(row);
        });
        //Check if display or not the actions buttons
        
        var canInsert = false, canPublish = false, canReport = false;
        gradesArray.forEach(g => {
            if(g.gradeStatus === "NON INSERITO") canInsert = true;
            else if(g.gradeStatus === "PUBBLICATO") canReport = true;
            else if(g.gradeStatus === "INSERITO") canPublish = true;
        });
        
        if(canInsert){
            this.multipleInsertionBtn.style.display = "inline";
        }else this.multipleInsertionBtn.style.display = "none";
        
        if(canPublish){ 
            this.publishBtn.style.display = "inline";
        }else this.publishBtn.style.display = "none";
        
        if(canReport){ 
            this.reportBtn.style.display = "inline";          
        }else this.reportBtn.style.display = "none";

    }

    this.reset = function() {
        this.container.style.display = "none";
    }
    
    this.registerEventListeners = function() {
    	var self = this;
    	var btnSection = document.getElementById("buttonsSection");
    	this.reportBtn.addEventListener("click", (e) => {
            makeCall("GET", "ReportExamSessionGrades?courseId=" + btnSection.getAttribute("courseID")+"&date="+btnSection.getAttribute("examdate")+":00.0", null,
                function(req) {
                    if(req.readyState == 4) {
                        if(req.status == 200) {
                            //Set a successful message
                            self.successAlert.textContent = "Verbale caricato correttamente";
                            self.successAlert.style.display = "block";
                            //update grades
                            self.orchestrator.refreshExamDetails(btnSection.getAttribute("courseID"),  btnSection.getAttribute("examdate"));
                        }
                    }
                }
            );
        }, false);
    	
    	this.publishBtn.addEventListener("click", (e) => {
            //Call with AJAX the publish servlet
            var self = this;
            makeCall("GET", "PublishExamSessionGrades?courseId=" + btnSection.getAttribute("courseID")+"&date="+btnSection.getAttribute("examdate")+":00.0", null,
                function(req) {
                    if(req.readyState == 4) {
                        if(req.status == 200) {
                            //Set a successful message
                            self.successAlert.textContent = "Voti pubblicati correttamente!";
                            self.successAlert.style.display = "block";
                            //update grades
                            self.show(btnSection.getAttribute("courseID"),  btnSection.getAttribute("examdate"));
                        }
                    }
                }
            );    
        }, false);
    	
    	this.multipleInsertionBtn.addEventListener("click", (e) => {
            var btnSection = document.getElementById("buttonsSection");
            this.orchestrator.showInsertionModal(btnSection.getAttribute("courseId"), btnSection.getAttribute("examDate"));
        }, false);
    	
    	
    }
}

function ReportsList(_orchestrator, _reportsContainer,_reportTableBody){
    this.orchestrator = _orchestrator;
    this.reportsContainer = _reportsContainer;  //Container of all the the report section
    this.tableBody = _reportTableBody;
    
    
    
    this.show = function(courseId, examDate) {
        this.reportsContainer.style.display = "none";
        var self = this;
        //AJAX call to get the list of reports
        makeCall("GET", "GetExamReports?courseId=" + courseId+"&date="+examDate+":00.0", null,
            function(req) {
                if(req.readyState == 4) {
                    var reports = req.responseText; //Get the Json list
                    if(req.status == 200) {
                        var reportsToShow = JSON.parse(reports); //if response is successful
                        if(reportsToShow.length == 0) {
                            self.reportsContainer.style.display = "none";
                            return;
                        }
                        self.update(reportsToShow); //self is visible by the closure
                    }
                }
            }
        );
    }

    this.update = function(reportsArray){
        var row,tableBody,reportID,reportDate,anchor,button;

        this.tableBody.innerHTML = ""; //empty the table body
         //build updated list
        this.reportsContainer.style.display = "block";
        var self = this;
        reportsArray.forEach(report => {
            row = document.createElement("tr");
            reportID = document.createElement("td");
            reportID.textContent = report.examReportId;
            reportDate = document.createElement("td");
            reportDate.textContent = report.dateTime;
            anchor = document.createElement("a");
            button = document.createElement("button");
            button.type = "button";
            button.className = "btn btn-primary"
            button.style="width: 100%;"
            button.textContent="Dettaglio"; 
            anchor.appendChild(button);

            row.appendChild(reportID);
            row.appendChild(reportDate);
            row.appendChild(anchor);
            tableBody = self.tableBody;
            tableBody.appendChild(row);

            // listener of the report detail button            
            button.addEventListener("click", (e) => {
                self.orchestrator.showReportModal(report.examReportId,report.dateTime);
            });
         });
    }

    this.reset = function() {
        this.reportsContainer.style.display = "none";
    }

}