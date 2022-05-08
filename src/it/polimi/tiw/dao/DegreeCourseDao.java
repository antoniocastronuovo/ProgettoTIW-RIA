package it.polimi.tiw.dao;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Connection;
import it.polimi.tiw.beans.DegreeCourse;

public class DegreeCourseDao {
	private Connection connection;

	public DegreeCourseDao(Connection connection) {
		super();
		this.connection = connection;
	}
	
	public DegreeCourse getDegreeCourseById(int degreeCourseId) throws SQLException {
		String query = "select * from degreecourse as D where D.DegreeCourseId=?;";
		try (PreparedStatement pstatement = connection.prepareStatement(query);) {
			pstatement.setInt(1, degreeCourseId);
			DegreeCourse degreeCourse = new DegreeCourse();
			try (ResultSet result = pstatement.executeQuery();) {
				if (!result.isBeforeFirst()) // no results, credential check failed
					return null;
				else {
					result.next();				
					degreeCourse.setDegreeCourseId(degreeCourseId);
					degreeCourse.setName(result.getString("Name"));
					degreeCourse.setDescription(result.getString("Description"));
				}
			}
			return degreeCourse;
		}
	}
	
}
