import re

with open("frontend/src/app/(dashboard)/transactions/[id]/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# I need to add state for SHAP and fetch it in useEffect
new_state = """
  const [data, setData] = useState<any>(null);
  const [cardHistory, setCardHistory] = useState<any[]>([]);
  const [shapExpl, setShapExpl] = useState<any>(null);
  const [loading, setLoading] = useState(true);
"""

content = content.replace("  const [data, setData] = useState<any>(null);\n  const [cardHistory, setCardHistory] = useState<any[]>([]);\n  const [loading, setLoading] = useState(true);", new_state)

new_fetch = """
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/transactions/${id}`);
        if (res.ok) {
          const d = await res.json();
          setData(d);
          // secondary fetch for card
          if (d.transaction && d.transaction.card_id) {
            const hRes = await fetch(`/api/transactions?search=${d.transaction.card_id}&size=5`);
            if (hRes.ok) {
              const hData = await hRes.json();
              setCardHistory(hData.items.filter((t: any) => t.transaction_id !== id));
            }
          }
        }
        
        // Fetch SHAP
        const sRes = await fetch(`/api/models/xgboost/explanation/${id}`);
        if (sRes.ok) {
          const sData = await sRes.json();
          setShapExpl(sData);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
"""
# Replace the fetch function
content = re.sub(r'const fetchData = async \(\) => \{[\s\S]*?catch \(e\) \{[\s\S]*?finally \{[\s\S]*?setLoading\(false\);[\s\S]*?\}[\s\S]*?\};', new_fetch, content)


# Now replace the SHAP rendering
new_shap_render = """
  const shapData = shapExpl ? shapExpl.contributions.map((c: any) => ({
    name: c.feature,
    value: Math.abs(c.contribution),
    raw: c.contribution
  })) : [];
"""
content = re.sub(r'const shapData = Object\.keys\(data\.features \|\| \{\}\)\.slice\(0, 8\)\.map\(\(k: string\) => \(\{[\s\S]*?\}\)\);', new_shap_render, content)

new_shap_map = """
                    shapData.map((d: any, i: number) => (
                      <div key={i} className="flex justify-between items-center text-[10px]">
                        <span className="w-24 text-gray-600 truncate">{d.name}</span>
                        <div className="flex-1 mx-3 h-1.5 bg-gray-100 rounded-full overflow-hidden flex justify-end">
                          <div className={`h-full rounded-full ${d.raw > 0 ? 'bg-[#ef4444]' : 'bg-[#10b981]'}`} style={{width: `${(d.value / Math.max(...shapData.map((s:any)=>s.value))) * 100}%`}}></div>
                        </div>
                        <span className={`font-bold w-12 text-right ${d.raw > 0 ? 'text-[#ef4444]' : 'text-[#10b981]'}`}>
                          {d.raw > 0 ? '+' : ''}{(d.raw).toFixed(3)}
                        </span>
                      </div>
                    ))
"""
content = re.sub(r'shapData\.map\(\(d: any, i: number\) => \([\s\S]*?\}\)\)', new_shap_map, content)

with open("frontend/src/app/(dashboard)/transactions/[id]/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
