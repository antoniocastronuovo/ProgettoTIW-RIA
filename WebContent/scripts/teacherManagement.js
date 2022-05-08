"use strict"; // used to control that all the variables are declared variables (with var or let)

//IIFE
(function(){
    //6 page components
    var coursesList, gradesList, reportsList, insertGradesModal, singleGradeModal, reportModal,
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

    function PageOrchestrator() {
        this.start = function() {
            //Init CoursesList
            coursesList = new CoursesList(this,
                document.getElementById("coursesContainer"),
                document.getElementById("title"),
                document.getElementById("errorAlert"),
                document.getElementById("okAlert"),
                document.getElementById("coursesList"),
                document.getElementById("teacherName"));
            
            //Init GradesList
            gradesList = new GradesList(this,
                document.getElementById("coursesList"),
                document.getElementById("examContainer"),
                document.getElementById("title"),
                document.getElementById("errorAlert"),
                document.getElementById("okAlert"),
                document.getElementById("gradesList"),
                document.getElementById("multipleInsertBtn"),
                document.getElementById("publishBtn"),
                document.getElementById("reportBtn"));
			
            gradesList.registerEventListeners();
            
            //Init ReportList
            reportsList = new ReportsList(this,
                document.getElementById("reportsContainer"),
                document.getElementById("reportsTableBody")
            );
            
            //Init modals
            reportModal = new ReportModal(document.getElementById("reportModal"),document.getElementById("bodyModalReport"));
            reportModal.registerEventListeners();
            singleGradeModal = new SingleGradeModal(this, document.getElementById("gradeModal"));
            singleGradeModal.registerEventListeners();
            insertGradesModal = new InsertGradesModal(this, document.getElementById("insertModal"));
            insertGradesModal.registerEventListeners();
            
            //Set logout button
            document.querySelector("a[href='Logout']").addEventListener('click', () => {
    	        window.sessionStorage.removeItem('user');
    	    }, true);
        }

        this.refresh = function() {
            coursesList.reset();
            gradesList.reset();
            coursesList.show();
        }

        this.refreshExamDetails = function(courseId, examDate) {
            //Display the list of grades
            gradesList.show(courseId, examDate);
            //Display list of exam reports
            reportsList.show(courseId, examDate);
        }

        this.showGradeModal = function(courseId, examDate, personCode) {
            singleGradeModal.show(courseId, examDate, personCode);
        }

        this.showReportModal = function(reportId, date) {
            reportModal.show(reportId, date);
        }

        this.showInsertionModal = function(courseId, examDate) {
            insertGradesModal.show(courseId, examDate);
        }

        this.refreshGradesList = function(courseId, examDate) {
            gradesList.show(courseId, examDate);
        }
    }

})();