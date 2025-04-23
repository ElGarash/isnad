import { Card } from "@/components/ui/card";

interface HadithTextCardProps {
  text: string;
}

function HadithTextCard({ text }: HadithTextCardProps) {
  return (
    <Card className="flex flex-col border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <h2 className="mb-4 text-right text-2xl font-bold">متن الحديث</h2>
      <div className="prose prose-xl dark:prose-invert max-w-none flex-grow overflow-y-auto pl-4">
        <p className="whitespace-pre-wrap text-right leading-relaxed">{text}</p>
      </div>
    </Card>
  );
}

export default HadithTextCard;
