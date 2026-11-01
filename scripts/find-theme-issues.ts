import fs from 'fs';
import path from 'path';

function scan(dir: string, fileList: string[] = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory() && file !== 'node_modules' && file !== '.next') {
      scan(full, fileList);
    } else if (stat.isFile() && (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css'))) {
      fileList.push(full);
    }
  }
  return fileList;
}

const allFiles = scan('src');
console.log(`Scanning ${allFiles.length} files in src/ for theme and UI/UX issues...\n`);

const issues: Array<{ file: string; line: number; text: string; issue: string }> = [];

for (const file of allFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    // 1. Non-existent Tailwind classes like slate-850, zinc-850
    if (/\b(?:slate|zinc|gray|neutral|stone)-850\b/.test(line)) {
      issues.push({
        file,
        line: idx + 1,
        text: line.trim(),
        issue: 'Invalid Tailwind class: 850 shade does not exist in Tailwind CSS palette',
      });
    }

    // 2. Profile or card classes with hardcoded light background but no dark variant
    if (/className=.*(?:\bbg-white\b|\bbg-slate-50\b|\bbg-slate-100\b)/.test(line) && !line.includes('dark:bg-')) {
      // Ignore svgs or purely decorative tags if applicable
      if (!line.includes('<svg') && !line.includes('<path') && !line.includes('toast') && !line.includes('bg-white/')) {
        issues.push({
          file,
          line: idx + 1,
          text: line.trim(),
          issue: 'Hardcoded light background without dark:bg-* variant',
        });
      }
    }

    // 3. Hardcoded dark text without dark:text-* variant
    if (/className=.*(?:\btext-slate-900\b|\btext-slate-800\b|\btext-slate-700\b|\btext-black\b)/.test(line) && !line.includes('dark:text-')) {
      if (!line.includes('<svg') && !line.includes('<path') && !line.includes('text-white') && !line.includes('text-black/')) {
        issues.push({
          file,
          line: idx + 1,
          text: line.trim(),
          issue: 'Hardcoded dark text without dark:text-* variant',
        });
      }
    }

    // 4. Hardcoded borders without dark:border-* variant
    if (/className=.*(?:\bborder-slate-200\b|\bborder-slate-300\b)/.test(line) && !line.includes('dark:border-')) {
      issues.push({
        file,
        line: idx + 1,
        text: line.trim(),
        issue: 'Hardcoded light border without dark:border-* variant',
      });
    }
  });
}

console.log(`Found ${issues.length} potential styling issues:\n`);
issues.forEach((iss) => {
  console.log(`[${iss.issue}]`);
  console.log(`  File: ${iss.file}:${iss.line}`);
  console.log(`  Code: ${iss.text}\n`);
});
