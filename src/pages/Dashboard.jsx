import {
  FileText,
  ClipboardList,
  CircleHelp,
  Presentation,
  BookCheck,
  Sparkles,
  Wand2,
} from "lucide-react";

const tabs = [
  { label: "Lesson Plan", icon: FileText },
  { label: "Worksheet", icon: ClipboardList },
  { label: "Quiz", icon: CircleHelp },
  { label: "Slides", icon: Presentation },
  { label: "Assessment", icon: BookCheck },
  { label: "Activity", icon: Sparkles },
];

function Dashboard() {
  return (
    <div className="hero flex justify-center items-center flex-col gap-4 text-center p-10  bg-krumate-teal mx-auto max-w-6xl mt-20 rounded-4xl">
      <p className="font-medium text-md border w-fit px-3 py-1 rounded-full text-white bg-krumate-teal/50">
        Welcome to the Teacher Document Generator
      </p>
      <h1 className="text-4xl font-bold text-white">
        What would you like to teach today?
      </h1>
      <p className="text-slate-300 text-md">
        Describe your lesson in plain language — KruMate AI creates polished
        teaching materials in seconds.
      </p>
      <section className="w-full rounded-3xl mt-8">
        <div className="max-w-6xl mx-auto">
          {/* Tabs */}
          <div className="flex flex-wrap gap-3 justify-center mb-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;

              return (
                <button
                  key={tab.label}
                  className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-md transition hover:brightness-110 cursor-pointer"
                >
                  <Icon size={15} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Prompt Box */}
          <div className="bg-white rounded-3xl p-6 shadow-2xl mx-30 h-fit">
            <textarea
              placeholder="Generate a Thai worksheet on adjectives for Grade 4"
              className="w-full h-20 resize-none border-none outline-none text-lg text-slate-600 placeholder:text-slate-400"
            />

            <div className="flex items-center justify-between mt-4">
              {/* Suggestions */}
              <div className="flex flex-wrap gap-3">
                <button className="text-sm text-slate-400 hover:text-slate-600">
                  ↗ Create a Grade 6 science l...
                </button>

                <button className="text-sm text-slate-400 hover:text-slate-600">
                  ↗ Generate a Thai worksheet ...
                </button>
              </div>

              {/* Generate Button */}
              <button className="flex items-center gap-2 rounded-full bg-krumate-teal px-6 py-3 font-semibold text-white shadow-md transition hover:scale-105">
                <Wand2 size={18} />
                Generate
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
