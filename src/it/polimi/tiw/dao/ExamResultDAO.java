package it.polimi.tiw.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import it.polimi.tiw.beans.ExamResult;

public class ExamResultDAO {
	private Connection connection;
	
	public ExamResultDAO (Connection connection) {
		super();
		this.connection = connection;	
	}
	
	public ExamResult getExamResultByPersonCode(int personCode, int courseId, Timestamp dateTime) throws SQLException {
		String query = "Select * from examresult as ER, person as P, student as S"
				+ " where ER.StudentPersonCode=P.PersonCode and P.PersonCode=S.PersonCode and S.PersonCode=? "
				+ "and (ER.CourseId,ER.ExamSessionDateTime)=(?,?) ;";
		try (PreparedStatement pstatement = connection.prepareStatement(query);) {
			pstatement.setInt(1, personCode);
			pstatement.setInt(2, courseId);
			pstatement.setTimestamp(3, dateTime);
			ExamResult examResult = new ExamResult();
			try (ResultSet result = pstatement.executeQuery();) {
				if (!result.isBeforeFirst()) // no results, credential check failed
					return examResult;
				else {
						result.next();									
						examResult.setGrade(result.getInt("Grade"));
						examResult.setLaude(result.getBoolean("Laude"));
						examResult.setGradeStatus(result.getString("GradeStatus"));
						
						StudentDAO student=new StudentDAO(connection);
						examResult.setStudent(student.getStudentByPersonCode(result.getInt("PersonCode")));
		                
						ExamSessionDAO examSessionDAO= new ExamSessionDAO(connection);
						examResult.setExamSession(examSessionDAO.getExamSessionByCourseIdDateTime(courseId, dateTime));
						
						ExamReportDAO examReportDAO = new ExamReportDAO(connection);
						examResult.setExamReport(examReportDAO.getExamReportById(result.getInt("ExamReportId")));
					}
				}
			return examResult;
		}
	}
	
}