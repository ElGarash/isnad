import { Card } from "@/components/ui/card";

interface HadithExplanationCardProps {
  explanation: string;
}

function HadithExplanationCard({ explanation }: HadithExplanationCardProps) {
  return (
    <Card className="p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col">
      <h2 className="text-2xl font-bold mb-4 text-right">
        شرح الحديث (فتح البارى)
      </h2>
      <div className="prose prose-lg dark:prose-invert max-w-none overflow-y-auto flex-grow pl-2">
        <p className="text-right leading-relaxed whitespace-pre-wrap">
          {explanation}
        </p>
      </div>
    </Card>
  );
}

export default HadithExplanationCard;
