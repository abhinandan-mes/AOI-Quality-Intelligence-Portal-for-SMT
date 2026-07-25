const fs = require('fs');

const filepath = 'src/pages/Analytics.tsx';
let content = fs.readFileSync(filepath, 'utf8');

// 1. Add LabelList to import
content = content.replace(
  /ResponsiveContainer,/,
  'ResponsiveContainer, LabelList,'
);

// 2. Update Area
content = content.replace(
  /<Area type="monotone" dataKey="yieldRate" stroke="#3b82f6" strokeWidth=\{3\} fillOpacity=\{1\} fill="url\(#colorYieldAn\)" name="Yield Rate \(\%\)" \/>/,
  `<Area type="monotone" dataKey="yieldRate" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorYieldAn)" name="Yield Rate (%)">
                    <LabelList dataKey="yieldRate" position="top" fill="#3b82f6" fontSize={12} formatter={(val) => \`\${val}%\`} />
                  </Area>`
);

// 3. Update Bar
content = content.replace(
  /<Bar dataKey="count" fill="#ef4444" radius=\{\[4, 4, 0, 0\]\} name="Occurrences" \/>/,
  `<Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]} name="Occurrences">
                    <LabelList dataKey="count" position="top" fill="#64748b" fontSize={12} />
                  </Bar>`
);

fs.writeFileSync(filepath, content, 'utf8');
console.log('Successfully added LabelLists to Analytics.tsx');
