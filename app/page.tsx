'use client'

import { useState, useEffect } from 'react'

// プランマスターデータ
const PLANS = [
  { id: 'cms', label: 'ferret One CMS', monthly: 100000, initial: 100000, supportLabel: '公開サポート', support: 200000, category: 'ferret' },
  { id: 'cms_lead', label: 'CMS + リードジェン', monthly: 130000, initial: 100000, supportLabel: '公開サポート', support: 200000, category: 'ferret' },
  { id: 'cms_nurturing', label: 'CMS + ナーチャリング', monthly: 160000, initial: 100000, supportLabel: '公開サポート', support: 200000, category: 'ferret' },
  { id: 'ma', label: 'ferret One MA', monthly: 200000, initial: 100000, supportLabel: '公開サポート', support: 200000, category: 'ferret' },
  { id: 'for_lp', label: 'ferret One for LP', monthly: 20000, initial: 30000, supportLabel: '公開サポート', support: 100000, category: 'for' },
  { id: 'for_mail', label: 'ferret One for Mail', monthly: 50000, initial: 30000, supportLabel: '公開サポート', support: 100000, category: 'for' },
  { id: 'for_ma', label: 'ferret One for MA', monthly: 80000, initial: 30000, supportLabel: 'MA導入サポート', support: 100000, category: 'for' }
]

const MS_PACKS = {
  '': { id: '', label: 'なし', monthly: 0 },
  'msp1': { id: 'msp1', label: '20万円 / 月', monthly: 200000 },
  'msp2': { id: 'msp2', label: '30万円 / 月', monthly: 300000 },
  'msp3': { id: 'msp3', label: '40万円 / 月', monthly: 400000 },
  'msp4': { id: 'msp4', label: '50万円 / 月', monthly: 500000 }
}

type Plan = typeof PLANS[0]
type MsPack = typeof MS_PACKS['']
type AppMode = 'new' | 'existing'
type PlanFilter = 'all' | 'ferret' | 'for'

interface BreakdownLine {
  group: string
  name: string
  type: string
  unit: number
  qty: number
  subtotal: number
}

interface SavedPattern {
  label: string
  planLabel: string
  msPackLabel: string
  msPackMonthly: number
  monthlyTotal: number
  year1Total: number
  year2Annual: number
  months: number
  initialTotal: number
  breakdownLines: BreakdownLine[]
}

export default function Home() {
  const [appMode, setAppMode] = useState<AppMode>('new')
  const [planFilter, setPlanFilter] = useState<PlanFilter>('all')
  const [selectedPlanId, setSelectedPlanId] = useState<string>('')
  const [msPack, setMsPack] = useState<string>('')
  const [productionCost, setProductionCost] = useState<number>(0)
  const [includeInitial, setIncludeInitial] = useState(true)
  const [includeSupport, setIncludeSupport] = useState(true)
  const [contractMonths, setContractMonths] = useState(12)
  const [currentPlan, setCurrentPlan] = useState<string>('')
  const [currentMsPack, setCurrentMsPack] = useState<string>('')
  const [upgradeExtraInitial, setUpgradeExtraInitial] = useState<number>(0)
  const [savedPatterns, setSavedPatterns] = useState<SavedPattern[]>([])

  const formatYen = (value: number): string => {
    if (!Number.isFinite(value)) return '¥0'
    const rounded = Math.round(value)
    return '¥' + rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  const getSelectedPlan = (): Plan | null => {
    return PLANS.find(p => p.id === selectedPlanId) || null
  }

  const computeProposalTotals = () => {
    const selectedPlan = getSelectedPlan()
    const msPackData = MS_PACKS[msPack as keyof typeof MS_PACKS] || MS_PACKS['']
    const productionCostYen = Math.max(0, productionCost) * 10000

    let monthlyTotal = 0
    let initialTotal = 0
    const breakdownLines: BreakdownLine[] = []

    if (selectedPlan) {
      if (includeInitial) {
        initialTotal += selectedPlan.initial
        breakdownLines.push({
          group: '初期',
          name: `${selectedPlan.label} 初期費用`,
          type: '初期',
          unit: selectedPlan.initial,
          qty: 1,
          subtotal: selectedPlan.initial
        })
      }

      if (includeSupport) {
        initialTotal += selectedPlan.support
        breakdownLines.push({
          group: '公開サポート',
          name: selectedPlan.supportLabel,
          type: '初期',
          unit: selectedPlan.support,
          qty: 1,
          subtotal: selectedPlan.support
        })
      }

      if (productionCostYen > 0) {
        initialTotal += productionCostYen
        breakdownLines.push({
          group: '制作',
          name: '制作費',
          type: '初期',
          unit: productionCostYen,
          qty: 1,
          subtotal: productionCostYen
        })
      }

      monthlyTotal += selectedPlan.monthly
      breakdownLines.push({
        group: selectedPlan.category === 'for' ? 'for シリーズ' : 'ツール費用',
        name: selectedPlan.label,
        type: '月額',
        unit: selectedPlan.monthly,
        qty: 12,
        subtotal: selectedPlan.monthly * 12
      })
    }

    if (msPackData && msPackData.monthly > 0) {
      monthlyTotal += msPackData.monthly
      breakdownLines.push({
        group: '伴走プラン',
        name: msPackData.label,
        type: '月額',
        unit: msPackData.monthly,
        qty: 12,
        subtotal: msPackData.monthly * 12
      })
    }

    const months = Math.max(1, contractMonths)
    const year1Total = monthlyTotal * months + initialTotal
    const year2Annual = monthlyTotal * 12

    return {
      selectedPlan,
      msPack: msPackData,
      breakdownLines,
      monthlyTotal,
      initialTotal,
      months,
      year1Total,
      year2Annual
    }
  }

  const computeCurrentMonthly = () => {
    let monthly = 0
    const details: string[] = []

    if (currentPlan) {
      const plan = PLANS.find(p => p.id === currentPlan)
      if (plan) {
        monthly += plan.monthly
        details.push(plan.label)
      }
    }

    const msPackData = MS_PACKS[currentMsPack as keyof typeof MS_PACKS]
    if (msPackData && msPackData.monthly > 0) {
      monthly += msPackData.monthly
      details.push('伴走プラン')
    }

    return {
      monthly,
      detailsText: details.length ? details.join(' / ') : ''
    }
  }

  const proposal = computeProposalTotals()
  const current = computeCurrentMonthly()
  
  const diffMonthly = proposal.monthlyTotal - current.monthly
  const diffYear1 = diffMonthly * proposal.months + upgradeExtraInitial
  const diffYear2 = diffMonthly * 12

  const exportCsv = () => {
    if (!proposal.selectedPlan) {
      alert('ベースプランを選択してください。')
      return
    }

    const rows: string[][] = []
    rows.push(['項目', '金額'])
    rows.push(['月額ランニング', formatYen(proposal.monthlyTotal)])
    rows.push(['初年度合計', formatYen(proposal.year1Total)])
    rows.push(['2年目以降の年額', formatYen(proposal.year2Annual)])
    rows.push([])
    rows.push(['区分', '項目', '種別', '単価', '数量', '合計(税抜)'])
    proposal.breakdownLines.forEach(line => {
      rows.push([
        line.group,
        line.name,
        line.type,
        formatYen(line.unit),
        line.qty.toString(),
        formatYen(line.subtotal)
      ])
    })
    rows.push(['ランニング（12ヶ月）', '', '', '', '', formatYen(proposal.monthlyTotal * 12)])
    rows.push(['初期費用合計', '', '', '', '', formatYen(proposal.initialTotal)])

    const csv = '\uFEFF' + rows.map(r =>
      r.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')
    ).join('\r\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'ferret-one-summary.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const copyToClipboard = async () => {
    if (!proposal.selectedPlan) {
      alert('ベースプランを選択してください。')
      return
    }

    const text = `ferret One 概算
月額ランニング: ${formatYen(proposal.monthlyTotal)}
初年度合計: ${formatYen(proposal.year1Total)}
2年目以降の年額: ${formatYen(proposal.year2Annual)}

内訳:
${proposal.breakdownLines.map(line => 
  `- ${line.group} / ${line.name} (${line.type}) 単価 ${formatYen(line.unit)} × ${line.qty} = ${formatYen(line.subtotal)}`
).join('\n')}
ランニング（12ヶ月）: ${formatYen(proposal.monthlyTotal * 12)}
初期費用合計: ${formatYen(proposal.initialTotal)}`

    try {
      await navigator.clipboard.writeText(text)
      alert('クリップボードへコピーしました。')
    } catch (err) {
      alert('コピーに失敗しました。')
    }
  }

  const saveCurrentPattern = () => {
    if (!proposal.selectedPlan) {
      alert('ベースプランを選択してください。')
      return
    }
    if (savedPatterns.length >= 3) {
      alert('保存は最大 3 件までです。リセットしてから追加してください。')
      return
    }

    const snapshot: SavedPattern = {
      label: `パターン${savedPatterns.length + 1}`,
      planLabel: proposal.selectedPlan.label,
      msPackLabel: proposal.msPack && proposal.msPack.monthly ? proposal.msPack.label : '伴走なし',
      msPackMonthly: proposal.msPack ? proposal.msPack.monthly : 0,
      monthlyTotal: proposal.monthlyTotal,
      year1Total: proposal.year1Total,
      year2Annual: proposal.year2Annual,
      months: proposal.months,
      initialTotal: proposal.initialTotal,
      breakdownLines: proposal.breakdownLines.map(line => ({ ...line }))
    }
    setSavedPatterns([...savedPatterns, snapshot])
  }

  const removePattern = (index: number) => {
    setSavedPatterns(savedPatterns.filter((_, i) => i !== index))
  }

  const resetPatterns = () => {
    setSavedPatterns([])
  }

  const filteredPlans = PLANS.filter(plan => 
    planFilter === 'all' || plan.category === planFilter
  )

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      {/* Hero Section */}
      <section className="relative w-full bg-primary" style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1600&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        <div className="absolute inset-0 bg-primary bg-opacity-55"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-10 text-white">
          <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-accent bg-opacity-75 text-white font-semibold text-sm mb-3">
            瞬間概算シミュレーター
          </div>
          <h1 className="text-2xl font-bold mb-2">ferret Oneの概算費用がすぐにわかる</h1>
          <p className="text-sm opacity-90 max-w-3xl">必要項目だけで年間コストを即表示し、共有も簡単に行えます。</p>
        </div>
      </section>

      {/* Main Layout */}
      <div className="max-w-7xl w-full mx-auto px-6 py-7 grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-5">
        {/* Sidebar */}
        <aside className="bg-surface border border-border rounded-xl p-4 h-fit lg:sticky lg:top-20 space-y-3">
          {/* Mode Toggle */}
          <div className="pb-3 border-b border-border">
            <h3 className="text-sm font-bold text-primary mb-2">Sales / CS</h3>
            <div className="space-y-2">
              <button
                onClick={() => setAppMode('new')}
                className={`w-full flex items-center gap-2 px-3.5 py-2 rounded-full border transition-colors ${
                  appMode === 'new'
                    ? 'bg-primary text-white border-primary'
                    : 'bg-surface text-primary border-border hover:border-primary'
                }`}
              >
                <span className="w-4.5 h-4.5 rounded-full bg-primary bg-opacity-12 flex items-center justify-center text-xs font-bold">
                  +
                </span>
                <strong className="text-sm">新規向け見積</strong>
              </button>
              <button
                onClick={() => setAppMode('existing')}
                className={`w-full flex items-center gap-2 px-3.5 py-2 rounded-full border transition-colors ${
                  appMode === 'existing'
                    ? 'bg-primary text-white border-primary'
                    : 'bg-surface text-gray-700 border-border hover:border-primary'
                }`}
              >
                <span className="w-4.5 h-4.5 rounded-full bg-primary bg-opacity-12 flex items-center justify-center text-xs font-bold">
                  ⇆
                </span>
                <strong className="text-sm">既存向け差分</strong>
              </button>
            </div>
          </div>

          {/* Plan Filter */}
          <div className="pb-3 border-b border-border">
            <h3 className="text-sm font-bold text-primary mb-2">プランカテゴリ</h3>
            <div className="space-y-2">
              {(['all', 'ferret', 'for'] as PlanFilter[]).map(filter => (
                <button
                  key={filter}
                  onClick={() => setPlanFilter(filter)}
                  className={`w-full px-3.5 py-2 rounded-full border transition-colors text-sm font-semibold ${
                    planFilter === filter
                      ? 'bg-surface-soft text-primary border-primary'
                      : 'bg-surface text-gray-700 border-border hover:border-primary'
                  }`}
                >
                  {filter === 'all' ? 'すべて' : filter === 'ferret' ? 'ferret One' : 'for シリーズ'}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-600 mt-1">ベースプランは 6 つのうち 1 つを選択</p>
          </div>

          {/* Simulation Options */}
          <div className="pb-3 border-b border-border">
            <h3 className="text-sm font-bold text-primary mb-2">シミュレーション条件</h3>
            <div className="space-y-2 text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeInitial}
                  onChange={(e) => setIncludeInitial(e.target.checked)}
                  className="w-3.5 h-3.5"
                />
                初期費用を含める
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeSupport}
                  onChange={(e) => setIncludeSupport(e.target.checked)}
                  className="w-3.5 h-3.5"
                />
                サポートを含める
              </label>
            </div>
            <div className="mt-2">
              <label className="text-xs text-gray-600 block mb-1">契約月数</label>
              <input
                type="number"
                value={contractMonths}
                onChange={(e) => setContractMonths(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                max="60"
                className="w-full px-2.5 py-2 border border-border rounded-lg text-sm"
              />
            </div>
          </div>

          {/* Note */}
          <div className="bg-surface-soft border border-border rounded-xl p-3 text-xs text-gray-700">
            初年度は初期費用とサポートを含めて計算し、2年目以降は月額ランニングのみを年間化して表示します。
          </div>
        </aside>

        {/* Main Content */}
        <div className="space-y-5">
          <div className="grid grid-cols-1 xl:grid-cols-[1.05fr_1.35fr] gap-5">
            {/* Left Column - Input */}
            <div className="space-y-4">
              {/* Plan Selection */}
              <div className="bg-surface border border-border rounded-xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="text-base font-bold text-primary">① 提案プラン</h2>
                    <p className="text-xs text-gray-600">ferret One / for シリーズから 1 つ選択</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-accent text-white text-xs font-bold">必須</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold mb-1">プラン一覧</h3>
                  <p className="text-xs text-gray-600 mb-2">クリックで選択（1 つのみ）</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredPlans.map(plan => (
                      <div
                        key={plan.id}
                        onClick={() => setSelectedPlanId(plan.id)}
                        className={`border rounded-xl p-3 cursor-pointer transition-all ${
                          selectedPlanId === plan.id
                            ? 'bg-primary bg-opacity-6 border-primary'
                            : 'bg-surface border-border hover:bg-surface-soft hover:border-primary'
                        }`}
                      >
                        <div>
                          <div className="text-sm font-bold text-text">{plan.label}</div>
                          <div className="text-xs text-gray-600">
                            初期 {formatYen(plan.initial)} / {plan.supportLabel} {formatYen(plan.support)}
                          </div>
                        </div>
                        <div className="text-xs font-bold text-primary mt-1">
                          {formatYen(plan.monthly)}/月
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* MS Pack */}
              <div className="bg-surface border border-border rounded-xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="text-base font-bold text-primary">② 伴走支援の有無</h2>
                    <p className="text-xs text-gray-600">伴走支援を追加したい場合に選択</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-surface-soft text-primary text-xs font-bold border border-border">任意</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold mb-1">マーケティングサクセスパック</h3>
                  <select
                    value={msPack}
                    onChange={(e) => setMsPack(e.target.value)}
                    className="w-full px-2.5 py-2 border border-border rounded-lg text-sm"
                  >
                    <option value="">なし</option>
                    <option value="msp1">20万円 / 月</option>
                    <option value="msp2">30万円 / 月</option>
                    <option value="msp3">40万円 / 月</option>
                    <option value="msp4">50万円 / 月</option>
                  </select>
                  <p className="text-xs text-gray-600 mt-1">コンサル伴走支援がある場合に選択</p>
                </div>
              </div>

              {/* Production Cost */}
              <div className="bg-surface border border-border rounded-xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="text-base font-bold text-primary">③ 制作費</h2>
                    <p className="text-xs text-gray-600">単発の制作費を入力（万円）</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-surface-soft text-primary text-xs font-bold border border-border">任意</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold mb-1">制作費（万円）</h3>
                  <input
                    type="number"
                    value={productionCost}
                    onChange={(e) => setProductionCost(Math.max(0, parseFloat(e.target.value) || 0))}
                    min="0"
                    step="1"
                    className="w-full px-2.5 py-2 border border-border rounded-lg text-sm"
                  />
                  <p className="text-xs text-gray-600 mt-1">例: 100 と入力すると 100万円を初期費用に計上します</p>
                </div>
              </div>

              {/* Current Plan (Existing Mode) */}
              {appMode === 'existing' && (
                <div className="bg-surface border border-border rounded-xl p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h2 className="text-base font-bold text-primary">④ 現行プラン（既存顧客向け）</h2>
                      <p className="text-xs text-gray-600">差分を出す場合のみ入力</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-surface-soft text-primary text-xs font-bold border border-border">CS 向け</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-sm font-bold mb-1">現行プラン</h3>
                      <p className="text-xs text-gray-600 mb-1">ベースプランを 1 つ選択</p>
                      <select
                        value={currentPlan}
                        onChange={(e) => setCurrentPlan(e.target.value)}
                        className="w-full px-2.5 py-2 border border-border rounded-lg text-sm"
                      >
                        <option value="">未指定</option>
                        <option value="cms">ferret One CMS</option>
                        <option value="cms_lead">CMS + リードジェン</option>
                        <option value="cms_nurturing">CMS + ナーチャリング</option>
                        <option value="ma">ferret One MA</option>
                        <option value="for_lp">for LP</option>
                        <option value="for_mail">for Mail</option>
                        <option value="for_ma">for MA</option>
                      </select>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold mb-1">オプション（任意）</h3>
                      <p className="text-xs text-gray-600 mb-1">現在のマーケティングサクセスパックを選択</p>
                      <select
                        value={currentMsPack}
                        onChange={(e) => setCurrentMsPack(e.target.value)}
                        className="w-full px-2.5 py-2 border border-border rounded-lg text-sm"
                      >
                        <option value="">なし</option>
                        <option value="msp1">20万円 / 月</option>
                        <option value="msp2">30万円 / 月</option>
                        <option value="msp3">40万円 / 月</option>
                        <option value="msp4">50万円 / 月</option>
                      </select>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold mb-1">アップグレード時の追加初期費用（任意 / ¥）</h3>
                      <input
                        type="number"
                        value={upgradeExtraInitial}
                        onChange={(e) => setUpgradeExtraInitial(Math.max(0, parseInt(e.target.value) || 0))}
                        min="0"
                        step="1000"
                        className="w-full px-2.5 py-2 border border-border rounded-lg text-sm"
                      />
                      <p className="text-xs text-gray-600 mt-1">
                        既存環境からの移行費など、追加で想定される一時費用があれば入力
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Output */}
            <div className="space-y-4">
              {/* Summary */}
              <div className="bg-surface border border-border rounded-xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="text-base font-bold text-primary">提案プランの概算コスト</h2>
                    <p className="text-xs text-gray-600">月額 / 初年度 / 2年目以降をワンビュー表示</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-accent text-white text-xs font-bold">自動計算</span>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-surface-soft border border-border rounded-xl p-3">
                    <div className="text-xs text-gray-600 font-semibold mb-0.5">月額ランニング</div>
                    <div className="text-lg font-bold text-primary">{formatYen(proposal.monthlyTotal)}</div>
                    <div className="text-xs text-gray-600">
                      {proposal.selectedPlan ? `${proposal.selectedPlan.label}${proposal.msPack && proposal.msPack.monthly ? ' + 伴走プラン' : ''}` : 'プラン未選択'}
                    </div>
                  </div>
                  <div className="bg-surface-soft border border-border rounded-xl p-3">
                    <div className="text-xs text-gray-600 font-semibold mb-0.5">初年度合計</div>
                    <div className="text-lg font-bold text-primary">{formatYen(proposal.year1Total)}</div>
                    <div className="text-xs text-gray-600">
                      月額 × {proposal.months}ヶ月 + 初期費用・サポート
                    </div>
                  </div>
                  <div className="bg-surface-soft border border-border rounded-xl p-3">
                    <div className="text-xs text-gray-600 font-semibold mb-0.5">2年目以降の年額</div>
                    <div className="text-lg font-bold text-primary">{formatYen(proposal.year2Annual)}</div>
                    <div className="text-xs text-gray-600">月額ランニング × 12 ヶ月</div>
                  </div>
                </div>

                <div className="border-t border-border my-4"></div>

                {/* Breakdown Table */}
                <div>
                  <h3 className="text-sm font-bold mb-2">内訳明細</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-surface-soft">
                          <th className="border border-border p-2 text-left">区分</th>
                          <th className="border border-border p-2 text-left">項目</th>
                          <th className="border border-border p-2 text-left">種別</th>
                          <th className="border border-border p-2 text-right">単価</th>
                          <th className="border border-border p-2 text-right">数量</th>
                          <th className="border border-border p-2 text-right">合計 <span className="text-xs text-gray-500">税抜</span></th>
                        </tr>
                      </thead>
                      <tbody>
                        {proposal.breakdownLines.map((line, idx) => (
                          <tr key={idx}>
                            <td className="border border-border p-2">{line.group}</td>
                            <td className="border border-border p-2">{line.name}</td>
                            <td className="border border-border p-2">{line.type}</td>
                            <td className="border border-border p-2 text-right">{formatYen(line.unit)}</td>
                            <td className="border border-border p-2 text-right">{line.qty}</td>
                            <td className="border border-border p-2 text-right">{formatYen(line.subtotal)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="font-bold">
                        <tr>
                          <td colSpan={5} className="border border-border p-2 text-right">ランニング（12ヶ月） <span className="text-xs text-gray-500">税抜</span></td>
                          <td className="border border-border p-2 text-right">{formatYen(proposal.monthlyTotal * 12)}</td>
                        </tr>
                        <tr>
                          <td colSpan={5} className="border border-border p-2 text-right">初期費用合計 <span className="text-xs text-gray-500">税抜</span></td>
                          <td className="border border-border p-2 text-right">{formatYen(proposal.initialTotal)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                <div className="border-t border-border my-4"></div>

                {/* Export */}
                <div>
                  <h3 className="text-sm font-bold mb-1">共有・エクスポート</h3>
                  <p className="text-xs text-gray-600 mb-2">右側の概算と内訳をそのまま共有 / 取り込み</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={exportCsv}
                      className="px-3 py-2 border border-border rounded-lg text-sm font-bold text-primary hover:bg-surface-soft transition-colors"
                    >
                      Excel / CSVで保存
                    </button>
                    <button
                      onClick={copyToClipboard}
                      className="px-3 py-2 border border-border rounded-lg text-sm font-bold text-primary hover:bg-surface-soft transition-colors"
                    >
                      メール用にコピー
                    </button>
                  </div>
                </div>
              </div>

              {/* Diff Card (Existing Mode) */}
              {appMode === 'existing' && (
                <div className="bg-surface border border-border rounded-xl p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h2 className="text-base font-bold text-primary">現行プランとのコスト差分</h2>
                      <p className="text-xs text-gray-600">既存顧客の増額・減額を即時計算</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-surface-soft text-primary text-xs font-bold border border-border">差分</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    <div className="bg-surface-soft border border-border rounded-xl p-3">
                      <div className="text-xs text-gray-600 font-semibold mb-0.5">現行の月額合計</div>
                      <div className="text-lg font-bold text-primary">{formatYen(current.monthly)}</div>
                      <div className="text-xs text-gray-600">{current.detailsText}</div>
                    </div>
                    <div className="bg-surface-soft border border-border rounded-xl p-3">
                      <div className="text-xs text-gray-600 font-semibold mb-0.5">提案後の月額合計</div>
                      <div className="text-lg font-bold text-primary">{formatYen(proposal.monthlyTotal)}</div>
                      <div className="text-xs text-gray-600">ランニング費用ベース</div>
                    </div>
                    <div className="bg-surface-soft border border-border rounded-xl p-3">
                      <div className="text-xs text-gray-600 font-semibold mb-0.5">月額差分</div>
                      <div className="text-lg font-bold text-primary">{formatYen(diffMonthly)}</div>
                      <div className="text-xs text-gray-600">
                        {diffMonthly >= 0 ? '増額差分です' : '減額差分です'}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-surface-soft border border-border rounded-xl p-3">
                      <div className="text-xs text-gray-600 font-semibold mb-0.5">アップグレード時追加初期費用</div>
                      <div className="text-lg font-bold text-primary">{formatYen(upgradeExtraInitial)}</div>
                      <div className="text-xs text-gray-600">入力値をそのまま反映</div>
                    </div>
                    <div className="bg-surface-soft border border-border rounded-xl p-3">
                      <div className="text-xs text-gray-600 font-semibold mb-0.5">初年度差分（目安）</div>
                      <div className="text-lg font-bold text-primary">{formatYen(diffYear1)}</div>
                      <div className="text-xs text-gray-600">月額差分 × {proposal.months}ヶ月 + 追加初期</div>
                    </div>
                    <div className="bg-surface-soft border border-border rounded-xl p-3">
                      <div className="text-xs text-gray-600 font-semibold mb-0.5">2年目以降の年額差分</div>
                      <div className="text-lg font-bold text-primary">{formatYen(diffYear2)}</div>
                      <div className="text-xs text-gray-600">月額差分 × 12 ヶ月</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Comparison Section */}
          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="text-base font-bold text-primary">保存した概算の比較</h2>
                <p className="text-xs text-gray-600">現在の概算結果を最大 3 つまで一時保存し、横並びで比較</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={saveCurrentPattern}
                  disabled={savedPatterns.length >= 3}
                  className="px-3 py-2 border border-border rounded-lg text-sm font-bold text-primary hover:bg-surface-soft transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  現在の結果を保存
                </button>
                <button
                  onClick={resetPatterns}
                  disabled={savedPatterns.length === 0}
                  className="px-3 py-2 border border-border rounded-lg text-sm font-bold text-primary hover:bg-surface-soft transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  リセット
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-600 mb-3">
              保存データはこのページを離れると消えます。プランを選択後に追加してください。
            </p>

            {savedPatterns.length === 0 ? (
              <div className="border border-dashed border-border rounded-xl p-4 text-center text-sm text-gray-600">
                まだ保存されたパターンはありません。上の「現在の結果を保存」から追加してください。
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {savedPatterns.map((pattern, idx) => (
                  <div key={idx} className="border border-border rounded-xl p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="px-2 py-0.5 rounded-full bg-accent text-white text-xs font-bold">
                          パターン{idx + 1}
                        </span>
                        <div className="text-sm font-bold text-primary mt-1">{pattern.planLabel}</div>
                        <div className="text-xs text-gray-600">
                          {pattern.msPackMonthly > 0 ? `伴走支援 ${Math.round(pattern.msPackMonthly / 10000)}万円 / 月` : '伴走支援なし'}
                        </div>
                      </div>
                      <div className="text-xs text-gray-600">
                        <span>契約月数 {pattern.months}ヶ月</span>
                        <button
                          onClick={() => removePattern(idx)}
                          className="ml-2 px-2 py-1 border border-border rounded text-xs font-bold hover:bg-surface-soft"
                        >
                          削除
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-2">
                      <div className="bg-surface-soft border border-border rounded p-2">
                        <div className="text-xs text-gray-600">月額ランニング</div>
                        <div className="text-sm font-bold text-primary">{formatYen(pattern.monthlyTotal)}</div>
                      </div>
                      <div className="bg-surface-soft border border-border rounded p-2">
                        <div className="text-xs text-gray-600">初年度合計</div>
                        <div className="text-sm font-bold text-primary">{formatYen(pattern.year1Total)}</div>
                      </div>
                      <div className="bg-surface-soft border border-border rounded p-2">
                        <div className="text-xs text-gray-600">2年目以降</div>
                        <div className="text-sm font-bold text-primary">{formatYen(pattern.year2Annual)}</div>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs border-collapse">
                        <thead>
                          <tr className="bg-surface-soft">
                            <th className="border border-border p-1 text-left">項目</th>
                            <th className="border border-border p-1 text-left">種別</th>
                            <th className="border border-border p-1 text-right">単価</th>
                            <th className="border border-border p-1 text-right">数量</th>
                            <th className="border border-border p-1 text-right">合計</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pattern.breakdownLines.map((line, lineIdx) => (
                            <tr key={lineIdx}>
                              <td className="border border-border p-1">{line.type === '初期' && /初期費用/.test(line.name) ? '初期費用' : line.name}</td>
                              <td className="border border-border p-1">{line.type}</td>
                              <td className="border border-border p-1 text-right">{formatYen(line.unit)}</td>
                              <td className="border border-border p-1 text-right">{line.qty}</td>
                              <td className="border border-border p-1 text-right">{formatYen(line.subtotal)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="font-bold">
                          <tr>
                            <td colSpan={4} className="border border-border p-1 text-right">ランニング（12ヶ月）</td>
                            <td className="border border-border p-1 text-right">{formatYen(pattern.monthlyTotal * 12)}</td>
                          </tr>
                          <tr>
                            <td colSpan={4} className="border border-border p-1 text-right">初期費用合計</td>
                            <td className="border border-border p-1 text-right">{formatYen(pattern.initialTotal)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
