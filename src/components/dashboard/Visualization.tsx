import { useEffect, useRef, useState } from "react";
import { VisualizationData } from "@/types";
import { SavedVisualizationsService } from "@/services/savedVisualizations";

// This will hold the actual Plotly object
let Plotly: any = null;

interface VisualizationProps {
  visualization: VisualizationData;
  noSaveButton?: boolean;
}

export const Visualization = ({
  visualization,
  noSaveButton,
}: VisualizationProps) => {
  const visualizationRef = useRef<HTMLDivElement>(null);
  const [visualizationId] = useState(
    `viz-${Math.random().toString(36).substr(2, 9)}`
  );
  const [plotlyLoaded, setPlotlyLoaded] = useState(false);

  // Track when Plotly is loaded
  useEffect(() => {
    if (typeof window !== "undefined") {
      import("plotly.js-dist").then((mod) => {
        Plotly = mod.default || mod;
        setPlotlyLoaded(true);
      });
    }
  }, []);

  // Render visualization when data changes or Plotly loads
  useEffect(() => {
    if (visualization && visualizationRef.current && plotlyLoaded) {
      try {
        // Clear previous visualization
        visualizationRef.current.innerHTML = "";

        // Create a container for the visualization
        const vizContainer = document.createElement("div");
        vizContainer.id = visualizationId;
        vizContainer.style.width = "100%";
        vizContainer.style.height = "300px";
        visualizationRef.current.appendChild(vizContainer);

        // Handle JSON data wrapped in Markdown code blocks
        if (
          visualization.plotly_code &&
          visualization.plotly_code.trim().startsWith("```json")
        ) {
          // Extract JSON from markdown code block
          const jsonMatch = visualization.plotly_code.match(
            /```json\s*([\s\S]*?)\s*```/
          );

          if (jsonMatch && jsonMatch[1]) {
            try {
              // Parse the extracted JSON
              const jsonData = JSON.parse(jsonMatch[1].trim());
              console.log("Parsed JSON data:", jsonData);

              // If it has columns and rows, render as a chart
              if (
                jsonData.columns &&
                jsonData.rows &&
                Array.isArray(jsonData.rows)
              ) {
                renderDataResult(jsonData, visualizationId);
                return;
              }
            } catch (jsonError) {
              console.error("Error parsing JSON from code block:", jsonError);
            }
          }
        }

        // Proceed with standard Plotly code handling if above didn't return
        if (
          visualization.plotly_code &&
          visualization.plotly_code.trim() !== ""
        ) {
          // Log the code for debugging
          console.log("Executing Plotly code:", visualization.plotly_code);

          // Safety mechanism to execute only valid plotly code
          const sanitizedCode = visualization.plotly_code
            .replace(/document\./g, "") // Prevent direct document access
            .replace(/window\./g, ""); // Prevent window access

          // Check if code has valid Plotly commands
          if (
            sanitizedCode.includes("Plotly.newPlot") ||
            sanitizedCode.includes("Plotly.plot") ||
            sanitizedCode.includes("Plotly.react")
          ) {
            // Create a function that will execute the code with plotly available
            const executePlotlyCode = new Function(
              "Plotly",
              "container",
              `
              try {
                ${sanitizedCode}
              } catch (e) {
                console.error('Error executing Plotly code:', e);
                return false;
              }
              return true;
            `
            );

            // Execute the code with the Plotly library and container ID
            const success = executePlotlyCode(Plotly, visualizationId);

            if (!success) {
              // Fallback to basic chart if execution failed
              renderBasicChart(visualization, visualizationId);
            }
          } else {
            // If code doesn't contain valid Plotly commands, use basic chart
            renderBasicChart(visualization, visualizationId);
          }
        } else {
          // Handle case where no plotly_code is provided but there's data
          renderBasicChart(visualization, visualizationId);
        }
      } catch (error) {
        console.error("Error rendering visualization:", error);
        if (visualizationRef.current) {
          visualizationRef.current.innerHTML =
            '<p class="p-3 text-red-500">Error rendering visualization</p>';
        }
      }
    }
  }, [visualization, visualizationId, plotlyLoaded]);

  // Function to render data results
  const renderDataResult = (
    data: { columns: string[]; rows: any[] },
    containerId: string
  ) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
      if (
        (visualization.type === "text" || visualization.type === "table") &&
        data.columns.length === 1 &&
        data.rows.length === 1
      ) {
        // Single value, show as centered result
        container.innerHTML = `
          <div class="flex flex-col justify-center items-center py-12 h-full">
            <div class="mb-2 font-bold text-white text-2xl">Results</div>
            <div class="mb-2 font-extrabold text-indigo-300 text-4xl">${
              data.rows[0][data.columns[0]]
            }</div>
            <div class="text-gray-400 text-base">${data.columns[0]}</div>
          </div>
        `;
      } else if (visualization.type === "table") {
        const maxRowsToShow = 10; // Limit number of rows to display
        const rowCount = data.rows.length;
        const rowsToShow = Math.min(rowCount, maxRowsToShow);

        // Select columns to display - limit to reasonable number for display
        let columnsToDisplay = data.columns;
        if (data.columns.length > 6) {
          // If too many columns, prioritize important ones or take first 6
          // This is a heuristic - you can customize what columns are most important
          const priorityColumns = [
            "name",
            "email",
            "company_name",
            "role_title",
            "start_date",
            "end_date",
          ];
          const foundColumns = priorityColumns.filter((col) =>
            data.columns.includes(col)
          );

          // If we found at least 3 priority columns, use those, otherwise take first 6
          columnsToDisplay =
            foundColumns.length >= 3 ? foundColumns : data.columns.slice(0, 6);
        }

        container.innerHTML = `
          <div class="p-4 overflow-auto font-mono text-sm" style="max-height: 500px;">
            <h3 class="mb-2 font-semibold text-lg">${
              visualization.type === "table" ? "Table Results" : "Data Results"
            }</h3>
            <table class="divide-y divide-gray-300 dark:divide-gray-600 min-w-full">
              <thead>
                <tr>
                  ${columnsToDisplay
                    .map(
                      (col) =>
                        `<th class="px-3 py-2 font-medium text-gray-500 dark:text-gray-400 text-xs text-left uppercase tracking-wider">${col}</th>`
                    )
                    .join("")}
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                ${data.rows
                  .slice(0, rowsToShow)
                  .map(
                    (row) =>
                      `<tr class="hover:bg-gray-50 dark:hover:bg-gray-800">
                    ${columnsToDisplay
                      .map((col) => {
                        // Format cell values appropriately
                        let cellValue =
                          row[col] !== undefined ? String(row[col]) : "";

                        // Truncate long text
                        if (cellValue && cellValue.length > 100) {
                          cellValue = cellValue.substring(0, 97) + "...";
                        }

                        // Format dates if they appear to be dates
                        if (
                          col.includes("date") &&
                          cellValue &&
                          !isNaN(Date.parse(cellValue))
                        ) {
                          const date = new Date(cellValue);
                          cellValue = date.toLocaleDateString();
                        }

                        // Format URLs as links
                        if (
                          (col.includes("url") || col.includes("link")) &&
                          (cellValue.startsWith("http://") ||
                            cellValue.startsWith("https://"))
                        ) {
                          return `<td class="px-3 py-2 text-xs">
                          <a href="${cellValue}" target="_blank" class="text-blue-500 hover:underline">${cellValue}</a>
                        </td>`;
                        }

                        return `<td class="px-3 py-2 text-xs">${cellValue}</td>`;
                      })
                      .join("")}
                  </tr>`
                  )
                  .join("")}
              </tbody>
            </table>
            ${
              rowCount > maxRowsToShow
                ? `<p class="mt-2 text-gray-500 dark:text-gray-400 text-xs">
                Showing ${maxRowsToShow} of ${rowCount} rows
              </p>`
                : ""
            }
            ${
              data.columns.length > columnsToDisplay.length
                ? `<p class="mt-2 text-gray-500 dark:text-gray-400 text-xs">
                Displaying ${columnsToDisplay.length} of ${data.columns.length} columns
              </p>`
                : ""
            }
          </div>
        `;
      } else if (visualization.type === "bar") {
        // For bar chart, render the actual data
        const xValues = data.rows.map((row) => String(row[data.columns[0]]));
        const yValues = data.rows.map((row) => Number(row[data.columns[1]]));

        Plotly.newPlot(
          containerId,
          [
            {
              x: xValues,
              y: yValues,
              type: "bar",
              marker: {
                color: "rgb(93, 164, 214)",
              },
            },
          ],
          {
            title: `${data.columns[1]} by ${data.columns[0]}`,
            xaxis: { title: data.columns[0] },
            yaxis: { title: data.columns[1] },
            margin: { t: 30, b: 70, l: 60, r: 20 },
          }
        );
      } else if (visualization.type === "pie" && data.columns.length >= 2) {
        // For pie chart, use first column as labels and second as values
        Plotly.newPlot(
          containerId,
          [
            {
              values: data.rows.map((row) => Number(row[data.columns[1]])),
              labels: data.rows.map((row) => String(row[data.columns[0]])),
              type: "pie",
            },
          ],
          {
            title: `Distribution of ${data.columns[1]} by ${data.columns[0]}`,
            margin: { t: 30, b: 10, l: 10, r: 10 },
          }
        );
      } else {
        // Default chart for other types
        renderBasicChart(visualization, containerId);
      }
    } catch (err) {
      console.error("Error rendering data result:", err);
      container.innerHTML =
        '<div class="p-3 text-red-500">Could not render visualization from data</div>';
    }
  };

  // Helper function to render basic charts when no plotly_code is provided
  const renderBasicChart = (
    visualization: VisualizationData,
    containerId: string
  ) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
      if (visualization.type === "bar") {
        // Render a basic bar chart
        Plotly.newPlot(
          containerId,
          [
            {
              x: ["Sample A", "Sample B", "Sample C", "Sample D"],
              y: [10, 15, 13, 17],
              type: "bar",
            },
          ],
          {
            title: "Sample Bar Chart",
            margin: { t: 30, b: 40, l: 30, r: 10 },
          }
        );
      } else if (
        visualization.type === "line" ||
        visualization.type === "scatter"
      ) {
        // Render a basic line chart
        Plotly.newPlot(
          containerId,
          [
            {
              x: [1, 2, 3, 4, 5],
              y: [10, 15, 13, 17, 20],
              type: visualization.type,
            },
          ],
          {
            title: `Sample ${
              visualization.type === "line" ? "Line" : "Scatter"
            } Chart`,
            margin: { t: 30, b: 40, l: 30, r: 10 },
          }
        );
      } else if (visualization.type === "pie") {
        // Render a basic pie chart
        Plotly.newPlot(
          containerId,
          [
            {
              values: [30, 20, 15, 35],
              labels: ["Category A", "Category B", "Category C", "Category D"],
              type: "pie",
            },
          ],
          {
            title: "Sample Pie Chart",
            margin: { t: 30, b: 10, l: 10, r: 10 },
          }
        );
      } else if (visualization.type === "text") {
        // For text visualizations, just display formatted text
        container.innerHTML = `<div class="p-3 overflow-auto font-mono text-sm">${
          visualization.plotly_code || "No data available"
        }</div>`;
      } else {
        // Generic fallback for any chart type
        container.innerHTML = `<div class="p-3 text-center">
          <p class="text-gray-500">Chart type "${visualization.type}" not directly supported</p>
          <p class="mt-1 text-sm">Try asking for a bar, line, or pie chart</p>
        </div>`;
      }
    } catch (err) {
      console.error("Error in fallback visualization:", err);
      container.innerHTML =
        '<div class="p-3 text-red-500">Could not render visualization</div>';
    }
  };

  return (
    <div className="flex flex-col items-center bg-gray-50 dark:bg-gray-800 mt-3 border border-gray-200 dark:border-gray-600 rounded">
      <div
        ref={visualizationRef}
        className="w-full"
        style={{
          minHeight: "350px",
          height: "400px",
          maxHeight: "500px",
          maxWidth: "900px",
          width: "100%",
        }}
      ></div>
      <div className="flex flex-row justify-between items-center px-4 py-2 border-gray-200 dark:border-gray-700 border-t w-full">
        <span className="text-gray-500 dark:text-gray-400 text-xs">
          Visualization type: {visualization.type}
        </span>
        {!noSaveButton && (
          <button
            onClick={() => {
              const title = prompt("Enter a title for this visualization");
              if (title) {
                SavedVisualizationsService.saveVisualization(
                  visualization,
                  title
                );
                alert("Visualization saved successfully!");
              }
            }}
            className="inline-flex items-center font-medium text-indigo-600 hover:text-indigo-800 text-xs"
          >
            <svg
              className="mr-1 w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
            Save to Dashboard
          </button>
        )}
      </div>
    </div>
  );
};
