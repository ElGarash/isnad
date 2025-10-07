import { Card } from "@/components/ui/card";

interface HadithExplanationCardProps {
  explanation: string;
}

function HadithExplanationCard({ explanation }: HadithExplanationCardProps) {
  return (
    <Card className="flex flex-col border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:p-6 md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <h2 className="mb-3 text-right text-xl font-bold md:mb-4 md:text-2xl">
        شرح الحديث (فتح البارى)
      </h2>
      <div className="prose prose-sm md:prose-lg dark:prose-invert max-w-none flex-grow overflow-y-auto pl-2">
        <p className="whitespace-pre-wrap text-right leading-relaxed">
          {explanation}
        </p>
      </div>
    </Card>
  );
}

export default HadithExplanationCard;
