import React, { useState } from "react";
import { type ClassificationResult } from "@shared/image-analysis";
import { ChevronDown } from "lucide-react";

interface ResultDisplayProps {
  result: ClassificationResult | null;
  isLoading: boolean;
  error: string | null;
  onReset?: () => void;
}

const AnalysisSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}> = ({ title, icon, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-700 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-700/50 focus:outline-none transition-colors"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          {icon}
          <span className="font-semibold text-gray-200 text-sm">{title}</span>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && <div className="px-4 pb-4 bg-gray-900/50">{children}</div>}
    </div>
  );
};

const AIGenerationAnalysis: React.FC<{
  analysis: ClassificationResult["flags"]["ai_generation_analysis"];
}> = ({ analysis }) => {
  const likelihoodColors: Record<
    string,
    string
  > = {
    High: "bg-red-500 text-white",
    Medium: "bg-yellow-500 text-gray-900",
    Low: "bg-blue-500 text-white",
    Unlikely: "bg-green-500 text-white",
  };

  return (
    <div className="space-y-3 text-sm">
      <div className="flex items-center justify-between">
        <span className="text-gray-400">AI Probability</span>
        <span
          className={`px-3 py-1 text-xs font-bold rounded-full ${likelihoodColors[analysis.likelihood] || "bg-gray-600"}`}
        >
          {analysis.likelihood}
        </span>
      </div>
      <div className="space-y-1">
        <span className="text-gray-400 text-xs">
          Confidence: {(analysis.confidence_score * 100).toFixed(1)}%
        </span>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-cyan-400 h-2 rounded-full transition-all"
            style={{ width: `${analysis.confidence_score * 100}%` }}
          />
        </div>
      </div>
      {analysis.evidence.length > 0 && (
        <div>
          <h6 className="text-xs font-semibold text-gray-400 mb-2">
            Visual Cues:
          </h6>
          <ul className="space-y-1">
            {analysis.evidence.slice(0, 3).map((item, index) => (
              <li
                key={index}
                className="text-xs text-gray-300 flex items-start gap-2"
              >
                <span className="text-yellow-300 mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const DetailItem: React.FC<{
  label: string;
  value: string | boolean | string[];
}> = ({ label, value }) => {
  let displayValue: React.ReactNode;

  if (typeof value === "boolean") {
    displayValue = (
      <span
        className={`font-semibold text-xs ${
          value ? "text-green-400" : "text-red-400"
        }`}
      >
        {value ? "Yes" : "No"}
      </span>
    );
  } else if (Array.isArray(value)) {
    displayValue = (
      <div className="flex flex-wrap gap-1">
        {value.slice(0, 4).map((item, index) => (
          <span key={index} className="px-2 py-0.5 text-xs bg-gray-700 rounded">
            {item}
          </span>
        ))}
      </div>
    );
  } else {
    displayValue = (
      <span className="text-gray-300 text-xs text-right">{value}</span>
    );
  }

  return (
    <div className="flex items-start justify-between py-2 text-sm">
      <span className="text-gray-400 text-xs">{label}</span>
      <div className="text-right max-w-[60%]">{displayValue}</div>
    </div>
  );
};

export const ResultDisplay: React.FC<ResultDisplayProps> = ({
  result,
  isLoading,
  error,
  onReset,
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <div className="inline-flex items-center justify-center w-10 h-10 mb-3">
          <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="font-semibold text-gray-300 text-sm">
          Performing Deep Analysis...
        </p>
        <p className="text-gray-500 text-xs mt-1">
          The AI is classifying content, style, and IP risks. Please wait.
        </p>
      </div>
    );
  }

  if (error && !result) {
    return null;
  }

  if (!result) {
    return null;
  }

  const { flags, classification, license } = result;

  const statusIcons: Record<string, React.ReactNode> = {
    CAN_REGISTER: (
      <div className="w-6 h-6 rounded-full bg-green-500/20 border border-green-500 flex items-center justify-center text-green-400 text-sm font-bold">
        ✓
      </div>
    ),
    CANNOT_REGISTER: (
      <div className="w-6 h-6 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center text-red-400 text-sm font-bold">
        ✕
      </div>
    ),
    REQUIRES_REVIEW: (
      <div className="w-6 h-6 rounded-full bg-yellow-500/20 border border-yellow-500 flex items-center justify-center text-yellow-400 text-sm font-bold">
        !
      </div>
    ),
  };

  const buttonClasses: Record<string, string> = {
    green: "bg-green-600 hover:bg-green-700 disabled:opacity-50",
    red: "bg-red-600 hover:bg-red-700 disabled:opacity-50",
    yellow:
      "bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-gray-900",
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden max-w-2xl">
      <div className="p-4">
        <h3 className="text-sm font-semibold mb-1 text-gray-200">
          Analysis Complete
        </h3>
        <p className="text-gray-400 mb-3 text-xs">
          Group {classification.group}: {classification.type} -{" "}
          {classification.classification}
        </p>

        <div
          className={`p-3 rounded-lg mb-4 border text-sm ${
            license.color === "green"
              ? "bg-green-900/20 border-green-700/50"
              : license.color === "red"
                ? "bg-red-900/20 border-red-700/50"
                : "bg-yellow-900/20 border-yellow-700/50"
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            {statusIcons[license.status]}
            <h4
              className={`text-sm font-bold ${
                license.color === "green"
                  ? "text-green-300"
                  : license.color === "red"
                    ? "text-red-300"
                    : "text-yellow-300"
              }`}
            >
              {license.title}
            </h4>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            {license.description}
          </p>
        </div>

        <div className="rounded-lg border border-gray-700 bg-gray-800/50 overflow-hidden text-xs">
          <AnalysisSection
            title="AI Generation Analysis"
            icon={<span className="text-yellow-300">🤖</span>}
            defaultOpen={true}
          >
            <AIGenerationAnalysis analysis={flags.ai_generation_analysis} />
          </AnalysisSection>

          <AnalysisSection
            title="Content & Safety Analysis"
            icon={<span className="text-red-400">🛡️</span>}
          >
            <DetailItem
              label="Explicit Content"
              value={flags.content_analysis.contains_explicit_content}
            />
            <DetailItem
              label="Violence"
              value={flags.content_analysis.contains_violence}
            />
            <DetailItem
              label="Sensitive Subject"
              value={flags.content_analysis.contains_sensitive_subject}
            />
            {flags.content_analysis.description && (
              <DetailItem
                label="Notes"
                value={flags.content_analysis.description}
              />
            )}
          </AnalysisSection>

          <AnalysisSection
            title="Composition & Style"
            icon={<span className="text-blue-400">🎨</span>}
          >
            <DetailItem
              label="Artistic Style"
              value={flags.composition_analysis.style}
            />
            <DetailItem
              label="Perspective"
              value={flags.composition_analysis.perspective}
            />
            <DetailItem
              label="Dominant Colors"
              value={flags.composition_analysis.dominant_colors.map((c) =>
                c.toUpperCase()
              )}
            />
          </AnalysisSection>

          <AnalysisSection
            title="Object & Text Detection"
            icon={<span className="text-green-400">📋</span>}
          >
            <DetailItem
              label="Main Objects"
              value={
                flags.object_detection.main_objects.join(", ") ||
                "None detected"
              }
            />
            <DetailItem
              label="Detected Text"
              value={flags.text_detection.detected_text || "None"}
            />
          </AnalysisSection>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            className={`flex-1 py-2 px-3 rounded font-semibold text-white text-xs transition-colors ${buttonClasses[license.color] || "bg-gray-600"}`}
            disabled={license.status === "CANNOT_REGISTER"}
          >
            {license.buttonText}
          </button>
          {onReset && (
            <button
              onClick={onReset}
              className="px-4 py-2 rounded font-semibold bg-gray-600 hover:bg-gray-500 text-white text-xs transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
