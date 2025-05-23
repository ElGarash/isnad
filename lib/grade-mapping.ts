const gradeMap: Record<string, string> = {
  "Rasool Allah": "رسول الله ﷺ",
  "Prophet's Relative": "من أهل البيت",
  "Prophet's Relative [Non-Muslim]": "من  أقارب النبي (غير مسلم)",
  "Comp.(RA)": "من الصحابة",
  "Comp.(RA) [1st Generation]": "من الصحابة",
  "Comp.(RA) [2nd Generation]": "من الصحابة",
  "Comp.(RA) [3rd Generation]": "من الصحابة",
  "Comp.(RA) [4th generation]": "من الصحابة",
  "Comp.(RA) [6th generation]": "من الصحابة",
  "Comp.(RA) [7th generation]": "من الصحابة",
  "Follower(Tabi')": "من التابعين",
  "Follower(Tabi') [1st Generation]": "من التابعين",
  "Follower(Tabi') [2nd Generation]": "من التابعين",
  "Follower(Tabi') [3rd Generation]": "من التابعين",
  "Follower(Tabi') [4th generation]": "من التابعين",
  "Follower(Tabi') [5th generation]": "من التابعين",
  "Follower(Tabi') [6th generation]": "من التابعين",
  "Follower(Tabi') [7th generation]": "من التابعين",
  "Follower(Tabi') [8th generation]": "من التابعين",
  "Follower(Tabi') [9th generation]": "من التابعين",
  "Follower(Tabi') [11th generation]": "من التابعين",
  "Succ. (Taba' Tabi')": "من تابعي التابعين",
  "Succ. (Taba' Tabi') [6th generation]": "من تابعي التابعين",
  "Succ. (Taba' Tabi') [7th generation]": "من تابعي التابعين",
  "Succ. (Taba' Tabi') [7th generation] [Maliki]": "من تابعي التابعين",
  "Succ. (Taba' Tabi') [8th generation]": "من تابعي التابعين",
  "Succ. (Taba' Tabi') [9th generation]": "من تابعي التابعين",
  "Succ. (Taba' Tabi') [9th generation] [Shafi'ee]": "من تابعي التابعين",
  "Succ. (Taba' Tabi') [10th generation]": "من تابعي التابعين",
  "Succ. (Taba' Tabi') [Hanafi]": "من تابعي التابعين",
  "3rd Century AH": "من علماء القرن الثالث الهجري",
  "3rd Century AH [10th generation]": "من علماء القرن الثالث الهجري",
  "3rd Century AH [10th generation] [Hanafi]": "من علماء القرن الثالث الهجري",
  "3rd Century AH [10th generation] [Hanbali]": "من علماء القرن الثالث الهجري",
  "3rd Century AH [11th generation]": "من علماء القرن الثالث الهجري",
  "3rd Century AH [11th generation] [Hanafi]": "من علماء القرن الثالث الهجري",
  "3rd Century AH [11th generation] [Shafi'ee]": "من علماء القرن الثالث الهجري",
  "3rd Century AH [12th generation]": "من علماء القرن الثالث الهجري",
  "3rd Century AH [Shafi'ee]": "من علماء القرن الثالث الهجري",
  "4th Century AH": "من علماء القرن الرابع الهجري",
  "4th Century AH [Hanbali]": "من علماء القرن الرابع الهجري",
  "4th Century AH [Shafi'ee]": "من علماء القرن الرابع الهجري",
  "4th Century AH [Other]": "من علماء القرن الرابع الهجري",
};

export const getArabicGrade = (grade: string): string => {
  return gradeMap[grade] || grade;
};

export const getBlessings = (grade: string): string => {
  if (["من الصحابة", "من التابعين"].includes(grade)) {
    return "رضي الله عنه";
  } else if (
    [
      "من تابعي التابعين",
      "من علماء القرن الثالث الهجري",
      "من علماء القرن الرابع الهجري",
    ].includes(grade)
  ) {
    return "رحمه الله";
  }
  return "";
};
