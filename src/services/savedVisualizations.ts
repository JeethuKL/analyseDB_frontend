import { VisualizationData } from "@/types";

const STORAGE_KEY = "savedVisualizations";

interface SavedVisualization extends VisualizationData {
  id: string;
  savedAt: string;
  title: string;
}

export const SavedVisualizationsService = {
  /**
   * Get all saved visualizations
   */
  getAllVisualizations(): SavedVisualization[] {
    if (typeof window === "undefined") return [];

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Error getting saved visualizations:", error);
      return [];
    }
  },

  /**
   * Save a visualization
   */
  saveVisualization(visualization: VisualizationData, title: string): SavedVisualization {
    const visualizations = this.getAllVisualizations();
    
    const newVisualization: SavedVisualization = {
      ...visualization,
      id: `viz-${Date.now()}`,
      savedAt: new Date().toISOString(),
      title
    };

    visualizations.unshift(newVisualization);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(visualizations));
    
    return newVisualization;
  },

  /**
   * Delete a visualization
   */
  deleteVisualization(id: string): boolean {
    const visualizations = this.getAllVisualizations();
    const updatedVisualizations = visualizations.filter(v => v.id !== id);
    
    if (updatedVisualizations.length === visualizations.length) {
      return false;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedVisualizations));
    return true;
  }
};
