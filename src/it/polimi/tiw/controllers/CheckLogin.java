package it.polimi.tiw.controllers;

import java.io.IOException;
import java.sql.Connection;
import java.sql.SQLException;

import javax.servlet.ServletException;
import javax.servlet.UnavailableException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import it.polimi.tiw.beans.Student;
import it.polimi.tiw.beans.Teacher;
import it.polimi.tiw.dao.StudentDAO;
import it.polimi.tiw.dao.TeacherDAO;
import it.polimi.tiw.handlers.ConnectionHandler;

/**
 * Servlet implementation class CheckLogin
 */
@WebServlet("/CheckLogin")
@MultipartConfig
public class CheckLogin extends HttpServlet {
	private static final long serialVersionUID = 1L;
    private Connection connection = null;
    
    @Override
    public void init() throws ServletException {
    	connection = ConnectionHandler.getConnection(getServletContext());
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
    @Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
    	
    	//Get and parse all parameters from request
		String personCodeString = request.getParameter("personCode");
    	String password = request.getParameter("password");
    	
		//Check if credentials are bad formatted
    	String errorString = checkCredetials(personCodeString, password);
		if(!errorString.isEmpty()) {
			response.setStatus(HttpServletResponse.SC_OK);
			response.getWriter().println("{\"login\": \"ko\", \"message\": \"" + errorString +"\"}");
			return;
		}else { //Credential are well formatted
			try {
				int personCode = Integer.parseInt(personCodeString);
				StudentDAO students = new StudentDAO(connection);
				Student studentToLogIn = students.checkCredentials(personCode, password);
				if(studentToLogIn == null) {
					TeacherDAO teachers = new TeacherDAO(connection);
					Teacher teacherToLogIn = teachers.checkCredentials(personCode, password);
					if(teacherToLogIn == null) { //Wrong credentials
						response.setStatus(HttpServletResponse.SC_OK);
						response.getWriter().println("{\"login\": \"ko\", \"message\": \"Credenziali errate.\"}");
						return;
					}else { //Teacher is found
						request.getSession().setAttribute("teacher", teacherToLogIn);
						String teacherJson = "{\"login\": \"ok\", \"role\": \"teacher\", \"fullName\": \""+ teacherToLogIn.getFirstName() + " " + teacherToLogIn.getLastName() +"\"}";
						response.setStatus(HttpServletResponse.SC_OK);
						response.setContentType("application/json");
						response.setCharacterEncoding("UTF-8");
						response.getWriter().write(teacherJson);		
					}
				}else { //A student is found
					//Associate the user to the session, if it already exists, it is replaced
					request.getSession().setAttribute("student", studentToLogIn);
					String studentJson = "{\"role\": \"student\", \"fullName\": \""+ studentToLogIn.getFirstName() + " " + studentToLogIn.getLastName() +"\"}";;
					response.setStatus(HttpServletResponse.SC_OK);
					response.setContentType("application/json");
					response.setCharacterEncoding("UTF-8");
					response.getWriter().write(studentJson);
					//System.out.println(studentJson);
				}
			}catch(SQLException e){
				e.printStackTrace();
				throw new UnavailableException("Couldn't get db connection");
			}
		}
	}
	
    private String checkCredetials(String personCodeString, String passwordString) {
    	String errorString = "";
    	//Check person code
    	if(personCodeString == null || personCodeString.isEmpty()) {
			errorString += "Codice persona obbligatorio.\n";
		}else {
			try {
				Integer.parseInt(personCodeString);
			} catch (NullPointerException | IllegalArgumentException e ) {
				errorString += "Il codice persona deve contenere solo numeri\n";
			}
		}
    	//Check password
		if(passwordString == null || passwordString.isEmpty()) {
			errorString += "Password obbligatoria.\n";
		}else if(passwordString.length() < 3 || passwordString.length() > 12) {
			errorString += "La password deve avere tra 3 e 12 caratteri.";
		}
		return errorString;
		
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
