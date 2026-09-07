import re

with open("frontend/src/app/(dashboard)/transactions/[id]/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace the inner block of shapData mapping
new_shap_map = """                {shapData.length === 0 ? "No contextual features found." : 
                    shapData.map((d: any, i: number) => (
                      <div key={i} className="flex justify-between items-center text-[10px] border-b border-gray-50 pb-2">
                        <span className="w-24 text-gray-600 truncate" title={d.name}>{d.name}</span>
                        <div className="flex-1 mx-3 h-1.5 bg-gray-100 rounded-full overflow-hidden flex justify-end">
                          <div className={`h-full rounded-full ${d.raw > 0 ? 'bg-[#ef4444]' : 'bg-[#10b981]'}`} style={{width: `${(d.value / Math.max(...shapData.map((s:any)=>s.value))) * 100}%`}}></div>
                        </div>
                        <span className={`font-bold w-12 text-right ${d.raw > 0 ? 'text-[#ef4444]' : 'text-[#10b981]'}`}>
                          {d.raw > 0 ? '+' : ''}{(d.raw).toFixed(3)}
                        </span>
                      </div>
                    ))
                }"""

content = re.sub(r'\{shapData\.length === 0 \? "No contextual features found\." : \n\s*shapData\.map\(\(d: any, i: number\) => \(\n\s*<div key=\{i\} className="flex justify-between items-center border-b border-gray-50 pb-2">\n\s*<span>\{d\.name\}</span>\n\s*<span className="font-bold text-gray-900">\{typeof d\.impact === \'number\' \? d\.impact\.toFixed\(2\) : d\.impact\}</span>\n\s*</div>\n\s*\)\)\n\s*\}', new_shap_map, content)

with open("frontend/src/app/(dashboard)/transactions/[id]/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
