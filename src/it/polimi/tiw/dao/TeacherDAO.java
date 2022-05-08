package it.polimi.tiw.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import it.polimi.tiw.beans.Course;
import it.polimi.tiw.beans.Teacher;

public class TeacherDAO {
	private Connection connection;

	public TeacherDAO(Connection connection) {
		super();
		this.connection = connection;
	}
	
	public Teacher getTeacherByPersonCode(int personCode) throws SQLException {
		String query = "select * from person as P, teacher as T where P.PersonCode=T.PersonCode and T.PersonCode=?;";
		try (PreparedStatement pstatement = connection.prepareStatement(query);) {
			pstatement.setInt(1, personCode);
			Teacher teacher = new Teacher();
			try (ResultSet result = pstatement.executeQuery();) {
				if (!result.isBeforeFirst()) // no results, credential check failed
					return null;
				else {
					result.next();
					teacher.setPersonCode(result.getInt("PersonCode"));
					teacher.setEmail(result.getString("Email"));
					teacher.setFirstName(result.getString("FirstName"));
					teacher.setLastName(result.getString("LastName"));
					teacher.setDepartment(result.getString("Department"));
					return teacher;
				}
			}
		}
	}
	
	public Teacher checkCredentials(int personCode, String pwd) throws SQLException{
		String query = "SELECT P.PersonCode, P.Email, P.FirstName, P.LastName, T.Department "
				+ "FROM teacher AS T JOIN person AS P ON T.PersonCode = P.PersonCode "
				+ "WHERE P.PersonCode = ? AND P.Password = ?;";
		try(PreparedStatement pStatement = connection.prepareStatement(query);) {
			pStatement.setInt(1, personCode);
			pStatement.setString(2, pwd);
			try(ResultSet result = pStatement.executeQuery();) {
				if(!result.isBeforeFirst())
					return null;
				else {
					result.next();
					Teacher teacher = new Teacher();
					teacher.setPersonCode(result.getInt("PersonCode"));
					teacher.setEmail(result.getString("Email"));
					teacher.setFirstName(result.getString("FirstName"));
					teacher.setLastName(result.getString("LastName"));
					teacher.setDepartment(result.getString("Department"));
					return teacher;
				}
			}
		}
	}
	
	public List<Course> getTaughtCoursesDesc(int personCode) throws SQLException{
		String query = "SELECT * "
				+ "FROM course AS C "
				+ "WHERE  C.TeacherPersonCode= ? "
				+ "ORDER BY C.Name DESC; ";
		try (PreparedStatement pstatement = connection.prepareStatement(query);) {
			pstatement.setInt(1, personCode);
			try (ResultSet result = pstatement.executeQuery();) {
				if (!result.isBeforeFirst()) // no results, credential check failed
					return new ArrayList<>();
				else {
					List<Course> courses = new ArrayList<>();
					while(result.next()) {				
						CourseDAO courseDAO = new CourseDAO(connection);
						Course tempCourse= courseDAO.getCourseById(result.getInt("CourseId"));
						courses.add(tempCourse);
					}
					return courses;
				}
			}
		}
	}
	
}
