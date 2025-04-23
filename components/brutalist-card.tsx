interface BrutalistCardProps {
  children: React.ReactNode;
  className?: string;
}

export default function BrutalistCard({
  children,
  className = "",
}: BrutalistCardProps) {
  return (
    <div
      className={`border-4 border-black bg-white p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${className}`}
    >
      {children}
    </div>
  );
}
