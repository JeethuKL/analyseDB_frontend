"use client";

import { SavedVisualizationsService } from "@/services/savedVisualizations";
import { Visualization } from "@/components/dashboard/Visualization";
import { useEffect, useState } from "react";
import { VisualizationData } from "@/types";

interface SavedVisualization extends VisualizationData {
  id: string;
  savedAt: string;
  title: string;
}

export default function VisualizationsPage() {
  const [visualizations, setVisualizations] = useState<SavedVisualization[]>([]);

  useEffect(() => {
    setVisualizations(SavedVisualizationsService.getAllVisualizations());
  }, []);

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this visualization?")) {
      SavedVisualizationsService.deleteVisualization(id);
      setVisualizations(SavedVisualizationsService.getAllVisualizations());
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Saved Visualizations
      </h1>
      
      {visualizations.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">
          No visualizations saved yet. When analyzing data, you can save visualizations from the chat interface.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visualizations.map((viz) => (
            <div 
              key={viz.id} 
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
            >
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {viz.title}
                </h3>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <Visualization visualization={viz} noSaveButton />
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(viz.savedAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => handleDelete(viz.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
