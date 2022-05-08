package it.polimi.tiw.beans;

public class Teacher extends Person {
	
	private String department;
	
	public Teacher() {
		super();
	}

	public String getDepartment() {
		return department;
	}

	public void setDepartment(String department) {
		this.department = department;
	}
	
}
