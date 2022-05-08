package it.polimi.tiw.controllers;

import java.io.IOException;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.List;
import java.util.stream.Collectors;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import it.polimi.tiw.beans.Course;
import it.polimi.tiw.beans.ExamResult;
import it.polimi.tiw.beans.Student;
import it.polimi.tiw.dao.CourseDAO;
import it.polimi.tiw.dao.ExamSessionDAO;
import it.polimi.tiw.dao.StudentDAO;
import it.polimi.tiw.handlers.ConnectionHandler;


/**
 * Servlet implementation class GetStudentGradeDetails
 */
@WebServlet("/GetStudentGradeDetails")
public class GetStudentGradeDetails extends HttpServlet {
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
		
        Student student = (Student) request.getSession(false).getAttribute("student");
		
		ExamSessionDAO examSessionDAO = new ExamSessionDAO(connection);
		CourseDAO courseDAO = new CourseDAO(connection);
		StudentDAO studentDAO = new StudentDAO(connection);
		
		ExamResult result = null;
		
		try {
			courseId = Integer.parseInt(request.getParameter("courseId"));
			datetime = Timestamp.valueOf(request.getParameter("date"));
			studentPersonCode =student.getPersonCode();
		}catch (NullPointerException | IllegalArgumentException e ) {
			isBadRequest = true;
			e.printStackTrace();
		}
		if (isBadRequest) {
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			response.getWriter().println("Incorrect or missing param values");
			return;
		}
		
		//Get the user from the session
		
		try {
			//Check if the course exists and it is followed by the student
			Course course = courseDAO.getCourseById(courseId);
			if(course == null) {
				response.setStatus(HttpServletResponse.SC_NOT_FOUND);
				response.getWriter().println("Resource not found");
				return;
			}

			//Get student courses
			List<Course> courses = studentDAO.getFollowedCoursesDesc(student.getPersonCode());
			//Check if the course belongs to the student's courses
			final int cId = courseId.intValue();
			if(courses.stream().filter(c -> cId == c.getCourseID()).collect(Collectors.toList()).size() != 1) {
				response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
				response.getWriter().println("User not allowed");
				return;
			}
			
			result = examSessionDAO.getStudentExamResult(studentPersonCode, courseId, datetime);

			
			if(result!=null && result.getStudent().getPersonCode() != student.getPersonCode()){
				response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
				response.getWriter().println("User not allowed");
				return;
			}else{
				//If grade is not PUBBLICATO or VERBALIZZATO or RIFIUTATO, hide it
				if(result!=null && !result.getGradeStatus().equals("PUBBLICATO") && !result.getGradeStatus().equals("VERBALIZZATO") &&  !result.getGradeStatus().equals("RIFIUTATO")) {
					result.setGrade(0);
				}
				
				Gson gson = new GsonBuilder()
						   .setDateFormat("yyyy-MM-dd HH:mm").create();
				String json = gson.toJson(result);

				response.setContentType("application/json");
				response.setCharacterEncoding("UTF-8");
				response.getWriter().write(json);
			}
		} catch (SQLException e) {
			response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			response.getWriter().println("Database access failed");
			e.printStackTrace();
		}
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
