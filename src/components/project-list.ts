import Component from "./base.js";
import ProjectItem from "./project.js";
import { projectState } from "../state/project-state.js";
import { ProjectStatus } from "../model/project-status-enum.js";
import { Project } from "../model/project.js";
import autobind from "../utils/autobind.js";
import { DragTarget } from "../model/drag-target.js";

export default class ProjectList
	extends Component<HTMLDivElement, HTMLElement>
	implements DragTarget
{
	assignedProjects: Project[];

	constructor(private type: "active" | "finished") {
		super("project-list", "app", false, `${type}-projects`);
		this.assignedProjects = [];

		this.configure();
		this.renderContent();
	}

	@autobind
	dragOverHandler(event: DragEvent) {
		if (event.dataTransfer && event.dataTransfer.types[0] === "text/plain") {
			event.preventDefault();
			const listEl = this.element.querySelector("ul")!;
			listEl.classList.add("droppable");
		}
	}

	@autobind
	dropHandler(event: DragEvent) {
		const prjId = event.dataTransfer!.getData("text/plain");
		projectState.moveProject(
			prjId,
			this.type === "active" ? ProjectStatus.Active : ProjectStatus.Finished
		);

		const listEl = this.element.querySelector("ul")!;
		listEl.classList.remove("droppable");
	}

	@autobind
	dragLeaveHandler(_: DragEvent) {
		const listEl = this.element.querySelector("ul")!;
		listEl.classList.remove("droppable");
	}

	private rendersProjects() {
		const listEl = document.getElementById(
			`${this.type}-projects-list`
		)! as HTMLUListElement;

		listEl.innerHTML = "";

		for (const prjItem of this.assignedProjects) {
			new ProjectItem(this.element.querySelector("ul")!.id, prjItem);
		}
	}

	configure() {
		this.element.addEventListener("dragover", this.dragOverHandler);
		this.element.addEventListener("dragleave", this.dragLeaveHandler);
		this.element.addEventListener("drop", this.dropHandler);

		projectState.addListener((projects: Project[]) => {
			const relevantProjects = projects.filter((prj) => {
				if (this.type === "active") {
					return prj.status === ProjectStatus.Active;
				} else return prj.status === ProjectStatus.Finished;
			});
			this.assignedProjects = relevantProjects;
			this.rendersProjects();
		});
	}

	renderContent() {
		const listId = `${this.type}-projects-list`;
		this.element.querySelector("ul")!.id = listId;
		this.element.querySelector("h2")!.textContent =
			this.type.toUpperCase() + " PROJECTS";
	}
}
