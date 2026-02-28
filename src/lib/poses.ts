export type PoseCategory = "calisthenics" | "aerial" | "pole";

export interface Pose {
  id: string;
  name: string;
  category: PoseCategory;
}

export const poses: Pose[] = [
  // Calisthenics
  { id: "handstand", name: "Handstand", category: "calisthenics" },
  { id: "planche", name: "Planche", category: "calisthenics" },
  { id: "front-lever", name: "Front Lever", category: "calisthenics" },
  { id: "back-lever", name: "Back Lever", category: "calisthenics" },
  { id: "l-sit", name: "L-Sit", category: "calisthenics" },
  { id: "human-flag", name: "Human Flag", category: "calisthenics" },
  { id: "muscle-up", name: "Muscle Up", category: "calisthenics" },
  { id: "pistol-squat", name: "Pistol Squat", category: "calisthenics" },
  { id: "one-arm-pullup", name: "One-Arm Pull-Up", category: "calisthenics" },
  // Aerial
  { id: "straddle-back", name: "Straddle Back Balance", category: "aerial" },
  { id: "hip-key", name: "Hip Key", category: "aerial" },
  { id: "star", name: "Star", category: "aerial" },
  { id: "gazelle", name: "Gazelle", category: "aerial" },
  { id: "meathook", name: "Meathook", category: "aerial" },
  { id: "bird-nest", name: "Bird's Nest", category: "aerial" },
  { id: "ankle-hang", name: "Ankle Hang", category: "aerial" },
  // Pole
  { id: "ayesha", name: "Ayesha", category: "pole" },
  { id: "iron-x", name: "Iron X", category: "pole" },
  { id: "jade-split", name: "Jade Split", category: "pole" },
  { id: "superman", name: "Superman", category: "pole" },
  { id: "allegra", name: "Allegra", category: "pole" },
  { id: "butterfly", name: "Butterfly", category: "pole" },
  { id: "brass-monkey", name: "Brass Monkey", category: "pole" },
];

export const categoryLabels: Record<PoseCategory, string> = {
  calisthenics: "Calisthenics",
  aerial: "Aerial Silks / Hoop / Trapeze",
  pole: "Pole Fitness",
};
