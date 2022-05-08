package it.polimi.tiw.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import it.polimi.tiw.beans.Course;
import it.polimi.tiw.beans.ExamSession;

public class CourseDAO {
	
	private Connection connection;
	
	public CourseDAO(Connection connection) {
		super();
		this.connection = connection;
	}
	



	/* Return a list of ExamSession but note that the course beans inside
	 * the exam session beans in the list is not fulfilled
	 */
	public List<ExamSession> getExamSessionsByCourseId(int courseId) throws SQLException {
		String query = "SELECT DateTime, Room, CourseId FROM examsession WHERE CourseId = ?;";
		try (PreparedStatement pstatement = connection.prepareStatement(query);) {
			pstatement.setInt(1, courseId);
			List<ExamSession> examSessions = new ArrayList<>();
			try (ResultSet result = pstatement.executeQuery();) {
				if (!result.isBeforeFirst())
					return null;
				else {
					while(result.next()) {
						ExamSessionDAO examSessionDAO = new ExamSessionDAO(connection);
						ExamSession examSession = new ExamSession();
						examSession.setDateTime(result.getTimestamp("DateTime"));
						examSession.setRoom(result.getString("Room"));
						examSession.setNumOfRegisteredStudents(examSessionDAO.getNumberOfRegisteredStudent(courseId, examSession.getDateTime()));
						Course course = new CourseDAO(connection).getCourseById(courseId);
						examSession.setCourse(course);
						examSessions.add(examSession);
					}
				}
			}
			return examSessions;
		}
	}
	
	public int getNumberOfExamSession(int courseId) throws SQLException {
		String query = "SELECT count(*) AS C FROM examsession WHERE CourseId = ?;";
		try (PreparedStatement pstatement = connection.prepareStatement(query);) {
			pstatement.setInt(1, courseId);
			try (ResultSet result = pstatement.executeQuery();) {
				if (!result.isBeforeFirst()) // no results, credential check failed
					return 0;
				else {
					result.next();
					return result.getInt("C");
				}
			}
		}
	}
	
	public Course getCourseById(int courseId) throws SQLException {
		String query = "SELECT * FROM course WHERE CourseId = ?;";
		try (PreparedStatement pstatement = connection.prepareStatement(query);) {
			pstatement.setInt(1, courseId);
			try (ResultSet result = pstatement.executeQuery();) {
				if (!result.isBeforeFirst()) 
					return null;
				else {
					result.next();
					Course course = new Course();
					course.setCourseID(result.getInt("CourseId"));
					course.setName(result.getString("Name"));
					course.setDescription(result.getString("Description"));
					course.setTeacher(new TeacherDAO(connection).getTeacherByPersonCode(result.getInt("TeacherPersonCode")));
					course.setNumExamSessions(getNumberOfExamSession(courseId));
					return course;
				}
			}
		}
	}
}
