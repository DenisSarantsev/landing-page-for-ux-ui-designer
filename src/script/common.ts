interface WorkplacesData {
	workplaces: Workplace[]
}
interface Workplace {
	id: number,
		post: string,
		company: string,
		"company-address": string,
		formate: string,
		period: {
			from: string,
			to: string
		},
		description: string
}

// Функция загрузки JSON
export const loadWorkplaces = async (): Promise<Workplace[]> => {
  try {
    const response = await fetch('/data/workplaces.json');
    const data: WorkplacesData = await response.json();
    return data.workplaces;
  } catch (error) {
    console.error('Error loading projects:', error);
    return [];
  }
};