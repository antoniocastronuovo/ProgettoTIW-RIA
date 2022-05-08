package it.polimi.tiw.beans;

public class DegreeCourse {
	private int degreeCourseId;
	private String name;
	private String description;
	
	
	
	public DegreeCourse() {
		super();
		// TODO Auto-generated constructor stub
	}

	public DegreeCourse(int degreeCourseId, String name, String description) {
		super();
		this.degreeCourseId = degreeCourseId;
		this.name = name;
		this.description = description;
	}
	
	public int getDegreeCourseId() {
		return degreeCourseId;
	}
	public void setDegreeCourseId(int degreeCourseId) {
		this.degreeCourseId = degreeCourseId;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getDescription() {
		return description;
	}
	public void setDescription(String description) {
		this.description = description;
	}
	
	
}
