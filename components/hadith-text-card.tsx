import { Card } from "@/components/ui/card";

interface HadithTextCardProps {
  text: string;
}

function HadithTextCard({ text }: HadithTextCardProps) {
  return (
    <Card className="p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col">
      <h2 className="text-2xl font-bold mb-4 text-right">متن الحديث</h2>
      <div className="prose prose-xl dark:prose-invert max-w-none overflow-y-auto flex-grow pl-4">
        <p className="text-right leading-relaxed whitespace-pre-wrap">{text}</p>
      </div>
    </Card>
  );
}

export default HadithTextCard;
