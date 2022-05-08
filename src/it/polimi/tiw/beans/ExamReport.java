package it.polimi.tiw.beans;

import java.sql.Timestamp;

public class ExamReport {
	private int examReportId;
	private Timestamp dateTime;
	private ExamSession examSession;
	
	public ExamReport() {
		super();
	}

	public int getExamReportId() {
		return examReportId;
	}

	public void setExamReportId(int examReportId) {
		this.examReportId = examReportId;
	}

	public Timestamp getDateTime() {
		return dateTime;
	}

	public void setDateTime(Timestamp dateTime) {
		this.dateTime = dateTime;
	}

	public ExamSession getExamSession() {
		return examSession;
	}

	public void setExamSession(ExamSession examSession) {
		this.examSession = examSession;
	}
	
	
}
