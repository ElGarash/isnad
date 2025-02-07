import "./index.scss"

interface NarratorPerson {
  id: string
  name: string
  generation: "Companion" | "Tabai" | "Taba Tabai" | "3rd century scholar"
  grade: 1 | 2 | 3 | 4 | 5 | 6
  description: string
}

function NarratorCard({ person }: { person: NarratorPerson }) {
  if (!person) return null

  const getGradeTitle = (grade: number) => {
    switch (grade) {
      case 1:
        return "الراوي"
      case 2:
        return "الشيخ"
      case 3:
        return "المحدث"
      case 4:
        return "الحافظ"
      case 5:
        return "الحاكم"
      case 6:
        return "أمير المؤمنين في الحديث"
      case 7:
        return "سيد ولد آدم"
      default:
        return "الراوي"
    }
  }

  return (
    <div className="narrator-node">
      <div className="narrator-header">
        <div className="narrator-name">{person.name}</div>
        <div className="narrator-blessing">{person.id === "prophet-pbuh"? "صلي الله عليه وسلم": "رضي الله عنه"}</div>
      </div>
      <div className="narrator-generation">{person.id === "prophet-pbuh"? "خاتم المرسلين": person.generation}</div>
      <div className="narrator-grade">
        <div className="grade-title">{getGradeTitle(person.grade)}</div>
      </div>
    </div>
  )
}

export default NarratorCard

