export interface WorkplacesData {
	workplaces: Workplace[]
}
export interface Workplace {
	id: number,
		post: string,
		company: string,
		"company-address": string,
		formate: string,
		period: {
			from: string,
			to: string
		},
		description: string,
		structure: string
}