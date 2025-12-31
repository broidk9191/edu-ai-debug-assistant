import React from 'react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ value, onChange, placeholder }) => {
  return (
    <div className="code-editor-container">
      <textarea
        className="code-editor"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Paste your code here..."}
        spellCheck={false}
      />
    </div>
  );
};
