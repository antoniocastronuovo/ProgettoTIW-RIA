package it.polimi.tiw.controllers;

import java.io.IOException;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Timestamp;

import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import it.polimi.tiw.beans.Course;
import it.polimi.tiw.beans.ExamResult;
import it.polimi.tiw.beans.Teacher;
import it.polimi.tiw.dao.CourseDAO;
import it.polimi.tiw.dao.ExamSessionDAO;
import it.polimi.tiw.handlers.ConnectionHandler;

/**
 * Servlet implementation class EditStudentGrade
 */
@WebServlet("/EditStudentGrade")
@MultipartConfig
public class EditStudentGrade extends HttpServlet {
	private static final long serialVersionUID = 1L;
    private Connection connection = null;
    
    @Override
    public void init() throws ServletException {
		connection = ConnectionHandler.getConnection(getServletContext());
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		
		//Get and parse all parameters from request
		boolean isBadRequest = false;
		Integer courseId = null;
		Timestamp datetime = null;
		Integer personCode = null;
		Integer grade = null;
		
		try {
			grade = Integer.parseInt(request.getParameter("grade"));
			personCode = Integer.parseInt(request.getParameter("personCode"));
			courseId = Integer.parseInt(request.getParameter("course"));
			datetime = Timestamp.valueOf(request.getParameter("date"));
			//System.out.println("Grade: " + grade + ", pc: " + personCode + ", courseId: " + courseId + ", date: " + datetime);
		}catch (NullPointerException | IllegalArgumentException e ) {
			isBadRequest = true;
			e.printStackTrace();
		}
		if (isBadRequest) {
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			response.getWriter().println("Not possible to edit grade");
			return;
		}
		
		ExamSessionDAO examSessionDAO = new ExamSessionDAO(connection);
		CourseDAO courseDAO = new CourseDAO(connection);
		
		//Get the user from the session
		Teacher teacher = (Teacher) request.getSession(false).getAttribute("teacher");
		ExamResult result = null;
		
		try {
			//Check if the course exists and it is taught by the user
			Course course = courseDAO.getCourseById(courseId);
			if(course == null) {
				response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
				response.getWriter().println("Risorsa non trovata");
				return;
			}
			if(course.getTeacher().getPersonCode() != teacher.getPersonCode()) {
				response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
				response.getWriter().println("Utente non autorizzato");
				return;
			}
			
			//Check if the grade exists (and also if the exam session exists) 
			result = examSessionDAO.getStudentExamResult(personCode, courseId, datetime);
			if(result==null) {
				response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
				response.getWriter().println("Il voto richiesto non esiste");
				return;
			}
			if(!result.isEditable()) {
				response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
				response.getWriter().println("Voto già pubblicato o verbalizzato.");
				return;
			}
			//Check if the grade is admissible
			if(grade <= -4 || grade > 31 || (grade >= 0 && grade < 18)) {
				response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
				response.getWriter().println("Voto non ammissibile.");
				return;
			}
			
			//Update the grade
			boolean laude = false;
			if(grade == 31) {
				laude = true;
				grade = 30;
			}
			
			examSessionDAO.updateExamResult(personCode, courseId, datetime, grade, laude);
			result = examSessionDAO.getStudentExamResult(personCode, courseId, datetime);
		}catch (SQLException e) {
			e.printStackTrace();
			response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			response.getWriter().println("Database access failed");
			return;
		}
		
		//return the updated grade
		Gson gson = new GsonBuilder().setDateFormat("yyyy-MM-dd HH:mm").setPrettyPrinting().create();
		String json = gson.toJson(result);
		response.setContentType("application/json");
		response.setCharacterEncoding("UTF-8");
		response.getWriter().write(json);
	}
	
	@Override
	public void destroy() {
		try {
			ConnectionHandler.closeConnection(connection);
		} catch (SQLException e) {
			e.printStackTrace();
		}
	}

}
