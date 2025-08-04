export interface Project {
	"id": number,
	"project-name": string,
	"description": string,
	"structure": string
}
export interface ProjectsData {
  projects: Project[];
}