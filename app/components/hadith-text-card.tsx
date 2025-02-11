import { Card } from "@/components/ui/card";

interface HadithTextCardProps {
  text: string;
}

function HadithTextCard({ text }: HadithTextCardProps) {
  return (
    <Card className="mb-6 p-6 border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
      <h2 className="text-2xl font-bold mb-4 text-right">متن الحديث</h2>
      <div className="prose prose-xl dark:prose-invert max-w-none">
        <p
          className="text-right leading-relaxed whitespace-pre-wrap"
          style={{ textAlignLast: "right" }}
        >
          {text}
        </p>
      </div>
    </Card>
  );
}

export default HadithTextCard;
