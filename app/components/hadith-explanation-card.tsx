import { Card } from "@/components/ui/card";

interface HadithExplanationCardProps {
  explanation: string;
}

function HadithExplanationCard({ explanation }: HadithExplanationCardProps) {
  return (
    <Card className="p-6 border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
      <h2 className="text-2xl font-bold mb-4 text-right">شرح الحديث</h2>
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="text-right leading-relaxed">{explanation}</p>
      </div>
    </Card>
  );
}

export default HadithExplanationCard;
