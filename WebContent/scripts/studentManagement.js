"use strict";

/**
 *  Script that manages the student part of the application
 */


(function(){
    //page components
    var coursesList, singleGradeModal,
    pageOrchestrator = new PageOrchestrator(); //main controller
    
    

    //On page load, redirect to index if teacher is not logged in or display the courses list
    window.addEventListener("load", () => {
        if(sessionStorage.getItem("user") == null) {
            window.location.href = "index.html";
        }else{
            pageOrchestrator.start(); //initialize the components
            pageOrchestrator.refresh(); //display intial components = coursesList
        }
    }, false);

    function CoursesList(_coursesContainer, _courseTitle, _errorAlert, _courseList, _studentName){
        this.courseContainer = _coursesContainer; //card containing the courses list
        this.courseTitle = _courseTitle; //the bold elements with the teacher name
        this.errorAlert = _errorAlert; //the alert reporting errors
        this.courseList = _courseList; //the list group 
        this.studentName = _studentName; //label with the student name

        this.show = function() {
            this.courseContainer.style.display = "block";
            this.courseList.style.display = "block";
            this.courseTitle.textContent = "Corsi seguiti da " + sessionStorage.getItem("user");
            this.errorAlert.style.display = "none";
            this.studentName.textContent = sessionStorage.getItem("user");

            var self = this;
            makeCall("GET", "GetStudentCourses", null,
                function(req) {
                    if(req.readyState == 4) {
                        var coursesListJson = req.responseText; //Get the Json list
                        if(req.status == 200) { //if response is successful
                            var coursesToShow = JSON.parse(coursesListJson); //parse the list
                            if(coursesToShow.length == 0) {
                                self.errorAlert.textContent = "Non segui ancora corsi!";
                                self.errorAlert.style.display = "block";
                                return;
                            }
                            self.update(coursesToShow); //self is visible by the closure
                        }
                    }
                }
            ); 
        }

        this.update = function(coursesArray) {
            var row, titleSection, titleText, description, examsCount, titleAnchor;
            this.courseList.innerHTML = ""; //empty the table body
            //build updated list
            var self = this;
            coursesArray.forEach(course => {
                row = document.createElement("div");
                row.className = "list-group-item list-group-item-action flex-column align-items-start";
                titleSection = document.createElement("div");
                titleSection.className = "d-flex justify-content-between";
                row.appendChild(titleSection);
                titleText = document.createElement("h5");
                titleText.className = "mb-1";
                titleText.textContent = course.courseID + " - " + course.name;
                titleAnchor = document.createElement("a");
                titleAnchor.appendChild(titleText);
                titleAnchor.setAttribute("courseId", course.courseID);
                titleAnchor.addEventListener("click", (e) => {
                    //Make call to retrieve the list of exam sessions of the clicked course
                    var alert = document.getElementById("coursesError");
                    alert.style.display ="none";
                    self.updateExamSessions(e);
                }, false);
                titleAnchor.href = "#";
                titleSection.appendChild(titleAnchor);
                examsCount = document.createElement("span");
                examsCount.className = "badge badge-secondary";
                examsCount.textContent = course.numExamSessions + " appelli";
                titleSection.appendChild(examsCount);
                description = document.createElement("p");
                description.className = "mb-1";
                description.textContent = course.description;
                row.appendChild(description);
                self.courseList.appendChild(row);
            });
        }

        this.updateExamSessions = function(e) {
            var courseId = e.target.closest("a").getAttribute("courseId"); //get the courseId
            this.reset(); //Remove all exams sub-lists
            this.courseContainer.style.display = "block"; //display the element
            //Retrieve the exams of the course with AJAX
            var self = this;
            makeCall("GET", "GetExamSessionsStudent?courseId=" + courseId, null,
                function(req) {
                    if(req.readyState == 4) { //is done
                        if(req.status == 200) {
                            var courseRow = e.target.closest(".list-group-item");
                            var examsToShow = JSON.parse(req.responseText);
                            //Create exam sessions list
                            var examsList, examRow, examAnchor, examName, studentsCount;
                            examsList = document.createElement("ul");
                            examsList.className = "list-group list-group-flush";
                            courseRow.appendChild(examsList);
                            //Create a row for each exam
                            //Each element has a p with a span inside a li, inside an ai
                            if(examsToShow!=null){
                                examsToShow.forEach(exam => {
                                        examAnchor = document.createElement("a");
                                        examAnchor.href = "#";
                                        examAnchor.setAttribute("courseId", courseId);
                                        examAnchor.setAttribute("examDate", exam.dateTime);
                                        examsList.appendChild(examAnchor);
                                        examRow = document.createElement("li");
                                        examRow.className = "list-group-item d-flex justify-content-between align-items-center";
                                        examAnchor.appendChild(examRow);
                                        examAnchor.addEventListener("click", (e) => {
                                            //Hide course list
                                            var clickedAnchor = e.target.closest("a");
                                            //Display the list of grades
                                            singleGradeModal.show(clickedAnchor.getAttribute("courseId"), clickedAnchor.getAttribute("examDate"));
                                        }, false);
                                        examName = document.createElement("p");
                                        examName.textContent = "Appello del " + exam.dateTime;
                                        examRow.appendChild(examName);
                                        //Add badge with number of registered students
                                        studentsCount = document.createElement("span");
                                        studentsCount.className = "badge badge-secondary";
                                        studentsCount.textContent = exam.numOfRegisteredStudents;
                                        examRow.appendChild(studentsCount);
                                    });
                                
                            }
                    }
                }
                });
        }

        this.reset = function() {
            //Remove all exams session sub-lists
            this.courseList.querySelectorAll(".list-group-item > ul").forEach(item => {item.remove()});
            this.courseContainer.style.display = "none";
        }
    }

    function SingleGradeModal(_gradeModal) {
        this.gradeModal = _gradeModal;

        this.show = function(courseId, examDate) {
            //Display the container
            var self = this;
            var rejectButton = document.getElementById("rejectButton");
            rejectButton.setAttribute("courseId", courseId);
            rejectButton.setAttribute("examDate", examDate);
            
            this.errorAlert = document.getElementById("coursesError");
            this.errorAlert.style.display ="none";
            //Retrieve the list of grades with AJAX
            makeCall("GET", "GetStudentGradeDetails?courseId="+courseId+"&date="+examDate+":00.0", null,
                function(req) {
                    if(req.readyState == 4) {
                        var gradeJson = req.responseText; //Get the Json list
                        if(req.status == 200) { //if response is successful
                            var gradeToShow = JSON.parse(gradeJson);
                            var visibility = true; //parse the list
                            if(gradeToShow == null) {
                                self.errorAlert.textContent = "Non sei inscritto all'appello richiesto";
                                self.errorAlert.style.display = "block";
                                return;
                            }else if( gradeToShow.gradeStatus === "INSERITO" || gradeToShow.gradeStatus === "NON INSERITO"){
                                visibility = false;
                            }
                            self.update(gradeToShow,visibility); //self is visible by the closure
                        }
                    }
                }
            );
        }

        this.update = function(gradeData,visibility) {
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
           
            //Set form hidden field values
            document.querySelector("#gradeModal #personCodeHidden").value = gradeData.student.personCode;
            document.querySelector("#gradeModal #examDateHidden").value = gradeData.examSession.dateTime + ":00.0";
            document.querySelector("#gradeModal #courseHidden").value = gradeData.examSession.course.courseID;

            var gradeStatus = document.querySelector("#gradeModal #gradeStatus");
            var gradeConfirmed = document.querySelector("#gradeModal #gradeConfirmed");
            var info = document.getElementById("gradeSuccess") ;
            
            if(visibility){
                gradeArea.style.display = "compact";
                gradeStatus.textContent = gradeData.gradeStatus;
                gradeConfirmed.textContent = getGradeAsString(gradeData.grade, gradeData.laude);
                info.style.display = "none";
            }
            else{
                gradeArea.style.display = "none";
                gradeStatus.textContent = "";
                gradeConfirmed.textContent = "";

                info.style.display="block";
                info.textContent = "L'esito per questo appello non è ancora disponibile";
            }
            //finally show the modal
            this.gradeModal.style.display = "block";

            //Manage reject button
            var rejectButton = document.getElementById("rejectButton");
            rejectButton.style.display = "none";
            
            var canReject = false;
            if(gradeData.gradeStatus === "PUBBLICATO" && gradeData.grade >= 18){
                canReject=true;
                rejectButton.style.display = "block";
            }

            if(canReject){
                rejectButton.style.display = "block";
                
            }
        }
        
        this.registerEventListeners = function() {
        	var self = this;
            var rejectButton = document.getElementById("rejectButton");
            rejectButton.addEventListener("click", (e) => {
            	var courseId = rejectButton.getAttribute("courseId");
                var examDate = rejectButton.getAttribute("examDate");
            	makeCall("GET", "RejectGrade?courseId=" + courseId +"&date="+examDate+":00.0", null,
                    function(req) {
                        if(req.readyState == 4) {
                            if(req.status == 200) {
                                rejectButton.style.display = "none";
                                self.show(courseId,examDate);
                            }
                        }
                    }
                );
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
        
        this.reset = function() {
            this.gradeModal.style.display = "none";
        }
    }

    function PageOrchestrator() {
        this.start = function() {
            //Init CoursesList
            coursesList = new CoursesList(
                document.getElementById("coursesContainer"),
                document.getElementById("coursesTitle"),
                document.getElementById("coursesError"),
                document.getElementById("coursesList"),
                document.getElementById("studentName"));

            singleGradeModal = new SingleGradeModal(document.getElementById("gradeModal"));
            singleGradeModal.registerEventListeners();
            
            document.querySelector("a[href='Logout']").addEventListener('click', () => {
    	        window.sessionStorage.removeItem('user');
    	      }, true);    
             
        }

        this.refresh = function() {
            coursesList.reset();
            coursesList.show();
        }
    }
})();