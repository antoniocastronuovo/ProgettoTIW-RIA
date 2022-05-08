"use strict";

/**
 * Teacher course list and exam sessions list management 
 */

function CoursesList(_orchestrator, _coursesContainer, _courseTitle, _errorAlert, _successAlert, _courseList, _teacherName){
    this.courseContainer = _coursesContainer; //card containing the courses list
    this.courseTitle = _courseTitle; //the bold elements with the teacher name
    this.errorAlert = _errorAlert; //the alert reporting errors
    this.successAlert = _successAlert; //the alert reporting success messages
    this.courseList = _courseList; //the list group 
    this.teacherName = _teacherName; //label with the teacher name
    this.orchestrator = _orchestrator; //the page orchestrator


    this.show = function() {
        //Display container and update title, hide alerts
        this.courseContainer.style.display = "block";
        this.courseList.style.display = "block";
        this.courseTitle.textContent = "Corsi insegnati da " + sessionStorage.getItem("user");
        this.errorAlert.style.display = "none";
        this.successAlert.style.display = "none";
        this.teacherName.textContent = sessionStorage.getItem("user");
        var self = this; //visibile by the closure

        //AJAX call to retrieve courses from DB
        makeCall("GET", "GetTeacherCourses", null,
            function(req) {
                if(req.readyState == 4) {
                    var coursesListJson = req.responseText; //Get the Json list
                    if(req.status == 200) { //if response is successful
                        var coursesToShow = JSON.parse(coursesListJson); //parse the list
                        if(coursesToShow.length == 0) {
                            self.errorAlert.textContent = "Non insegni ancora corsi!";
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
        var self = this; //visible by the closure
        coursesArray.forEach(course => { //Create a row for each course
            row = document.createElement("div"); //Row div element
            row.className = "list-group-item list-group-item-action flex-column align-items-start";
            titleSection = document.createElement("div"); //Course title section
            titleSection.className = "d-flex justify-content-between"; 
            row.appendChild(titleSection);
            titleText = document.createElement("h5"); //Course title
            titleText.className = "mb-1";
            titleText.textContent = course.courseID + " - " + course.name;
            titleAnchor = document.createElement("a"); //Clickable anchor
            titleAnchor.appendChild(titleText);
            titleAnchor.setAttribute("courseId", course.courseID);
            titleAnchor.href = "#";
            titleAnchor.addEventListener("click", (e) => {
                //Make call to retrieve the list of exam sessions of the clicked course
                self.updateExamSessions(e);
            }, false);
            titleSection.appendChild(titleAnchor);
            examsCount = document.createElement("span"); //Badge with number of exams
            examsCount.className = "badge badge-secondary";
            examsCount.textContent = course.numExamSessions + " appelli";
            titleSection.appendChild(examsCount);
            description = document.createElement("p");
            description.className = "mb-1";
            description.textContent = course.description;
            row.appendChild(description);
            self.courseList.appendChild(row); //Finally append the row
        });
    }

    this.updateExamSessions = function(e) {
        var courseId = e.target.closest("a").getAttribute("courseId"); //get the clicked courseId
        this.reset(); //Remove all exams sub-lists
        this.courseContainer.style.display = "block"; //display the element
        //Retrieve the exams of the course with AJAX
        var self = this;
        //Add the list of exam session under the click course row
        makeCall("GET", "GetExamSessionsTeacher?courseId=" + courseId, null,
            function(req) {
                if(req.readyState == 4) { //is done
                    if(req.status == 200) { //successful
                        var courseRow = e.target.closest(".list-group-item");
                        var examsToShow = JSON.parse(req.responseText);
                        //Create exam sessions list
                        var examsList, examRow, examAnchor, examName, studentsCount;
                        examsList = document.createElement("ul");
                        examsList.className = "list-group list-group-flush";
                        courseRow.appendChild(examsList);
                        //Create a row for each exam
                        //Each element has a p with a span inside a li, inside an a
                        if(examsToShow !== null) {
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
                                    self.errorAlert.style.display = "none";
                                    var clickedAnchor = e.target.closest("a");
                                    //Display the exam session data
                                    self.orchestrator.refreshExamDetails(clickedAnchor.getAttribute("courseId"), clickedAnchor.getAttribute("examDate"));
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
            }
        );
    }

    this.reset = function() {
        //Remove all exams session sub-lists
        this.courseList.querySelectorAll(".list-group-item > ul").forEach(item => {item.remove()});
        this.errorAlert.style.display = "none";
    }
}