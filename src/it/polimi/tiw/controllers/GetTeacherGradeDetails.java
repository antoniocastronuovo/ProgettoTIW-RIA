package it.polimi.tiw.controllers;

import java.io.IOException;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Timestamp;

import javax.servlet.ServletException;
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
 * Servlet implementation class GetTeacherGradeDetails
 */
@WebServlet("/GetTeacherGradeDetails")
public class GetTeacherGradeDetails extends HttpServlet {
	private static final long serialVersionUID = 1L;
    private Connection connection = null;
    
    @Override
    public void init() throws ServletException {
		connection = ConnectionHandler.getConnection(getServletContext());
	}

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		//Get and parse all parameters from request
		boolean isBadRequest = false;
		Integer courseId = null;
		Timestamp datetime = null;
		Integer studentPersonCode = null;

		try {
			courseId = Integer.parseInt(request.getParameter("courseId"));
			datetime = Timestamp.valueOf(request.getParameter("date"));
			studentPersonCode = Integer.parseInt(request.getParameter("personCode"));
		}catch (NullPointerException | IllegalArgumentException e ) {
			isBadRequest = true;
			e.printStackTrace();
		}
		if (isBadRequest) {
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			response.getWriter().println("Incorrect or missing param values");
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
				response.setStatus(HttpServletResponse.SC_NOT_FOUND);
				response.getWriter().println("Resource not found");
				return;
			}
			if(course.getTeacher().getPersonCode() != teacher.getPersonCode()) {
				response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
				response.getWriter().println("User not allowed");
				return;
			}
			
			//Check if the grade exists (and also if the exam session exists) 
			result = examSessionDAO.getStudentExamResult(studentPersonCode, courseId, datetime);
			if(result==null) {
				response.setStatus(HttpServletResponse.SC_NOT_FOUND);
				response.getWriter().println("The requested grade does not exist.");
				return;
			}
				
		} catch (SQLException e) {
			e.printStackTrace();
			response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Database access failed");
			return;
		}
		
		Gson gson = new GsonBuilder().setDateFormat("yyyy-MM-dd HH:mm").setPrettyPrinting().create();
		String json = gson.toJson(result);
		response.setContentType("application/json");
		response.setCharacterEncoding("UTF-8");
		response.getWriter().write(json);
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
		doGet(request, response);
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
