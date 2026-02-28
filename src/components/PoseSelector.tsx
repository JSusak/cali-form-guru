import { poses, categoryLabels, type PoseCategory } from "@/lib/poses";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PoseSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function PoseSelector({ value, onChange }: PoseSelectorProps) {
  const categories: PoseCategory[] = ["calisthenics", "aerial", "pole"];

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select the pose you attempted" />
      </SelectTrigger>
      <SelectContent>
        {categories.map((cat) => (
          <SelectGroup key={cat}>
            <SelectLabel className="font-display">{categoryLabels[cat]}</SelectLabel>
            {poses
              .filter((p) => p.category === cat)
              .map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}
