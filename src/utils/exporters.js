/**
 * Export Utilities for Lumina AI
 */

/**
 * Triggers a client-side file download of a string blob
 */
export function downloadFile(content, fileName, contentType) {
  const a = document.createElement('a');
  const file = new Blob([content], { type: contentType });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(a.href);
}

/**
 * Exports Study Material as JSON
 */
export function exportToJSON(data, filename) {
  const jsonContent = JSON.stringify(data, null, 2);
  downloadFile(jsonContent, `${filename}.json`, 'application/json');
}

/**
 * Compiles study materials into a clean, formatted Markdown document
 */
export function compileToMarkdown(title, studySet) {
  let md = `# Lumina AI - ${title}\n`;
  md += `*Intelligent Study Material - Generated on ${new Date().toLocaleDateString()}*\n\n`;

  // 1. One Page Summary
  if (studySet.summary) {
    md += `## 📝 One Page Summary\n\n`;
    if (studySet.summary.summaryPoints) {
      studySet.summary.summaryPoints.forEach(p => {
        md += `- ${p}\n`;
      });
      md += `\n`;
    }
    if (studySet.summary.coreTakeaways) {
      md += `### Core Takeaways\n\n`;
      studySet.summary.coreTakeaways.forEach((t, i) => {
        md += `${i + 1}. ${t}\n`;
      });
      md += `\n`;
    }
  }

  // 2. Study Guide
  if (studySet.guide) {
    md += `## 📘 Study Guide & Key Concepts\n\n`;
    md += `${studySet.guide.summary}\n\n`;
    
    if (studySet.guide.keyConcepts && studySet.guide.keyConcepts.length > 0) {
      md += `### Key Concepts\n\n`;
      studySet.guide.keyConcepts.forEach(c => {
        md += `#### ${c.concept}\n${c.explanation}\n\n`;
      });
    }

    if (studySet.guide.formulas && studySet.guide.formulas.length > 0) {
      md += `### Key Formulas\n\n`;
      studySet.guide.formulas.forEach(f => {
        md += `- **${f.name}**: \`${f.formula}\`  \n  *Explanation*: ${f.explanation}\n\n`;
      });
    }

    if (studySet.guide.mnemonics && studySet.guide.mnemonics.length > 0) {
      md += `### Mnemonic Devices\n\n`;
      studySet.guide.mnemonics.forEach(m => {
        md += `- **${m.concept}**: \`${m.mnemonic}\`  \n  *Description*: ${m.description}\n\n`;
      });
    }
  }

  // 3. Flashcards
  if (studySet.flashcards && studySet.flashcards.length > 0) {
    md += `## 🎴 Flashcards\n\n`;
    studySet.flashcards.forEach((card, idx) => {
      md += `### Card ${idx + 1} [${card.difficulty.toUpperCase()}]\n`;
      md += `**Question**: ${card.question}\n\n`;
      md += `**Answer**: ${card.answer}\n\n`;
      md += `*Analogical Explanation (ELI10)*: ${card.explainLike10}\n\n`;
      md += `*Real World Scenario*: ${card.realWorldExample}\n\n`;
      md += `---\n\n`;
    });
  }

  // 4. Quiz Questions
  if (studySet.quiz && studySet.quiz.length > 0) {
    md += `## ❓ Quiz & Assessment\n\n`;
    studySet.quiz.forEach((q, idx) => {
      md += `### Q${idx + 1}. ${q.question} [${q.difficulty.toUpperCase()}]\n`;
      q.options.forEach(o => {
        const marker = o === q.correctAnswer ? '[x]' : '[ ]';
        md += `- ${marker} ${o}\n`;
      });
      md += `\n**Explanation**: ${q.explanation}\n`;
      md += `*Common Pitfall*: ${q.commonMistake}\n`;
      md += `*Example*: ${q.realExample}\n\n`;
      md += `---\n\n`;
    });
  }

  // 5. Interview Questions
  if (studySet.interview && studySet.interview.length > 0) {
    md += `## 👔 Interview Practice Questions\n\n`;
    studySet.interview.forEach((q, idx) => {
      md += `### Question ${idx + 1} [${q.difficulty.toUpperCase()}]\n`;
      md += `**Question**: ${q.question}\n\n`;
      md += `**Ideal Expert Response**:\n${q.idealAnswer}\n\n`;
      md += `**Evaluation Explanation**:\n${q.explanation}\n\n`;
      md += `---\n\n`;
    });
  }

  return md;
}

/**
 * Triggers export as Markdown file
 */
export function exportToMarkdown(title, studySet, filename) {
  const md = compileToMarkdown(title, studySet);
  downloadFile(md, `${filename}.md`, 'text/markdown');
}

/**
 * Generates an elegant print-styled window and invokes browser PDF export
 */
export function exportToPDF(title, studySet) {
  const mdContent = compileToMarkdown(title, studySet);
  
  // Convert basic markdown to clean HTML tags for printing
  let html = mdContent
    .replace(/^# (.*)$/gm, '<h1>$1</h1>')
    .replace(/^## (.*)$/gm, '<h2>$1</h2>')
    .replace(/^### (.*)$/gm, '<h3>$1</h3>')
    .replace(/^#### (.*)$/gm, '<h4>$1</h4>')
    .replace(/^\* (.*)$/gm, '<em>$1</em>')
    .replace(/^- (.*)$/gm, '<li>$1</li>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '<p></p>')
    .replace(/---/g, '<hr/>');

  // Wrap structured bullet lists
  html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');

  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <html>
      <head>
        <title>Lumina AI - ${title}</title>
        <style>
          body {
            font-family: 'Segoe UI', -apple-system, sans-serif;
            color: #1a1a1a;
            line-height: 1.5;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
          }
          h1 {
            color: #059669;
            font-size: 32px;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 12px;
          }
          h2 {
            color: #1f2937;
            font-size: 22px;
            margin-top: 30px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 6px;
            page-break-after: avoid;
          }
          h3 {
            color: #374151;
            font-size: 16px;
            margin-top: 20px;
            page-break-after: avoid;
          }
          h4 {
            color: #4b5563;
            font-size: 14px;
            margin-bottom: 4px;
          }
          p {
            margin: 0 0 12px 0;
            color: #374151;
          }
          ul {
            margin-top: 0;
            margin-bottom: 16px;
            padding-left: 20px;
          }
          li {
            margin-bottom: 6px;
          }
          code {
            font-family: monospace;
            background-color: #f3f4f6;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 0.9em;
          }
          hr {
            border: 0;
            border-top: 1px solid #e5e7eb;
            margin: 24px 0;
          }
          strong {
            color: #111827;
          }
          .footer {
            margin-top: 40px;
            font-size: 11px;
            color: #9ca3af;
            text-align: center;
            border-top: 1px solid #f3f4f6;
            padding-top: 12px;
          }
          @media print {
            body {
              padding: 0;
            }
            h2, h3, h4 {
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        ${html}
        <div class="footer">
          Generated using Lumina AI – Intelligent Study Platform &copy; ${new Date().getFullYear()}
        </div>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          }
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
