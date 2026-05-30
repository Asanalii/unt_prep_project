// src/utils/topics.js
// Frontend mirror of the backend TOPIC_DISPLAY_NAMES.
// Used so topic codes render with proper names everywhere on the dashboard,
// independent of what was stored in a recommendation row.

const TOPIC_LABELS = {
  algebra: "Algebra",
  equations: "Equations",
  functions: "Functions",
  inequalities: "Inequalities",
  sequences: "Sequences",
  systems_of_equations: "Systems of Equations",
  trigonometry: "Trigonometry",
  // extras (in case the question bank is expanded later)
  analysis: "Analysis",
  plane_geometry: "Plane Geometry",
  solid_geometry: "Solid Geometry",
  vectors: "Vectors",
};

export function topicLabel(code) {
  return TOPIC_LABELS[code] || code;
}
