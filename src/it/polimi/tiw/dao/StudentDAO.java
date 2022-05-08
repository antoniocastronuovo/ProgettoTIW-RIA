package it.polimi.tiw.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import it.polimi.tiw.beans.Course;
import it.polimi.tiw.beans.Student;

public class StudentDAO {
	private Connection connection;

	public StudentDAO(Connection connection) {
		super();
		this.connection = connection;
	}
	
	public Student getStudentByPersonCode(int personCode) throws SQLException {
		String query = "select * from person as P, student as S where P.PersonCode=S.PersonCode and S.PersonCode=?;";
		try (PreparedStatement pstatement = connection.prepareStatement(query);) {
			pstatement.setInt(1, personCode);
			Student student = new Student();
			try (ResultSet result = pstatement.executeQuery();) {
				if (!result.isBeforeFirst()) // no results, credential check failed
					return student;
				else {
					result.next();				
					student.setPersonCode(result.getInt("PersonCode"));
					student.setEmail(result.getString("Email"));
					student.setMatricola(result.getInt("Matricola"));
					student.setFirstName(result.getString("FirstName"));
					student.setLastName(result.getString("LastName"));
					DegreeCourseDao degreeCourseDao= new DegreeCourseDao(connection); 
					student.setDegreeCourse(degreeCourseDao.getDegreeCourseById(result.getInt("DegreeCourseId")));
				}
			}
			return student;
		}	
	}
	
	public Student checkCredentials(int personCode, String pwd) throws SQLException {
		String query = "SELECT P.PersonCode, P.Email, S.Matricola, P.FirstName, P.LastName, S.DegreeCourseId, D.DegreeCourseId, D.Name, D.Description\r\n"
				+ "FROM (student AS S JOIN person AS P ON S.PersonCode = P.PersonCode) JOIN degreecourse AS D "
				+ "WHERE P.PersonCode = ? AND P.Password =?;";
		try (PreparedStatement pstatement = connection.prepareStatement(query);) {
			pstatement.setInt(1, personCode);
			pstatement.setString(2, pwd);
			try (ResultSet result = pstatement.executeQuery();) {
				if (!result.isBeforeFirst()) // no results, credential check failed
					return null;
				else {
					result.next();
					Student student = new Student();
					student.setPersonCode(result.getInt("PersonCode"));
					student.setEmail(result.getString("Email"));
					student.setMatricola(result.getInt("Matricola"));
					student.setFirstName(result.getString("FirstName"));
					student.setLastName(result.getString("LastName"));
					DegreeCourseDao degreeCourseDao= new DegreeCourseDao(connection); 
					student.setDegreeCourse(degreeCourseDao.getDegreeCourseById(result.getInt("DegreeCourseId")));
					return student;
				}
			}
		}
	}
	
	/**
	 * Get list of courses followed by a student given his person code
	 * @param personCode person code of student
	 * @return the list of course followed by the student
	 * @throws SQLException in case of sql error
	 */
	public List<Course> getFollowedCoursesDesc(int personCode) throws SQLException {
		String query = "Select * from person as P, course as C, courseenrollment as CE, teacher as T "
				+ "where P.PersonCode=T.PersonCode and C.CourseId=CE.CourseId and C.TeacherPersonCode=T.PersonCode and StudentPersonCode = ? "
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
