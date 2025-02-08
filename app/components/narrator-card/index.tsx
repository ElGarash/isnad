import "./index.scss";

interface NarratorPerson {
  id: string;
  name: string;
  displayName?: string;
  death?: string;
  birthPlace?: string;
  deathPlace?: string;
  generation: number;
  rank: number;
}

function NarratorCard({ person }: { person: NarratorPerson }) {
  return (
    <div className="narrator-node">
      <div className="narrator-header">
        <div className="narrator-name">{person.displayName || person.name}</div>
        <div className="narrator-blessing">
          {person.death ? `d. ${person.death}` : ""}
        </div>
      </div>
      <div className="narrator-generation"></div>
      <div className="narrator-grade">
        <div className="grade-title">{person.rank}</div>
      </div>
    </div>
  );
}

export default NarratorCard;
