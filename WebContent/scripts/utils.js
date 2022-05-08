"use strict";


/**
 * AJAX call management
 */

function makeCall(method, url, formElement, cback, reset = true) {
    var req = new XMLHttpRequest(); // visible by closure
    req.onreadystatechange = function() {
      cback(req)
    }; // closure
    req.open(method, url);
    if (formElement == null) {
      req.send();
    } else {
    	req.send(new FormData(formElement));
    }
    if (formElement !== null && reset === true) {
      formElement.reset();
    }
}

function makeCall2(method, url, formData, cback) {
  var req = new XMLHttpRequest(); // visible by closure
  req.onreadystatechange = function() {
    cback(req)
  }; // closure
  req.open(method, url);
  if (formData == null) {
    req.send();
  } else {
    req.send(formData);
  }
}

function getGradeAsString(grade, laude) {
    if(grade == 30 && laude)
      return "30L";

    switch (grade){
        case -4:
          return "<VUOTO>";
        case -3:
          return "ASSENTE";
        case -2:
          return "RIMANDATO";
        case -1:
          return "RIPROVATO";
      default:
        return  ""+grade;				
    }
}

function getGradeValue(grade, laude) {
    if(grade == 30 && laude)
      return 31;
    else 
      return grade;
}