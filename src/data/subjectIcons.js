import { Calculator, FlaskConical, BookOpen, Globe2, Users, Sparkles } from "lucide-react";

const SUBJECT_ICONS = {
  คณิตศาสตร์: Calculator,
  วิทยาศาสตร์: FlaskConical,
  ภาษาไทย: BookOpen,
  ภาษาอังกฤษ: Globe2,
  สังคมศึกษา: Users,
};

export function getSubjectIcon(name) {
  return SUBJECT_ICONS[name] || Sparkles;
}