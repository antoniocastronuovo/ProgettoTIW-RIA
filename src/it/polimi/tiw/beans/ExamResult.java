package it.polimi.tiw.beans;

public class ExamResult {
	private Student student;
	private ExamSession examSession;
	private int grade;
	private boolean laude;
	private String gradeStatus;
	private ExamReport examReport;
		
	public ExamResult() {
		super();
	}

	public Student getStudent() {
		return student;
	}

	public void setStudent(Student student) {
		this.student = student;
	}

	public ExamSession getExamSession() {
		return examSession;
	}

	public void setExamSession(ExamSession examSession) {
		this.examSession = examSession;
	}

	public int getGrade() {
		return grade;
	}

	public void setGrade(int grade) {
		this.grade = grade;
	}

	public boolean isLaude() {
		return laude;
	}

	public void setLaude(boolean laude) {
		this.laude = laude;
	}

	public String getGradeStatus() {
		return gradeStatus;
	}

	public void setGradeStatus(String gradeStatus) {
		this.gradeStatus = gradeStatus;
	}
	
	public boolean isEditable() {
		return gradeStatus.equals("NON INSERITO") || gradeStatus.equals("INSERITO");
	}

	public ExamReport getExamReport() {
		return examReport;
	}

	public void setExamReport(ExamReport examReport) {
		this.examReport = examReport;
	}

}
