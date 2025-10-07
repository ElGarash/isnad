import { Card } from "@/components/ui/card";

interface HadithTextCardProps {
  text: string;
}

function HadithTextCard({ text }: HadithTextCardProps) {
  return (
    <Card className="flex flex-col border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:p-6 md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <h2 className="mb-3 text-right text-xl font-bold md:mb-4 md:text-2xl">
        متن الحديث
      </h2>
      <div className="prose prose-base md:prose-xl dark:prose-invert max-w-none flex-grow overflow-y-auto pl-3 md:pl-4">
        <p className="whitespace-pre-wrap text-right leading-relaxed">{text}</p>
      </div>
    </Card>
  );
}

export default HadithTextCard;
