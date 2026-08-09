import { useState } from "react";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { QuestionnaireForm } from "./components/form/QuestionnaireForm";
import { ResultsDashboard } from "./components/results/ResultsDashboard";
import { MasterView } from "./components/master/MasterView";
import { DEFAULT_ANSWERS } from "./lib/defaults";
import { LanguageProvider } from "./i18n/LanguageContext";
import type { QuestionnaireAnswers } from "./types/finance";

type Stage = "form" | "results";

function AppContent() {
  const [stage, setStage] = useState<Stage>("form");
  const [answers, setAnswers] = useState<QuestionnaireAnswers>(DEFAULT_ANSWERS);
  const [isMasterOpen, setIsMasterOpen] = useState(false);

  const handleUpdate = (patch: Partial<QuestionnaireAnswers>) => {
    setAnswers((prev) => ({ ...prev, ...patch }));
  };

  const goToForm = () => {
    setIsMasterOpen(false);
    setStage("form");
  };

  return (
    <div className="min-h-screen">
      <Header isMasterOpen={isMasterOpen} onToggleMaster={() => setIsMasterOpen((prev) => !prev)} />
      <main
        className={`mx-auto px-4 py-8 sm:py-10 ${
          isMasterOpen ? "max-w-6xl" : stage === "form" ? "max-w-3xl" : "max-w-4xl"
        }`}
      >
        {isMasterOpen ? (
          <MasterView
            answers={answers}
            onUpdate={handleUpdate}
            onEditAnswers={goToForm}
            onClose={() => setIsMasterOpen(false)}
          />
        ) : stage === "form" ? (
          <QuestionnaireForm
            answers={answers}
            onUpdate={handleUpdate}
            onSubmit={() => setStage("results")}
          />
        ) : (
          <ResultsDashboard answers={answers} onEditAnswers={() => setStage("form")} />
        )}
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
