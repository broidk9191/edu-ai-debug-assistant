import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MessageContentProps {
  content: string;
}

interface Section {
  title: string;
  content: string;
  allowCode: boolean;
}

// Detect if a line looks like code
function isCodeLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed || trimmed.length < 3) return false;
  
  // Code indicators - patterns that strongly suggest code
  const codePatterns = [
    /^\s*(def|function|class|import|from|const|let|var|if|else|elif|for|while|return|public|private|static|void|int|string|float|double|bool|boolean)\s/, // Keywords
    /^\s*[a-zA-Z_][a-zA-Z0-9_]*\s*[=:]\s*[^=:]/, // Variable assignment
    /^\s*[{}[\]();]+\s*$/, // Brackets/parentheses only
    /^\s*\/\/|\/\*|\*\/|#\s*[^#]/, // Comments
    /^\s*[a-zA-Z_][a-zA-Z0-9_]*\s*\([^)]*\)/, // Function calls
    /^\s*\.\w+\s*\(/, // Method calls
    /^\s*(print|console\.|System\.out\.|printf|cout|echo)\s*\(/, // Output statements
    /^\s*(import|from|require|include|using|#include)\s+/, // Imports
    /^\s*[a-zA-Z_][a-zA-Z0-9_]*\s*\{/, // Opening braces
    /^\s*\}\s*$/, // Closing braces
    /^\s*[a-zA-Z_][a-zA-Z0-9_]*\s*:\s*[a-zA-Z]/, // Type hints
    /^\s*@\w+/, // Decorators/annotations
    /^\s*<\?php|<\?=/, // PHP tags
    /^\s*SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER\s/i, // SQL keywords
  ];
  
  const matchesCodePattern = codePatterns.some(pattern => pattern.test(trimmed));
  const hasCodeChars = /[{}[\]();=<>]/.test(trimmed);
  const hasMultipleOperators = (trimmed.match(/[+\-*/%=<>!&|]/g) || []).length >= 2;
  const hasIndentation = /^\s{2,}/.test(line);
  
  return matchesCodePattern || (hasCodeChars && (hasMultipleOperators || hasIndentation));
}

// Detect language from code patterns
function detectLanguage(code: string): string {
  const codeText = code.toLowerCase();
  
  if (codeText.includes('def ') || codeText.includes('import ') || codeText.includes('print(') || 
      codeText.includes('if __name__') || /^\s*def\s+\w+\s*\(/.test(code) || codeText.includes('elif ')) {
    return 'python';
  }
  if (codeText.includes('function ') || codeText.includes('const ') || codeText.includes('let ') ||
      codeText.includes('console.') || codeText.includes('=>') || codeText.includes('require(') ||
      codeText.includes('export ') || codeText.includes('async ')) {
    return 'javascript';
  }
  if (codeText.includes('public class') || codeText.includes('public static void') ||
      codeText.includes('system.out.println') || codeText.includes('import java.') ||
      codeText.includes('private ') || codeText.includes('protected ')) {
    return 'java';
  }
  if (codeText.includes('#include') || codeText.includes('int main') || 
      codeText.includes('printf') || codeText.includes('cout <<') || codeText.includes('std::')) {
    return 'cpp';
  }
  if (codeText.includes('<html') || codeText.includes('<!doctype') || 
      /<\w+[^>]*>/.test(code) || codeText.includes('</')) {
    return 'html';
  }
  if ((codeText.includes('{') && codeText.includes(':') && codeText.includes('}')) &&
      !codeText.includes('function') && !codeText.includes('def') && 
      !codeText.includes('class ') && !codeText.includes('public ')) {
    return 'css';
  }
  if (codeText.includes('select ') || codeText.includes('from ') || 
      codeText.includes('where ') || codeText.includes('insert into') ||
      codeText.includes('update ') || codeText.includes('delete from')) {
    return 'sql';
  }
  if (codeText.includes('interface ') || codeText.includes('type ') || 
      codeText.includes(': string') || codeText.includes(': number')) {
    return 'typescript';
  }
  
  return 'text';
}

// Parse sections from the response
function parseSections(content: string): Section[] {
  const sections: Section[] = [];
  
  // Section headers to look for (case-insensitive)
  // Debug mode sections
  const sectionPatterns = [
    { pattern: /^(?:summary|short\s+summary|short\s+one-line\s+summary|summary:)/i, allowCode: false },
    { pattern: /^(?:root\s+cause|root\s+cause:)/i, allowCode: true },
    { pattern: /^(?:tiny\s+experiment|tiny\s+experiment:)/i, allowCode: true },
    { pattern: /^(?:hint|guided\s+hints|hints|hint\s+\d+|hint\s+1|hint\s+2|hint\s+3)/i, allowCode: false },
    { pattern: /^(?:reflection|reflection\s+questions|reflection\s+question)/i, allowCode: false },
    { pattern: /^(?:refusal|when\s+to\s+refuse)/i, allowCode: false },
    // Assignment mode sections
    { pattern: /^(?:refusal\s+statement|refusal:)/i, allowCode: false },
    { pattern: /^(?:rationale|why:)/i, allowCode: false },
    { pattern: /^(?:redirection|redirect:)/i, allowCode: false },
    { pattern: /^(?:alternatives|alternative|steps|what\s+you\s+can\s+do:)/i, allowCode: false },
    { pattern: /^(?:explain\s+concept|concept\s+explanation|concept:)/i, allowCode: false },
    { pattern: /^(?:high-level\s+thinking\s+paths|thinking\s+paths|thinking\s+path|approach|approaches|strategy|strategies:)/i, allowCode: false },
    { pattern: /^(?:reflective\s+questions|reflective\s+question)/i, allowCode: false },
  ];
  
  const lines = content.split('\n');
  let currentSection: Section | null = null;
  let currentContent: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Check if this line is a section header
    let isHeader = false;
    let allowCode = false;
    
    for (const { pattern, allowCode: codeAllowed } of sectionPatterns) {
      if (pattern.test(trimmed)) {
        // Save previous section (only if it has content)
        if (currentSection) {
          currentSection.content = currentContent.join('\n').trim();
          if (currentSection.content) {
            sections.push(currentSection);
          }
        }
        
        // Start new section
        currentSection = {
          title: trimmed,
          content: '',
          allowCode: codeAllowed
        };
        currentContent = [];
        isHeader = true;
        allowCode = codeAllowed;
        break;
      }
    }
    
    if (!isHeader) {
      if (currentSection) {
        currentContent.push(line);
      } else {
        // Content before first section
        if (sections.length === 0) {
          sections.push({
            title: '',
            content: line,
            allowCode: false
          });
        } else {
          sections[sections.length - 1].content += '\n' + line;
        }
      }
    }
  }
  
  // Save last section
  if (currentSection) {
    currentSection.content = currentContent.join('\n').trim();
    if (currentSection.content) { // Only add if content is not empty
      sections.push(currentSection);
    }
  }
  
  // If no sections found, treat entire content as one section
  if (sections.length === 0) {
    sections.push({
      title: '',
      content: content,
      allowCode: false
    });
  }
  
  // Filter out sections with empty content
  return sections.filter(section => section.content.trim().length > 0);
}

// Convert markdown bold and asterisks to HTML bold
function formatBold(text: string): string {
  // Remove "Guidance Format:" or "Guidance format:" text
  text = text.replace(/guidance\s+format\s*:?\s*/gi, '');
  
  // Replace **text** with <strong>text</strong>
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // Replace *text* (not at start of line, not part of **) with <strong>text</strong>
  // But avoid replacing if it's part of a code block or already processed
  text = text.replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, '<strong>$1</strong>');
  return text;
}

// Parse content within a section
function parseSectionContent(sectionContent: string, allowCode: boolean): Array<{ type: 'text' | 'code'; content: string; language?: string }> {
  const parts: Array<{ type: 'text' | 'code'; content: string; language?: string }> = [];
  
  if (!allowCode) {
    // No code detection, just return as text
    parts.push({ type: 'text', content: sectionContent });
    return parts;
  }
  
  // Extract markdown code blocks first
  const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g;
  const codeBlockRanges: Array<{ start: number; end: number; language: string; code: string }> = [];
  let match;
  
  while ((match = codeBlockRegex.exec(sectionContent)) !== null) {
    const language = match[1] || detectLanguage(match[2]);
    codeBlockRanges.push({
      start: match.index,
      end: match.index + match[0].length,
      language,
      code: match[2].trim()
    });
  }
  
  // Process content
  let currentIndex = 0;
  
  while (currentIndex < sectionContent.length) {
    const codeBlock = codeBlockRanges.find(cb => cb.start === currentIndex);
    
    if (codeBlock) {
      parts.push({ type: 'code', content: codeBlock.code, language: codeBlock.language });
      currentIndex = codeBlock.end;
      continue;
    }
    
    const nextCodeBlock = codeBlockRanges.find(cb => cb.start > currentIndex);
    const textEnd = nextCodeBlock ? nextCodeBlock.start : sectionContent.length;
    const textSection = sectionContent.substring(currentIndex, textEnd);
    
    // Detect code-like patterns in text
    const lines = textSection.split('\n');
    let textBuffer: string[] = [];
    let codeBuffer: string[] = [];
    let codeLanguage = 'text';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const isCode = isCodeLine(line);
      
      if (isCode) {
        if (textBuffer.length > 0) {
          const textContent = textBuffer.join('\n');
          if (textContent.trim()) {
            parts.push({ type: 'text', content: textContent });
          }
          textBuffer = [];
        }
        
        codeBuffer.push(line);
        if (codeBuffer.length === 1) {
          codeLanguage = detectLanguage(line);
        } else {
          codeLanguage = detectLanguage(codeBuffer.join('\n'));
        }
      } else {
        if (codeBuffer.length > 0) {
          const codeContent = codeBuffer.join('\n');
          if (codeBuffer.length >= 2 || (codeBuffer.length === 1 && codeContent.trim().length > 30)) {
            parts.push({ 
              type: 'code', 
              content: codeContent, 
              language: codeLanguage 
            });
          } else {
            textBuffer.push(...codeBuffer);
          }
          codeBuffer = [];
        }
        textBuffer.push(line);
      }
    }
    
    // Flush remaining buffers
    if (codeBuffer.length > 0) {
      const codeContent = codeBuffer.join('\n');
      if (codeBuffer.length >= 2 || (codeBuffer.length === 1 && codeContent.trim().length > 30)) {
        parts.push({ 
          type: 'code', 
          content: codeContent, 
          language: codeLanguage 
        });
      } else {
        textBuffer.push(...codeBuffer);
      }
    }
    
    if (textBuffer.length > 0) {
      const textContent = textBuffer.join('\n');
      if (textContent.trim()) {
        parts.push({ type: 'text', content: textContent });
      }
    }
    
    currentIndex = textEnd;
  }
  
  // Merge adjacent text parts
  const mergedParts: Array<{ type: 'text' | 'code'; content: string; language?: string }> = [];
  for (let i = 0; i < parts.length; i++) {
    if (i > 0 && parts[i].type === 'text' && mergedParts[mergedParts.length - 1].type === 'text') {
      mergedParts[mergedParts.length - 1].content += '\n' + parts[i].content;
    } else {
      mergedParts.push(parts[i]);
    }
  }
  
  if (mergedParts.length === 0) {
    mergedParts.push({ type: 'text', content: sectionContent });
  }
  
  return mergedParts;
}

export default function MessageContent({ content }: MessageContentProps) {
  const sections = parseSections(content);

  return (
    <div className="message-content-wrapper">
      {sections.map((section, sectionIndex) => {
        // Skip empty sections
        if (!section.content.trim()) {
          return null;
        }
        
        const sectionParts = parseSectionContent(section.content, section.allowCode);
        
        // Skip if no parts after parsing
        if (sectionParts.length === 0) {
          return null;
        }
        
        return (
          <div key={sectionIndex} className="message-section">
            {section.title && (
              <div className="section-title">{section.title}</div>
            )}
            {sectionParts.map((part, partIndex) => {
              if (part.type === 'code') {
                return (
                  <div key={partIndex} className="code-editor-container">
                    <div className="code-editor-header">
                      <span className="code-language">{part.language || 'code'}</span>
                      <button
                        className="copy-code-btn"
                        onClick={() => {
                          navigator.clipboard.writeText(part.content);
                        }}
                        title="Copy code"
                      >
                        Copy
                      </button>
                    </div>
                    {/* @ts-ignore - react-syntax-highlighter type issue */}
                    <SyntaxHighlighter
                      language={part.language || 'text'}
                      style={vscDarkPlus}
                      customStyle={{
                        margin: 0,
                        borderRadius: '0 0 8px 8px',
                        fontSize: '0.875rem',
                        lineHeight: '1.5',
                      }}
                      showLineNumbers={part.content.split('\n').length > 5}
                      PreTag="div"
                    >
                      {part.content}
                    </SyntaxHighlighter>
                  </div>
                );
              } else {
                // Format text with bold and line breaks
                const formattedText = formatBold(part.content);
                
                return (
                  <div 
                    key={partIndex} 
                    className="message-text-content"
                    dangerouslySetInnerHTML={{ __html: formattedText.replace(/\n/g, '<br />') }}
                  />
                );
              }
            })}
          </div>
        );
      })}
    </div>
  );
}
