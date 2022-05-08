package it.polimi.tiw.beans;

public class Student extends Person{
	private int matricola;
	private DegreeCourse degreeCourse;
	
	public Student() {
		super();
		// TODO Auto-generated constructor stub
	}
	
	public int getMatricola() {
		return matricola;
	}
	public void setMatricola(int matricola) {
		this.matricola = matricola;
	}

	public DegreeCourse getDegreeCourse() {
		return degreeCourse;
	}

	public void setDegreeCourse(DegreeCourse degreeCourse) {
		this.degreeCourse = degreeCourse;
	}
	
	
	
}
