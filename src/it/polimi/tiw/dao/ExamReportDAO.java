package it.polimi.tiw.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

import it.polimi.tiw.beans.ExamReport;
import it.polimi.tiw.beans.ExamSession;

public class ExamReportDAO {
	public Connection connection;

	public ExamReportDAO(Connection connection) {
		super();
		this.connection = connection;
	}
	
	public ExamReport publishExamReport(int courseId, Timestamp datetime) {
		String update = "UPDATE examresult "
				+ "SET GradeStatus = 'VERBALIZZATO' , ExamReportId = (select ExamReportId from examreport where ExamSessionCourseId = ? "
				+ "AND ExamSessionDateTime = ? Order by Datetime DESC LIMIT 1)"
				+ "WHERE (GradeStatus = 'PUBBLICATO' OR GradeStatus = 'RIFIUTATO') AND CourseId = ? AND ExamSessionDateTime = ? ;";
		String insert = "INSERT INTO examreport(DateTime, ExamSessionCourseId, ExamSessionDateTime) "
				+ "VALUES(current_timestamp(), ?, ?);";
		try(PreparedStatement updateStm = connection.prepareStatement(update);
			PreparedStatement insertStm = connection.prepareStatement(insert)) {
			//Remove the auto commit in order to do a transaction composed by the update and the insert
			connection.setAutoCommit(false);
			//Prepare the statements
			updateStm.setInt(1, courseId);
			updateStm.setTimestamp(2, datetime);
			updateStm.setInt(3, courseId);
			updateStm.setTimestamp(4, datetime);
			insertStm.setInt(1, courseId);
			insertStm.setTimestamp(2, datetime);
			
			insertStm.executeUpdate();
			updateStm.executeUpdate();
			connection.commit();
			
			return this.getLastExamReport(courseId, datetime);
		} catch (SQLException e) {
			if (connection != null) {
		        try {
		          System.err.print("Transaction is being rolled back");
		          connection.rollback();
		        } catch (SQLException excep) {
		          excep.printStackTrace();
		        }
		    }
			return null;
		}finally {
			try {
				connection.setAutoCommit(true);
			} catch (SQLException e) {
				e.printStackTrace();
			}
		}   
	}
	
	public List<ExamReport> getExamReports(int courseId, Timestamp datetime) throws SQLException {
		String query = "SELECT * FROM examreport WHERE ExamSessionCourseId = ? AND ExamSessionDatetime = ?;";
		try (PreparedStatement pstatement = connection.prepareStatement(query);) {
			pstatement.setInt(1, courseId);
			pstatement.setTimestamp(2, datetime);
			
			try (ResultSet result = pstatement.executeQuery();) {
				if (!result.isBeforeFirst())
					return new ArrayList<>();
				else {
					List <ExamReport> examReports=new ArrayList<>();
					while(result.next()) {
						ExamReport examReport = new ExamReport();
						examReport.setExamReportId(result.getInt("ExamReportId"));
						examReport.setDateTime(result.getTimestamp("Datetime"));
						ExamSession examSession = new ExamSessionDAO(connection).getExamSessionByCourseIdDateTime(courseId, datetime);
						examReport.setExamSession(examSession);
						examReports.add(examReport);
					}
					return examReports;
				}
			}
		}
	}
	
	public ExamReport getExamReportById(int examReportId) throws SQLException {
		String query = "SELECT * FROM examreport WHERE ExamReportId = ?;";
		try (PreparedStatement pstatement = connection.prepareStatement(query);) {
			pstatement.setInt(1, examReportId);
			
			
			try (ResultSet result = pstatement.executeQuery();) {
				if (!result.isBeforeFirst())
					return null;
				else {
					result.next();
					ExamReport examReport = new ExamReport();
					examReport.setExamReportId(result.getInt("ExamReportId"));
					examReport.setDateTime(result.getTimestamp("Datetime"));
					ExamSession examSession = new ExamSessionDAO(connection).getExamSessionByCourseIdDateTime(result.getInt("ExamSessionCourseId"), result.getTimestamp("ExamSessionDateTime"));
					examReport.setExamSession(examSession);
					return examReport;
				}
			}
		}
	}
	
	public ExamReport getLastExamReport(int courseId, Timestamp datetime) throws SQLException {
	    String query = "SELECT * FROM examreport WHERE ExamSessionCourseId = ? AND ExamSessionDatetime = ? order by Datetime DESC LIMIT 1;";
	    try (PreparedStatement pstatement = connection.prepareStatement(query);) {
	      pstatement.setInt(1, courseId);
	      pstatement.setTimestamp(2, datetime);
	      
	      try (ResultSet result = pstatement.executeQuery();) {
	        if (!result.isBeforeFirst())
	          return null;
	        else {
	          result.next();
	          ExamReport examReport = new ExamReport();
	          examReport.setExamReportId(result.getInt("ExamReportId"));
	          examReport.setDateTime(result.getTimestamp("Datetime"));
	          ExamSession examSession = new ExamSessionDAO(connection).getExamSessionByCourseIdDateTime(courseId, datetime);
	          examReport.setExamSession(examSession);
	          return examReport;
	        }
	      }
	    }
	}
	
}
