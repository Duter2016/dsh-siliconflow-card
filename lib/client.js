// dsh-siliconflow-card 前端：胶囊+卡片（样式取自 dsh-quota-panel 的右下角结构，vanilla JS 无依赖）
(function () {
  'use strict'
  var BASE = '/dsh-siliconflow-card'
  if (document.getElementById('siliconflow-card')) return

  var css = [
    '#siliconflow-card{position:fixed;right:18px;bottom:58px;z-index:900;display:flex;flex-direction:column;align-items:flex-end;color:#1b1b1c;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif;font-size:13px;line-height:1.45}',
    '#sf-capsule{display:inline-flex;align-items:center;gap:7px;height:32px;padding:0 12px 0 14px;border:1px solid rgba(0,0,0,.1);border-radius:18px;background:#fff;box-shadow:0 4px 12px rgba(15,17,21,.02),0 2px 8px rgba(15,17,21,.04);cursor:pointer;transition:background-color 120ms ease;touch-action:none}',
    '#sf-capsule:hover{background:#ebeef2}',
    '#sf-dot{flex:none;width:8px;height:8px;border-radius:50%;background:#adb2b8}',
    '#sf-dot.ok{background:#22c55e}#sf-dot.warn{background:#f59e0b}#sf-dot.error{background:#ef4444}',
    '#sf-capsule .sf-val{font-variant-numeric:tabular-nums;white-space:nowrap}',
    '#sf-card{display:none;width:280px;max-width:calc(100vw - 36px);margin-top:8px;padding:14px 16px 15px;border:1px solid rgba(0,0,0,.1);border-radius:16px;background:#fff;box-shadow:0 8px 26px rgba(15,17,21,.1),0 2px 6px rgba(15,17,21,.06);box-sizing:border-box}',
    '#sf-card.open{display:block}',
    '#sf-card .sf-title{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;font-size:14px;font-weight:600}',
    '#sf-card .sf-row{display:flex;justify-content:space-between;padding:4px 0;color:#1b1b1c}',
    '#sf-card .sf-row .sf-label{color:#61666b}',
    '#sf-card .sf-row .sf-num{font-variant-numeric:tabular-nums;font-weight:600}',
    '#sf-card .sf-bar{position:relative;height:5px;margin-top:10px;border-radius:999px;background:#ebeef2;overflow:hidden}',
    '#sf-card .sf-fill{height:100%;width:0;border-radius:inherit;background:#4176e6;transition:width .3s ease}',
    '#sf-card .sf-bar.warn .sf-fill{background:#f59e0b}#sf-card .sf-bar.error .sf-fill{background:#ef4444}',
    '#sf-card .sf-err{margin-top:6px;color:#ef4444;font-size:12px;word-break:break-all}',
    '#sf-card .sf-set{margin-top:12px;padding-top:10px;border-top:1px solid rgba(0,0,0,.06)}',
    '#sf-card .sf-set .sf-srow{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:3px 0}',
    '#sf-card .sf-set label{color:#61666b;font-size:12px}',
    '#sf-card input,#sf-card select{width:120px;padding:3px 8px;border:1px solid rgba(0,0,0,.14);border-radius:8px;font:inherit;font-size:12px;box-sizing:border-box}',
    '#sf-card textarea{width:100%;margin-top:6px;padding:6px 8px;border:1px solid rgba(0,0,0,.14);border-radius:8px;font:12px ui-monospace,monospace;box-sizing:border-box;min-height:56px}',
    '#sf-card .sf-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:10px}',
    '#sf-card button{padding:4px 12px;border:1px solid rgba(0,0,0,.14);border-radius:8px;background:#fff;cursor:pointer;font:inherit;font-size:12px}',
    '#sf-card button.sf-primary{background:#4176e6;border-color:#4176e6;color:#fff}',
  ].join('\n')

  var style = document.createElement('style')
  style.textContent = css
  document.head.appendChild(style)

  var root = document.createElement('div')
  root.id = 'siliconflow-card'
  root.innerHTML =
    '<div id="sf-capsule"><span id="sf-dot"></span><span class="sf-val" id="sf-val">…</span></div>' +
    '<div id="sf-card">' +
      '<div class="sf-title"><span id="sf-title-txt">硅基流动 额度</span><span id="sf-key" style="font-size:11px;font-weight:400;color:#818590"></span><span id="sf-close" style="cursor:pointer;font-size:16px;padding:0 2px;color:#818590" title="收起">×</span></div>' +
      '<div class="sf-row"><span class="sf-label">剩余额度</span><span class="sf-num" id="sf-remaining">—</span></div>' +
      '<div class="sf-row"><span class="sf-label">已用（窗口内）</span><span class="sf-num" id="sf-used">—</span></div>' +
      '<div class="sf-row"><span class="sf-label">今日已用</span><span class="sf-num" id="sf-today">—</span></div>' +
      '<div class="sf-row"><span class="sf-label">缓存命中率</span><span class="sf-num" id="sf-hit">—</span></div>' +
      '<div class="sf-row"><span class="sf-label">上下文占用</span><span class="sf-num" id="sf-ctx">—</span></div>' +
      '<div class="sf-bar"><div class="sf-fill" id="sf-fill"></div></div>' +
      '<div class="sf-err" id="sf-err" style="display:none"></div>' +
      '<div class="sf-set">' +
        '<div class="sf-srow"><label>计费时段</label><span id="sf-tariff" style="font-size:12px;font-weight:600;color:#61666b">…</span></div>' +
        '<div class="sf-srow"><label id="sf-tariff-note" style="font-size:11px;color:#818590;text-align:right;line-height:1.3"></label></div>' +
        '<div class="sf-srow"><label>总量</label><input id="sf-total" type="number" min="0" step="any"></div>' +
        '<div class="sf-srow"><label>口径</label><select id="sf-unit"><option value="money">金额（元）</option><option value="tokens">token</option></select></div>' +
        '<div class="sf-srow"><label>实际余额校准</label><input id="sf-actual" type="number" step="any" placeholder="填当前真实余额"></div>' +
        '<div class="sf-srow"><label>当前校准偏差</label><span id="sf-offset" style="font-size:12px;color:#61666b">0</span></div>' +
        '<div class="sf-srow"><label>重置</label><select id="sf-reset"><option value="none">不重置</option><option value="daily">每日</option><option value="monthly">每月</option></select></div>' +
        '<label style="display:block;margin-top:6px">单价覆盖（JSON：{"模型名":{"in":元,"cache":元,"out":元}/百万token}）</label>' +
        '<textarea id="sf-prices" spellcheck="false"></textarea>' +
        '<div class="sf-actions"><button id="sf-save" class="sf-primary">保存</button></div>' +
      '</div>' +
    '</div>'
  ;(document.body || document.documentElement).appendChild(root)

  function fmtMoney(n) { return '¥' + (Math.round(n * 100) / 100).toFixed(2) }
  function fmtTokens(n) {
    n = Math.round(n)
    if (n >= 1e8) return (n / 1e8).toFixed(2) + '亿'
    if (n >= 1e4) return (n / 1e4).toFixed(1) + '万'
    return String(n)
  }
  function fmt(used, unit) { return unit === 'money' ? fmtMoney(used.cost) + '（' + fmtTokens(used.tokens) + ' tok）' : fmtTokens(used.tokens) }

  function render(s) {
    var dot = document.getElementById('sf-dot')
    dot.className = s.keyValid ? 'ok' : (s.hasKey ? 'warn' : 'error')
    document.getElementById('sf-key').textContent = s.keyValid ? 'key ✓' : (s.hasKey ? 'key 异常' : '无 key')
    var hitDen = s.sess ? s.sess.tokens : 0 // 当前会话口径
    var hitTxt = hitDen > 0 ? ' · ' + Math.round((s.sess ? s.sess.cache : 0) / hitDen * 100) + '%' : ''
    document.getElementById('sf-val').textContent = (s.name || '硅基') + ' ' + (s.remaining < 0 ? '超额' :
      (s.unit === 'money' ? fmtMoney(s.remaining) : fmtTokens(s.remaining))) + hitTxt
    document.getElementById('sf-remaining').textContent = s.unit === 'money' ? fmtMoney(s.remaining) : fmtTokens(s.remaining)
    document.getElementById('sf-used').textContent = fmt(s.used, s.unit)
    document.getElementById('sf-today').textContent = fmt(s.today, s.unit)
    var den = s.sess ? s.sess.tokens : 0 // 当前会话口径（会话cache/会话全部token）
    var t = document.getElementById('sf-title-txt')
    if (t && s.ver) t.textContent = t.textContent.split(' v')[0] + ' v' + s.ver
    document.getElementById('sf-hit').textContent = den > 0 ? Math.round((s.sess ? s.sess.cache : 0) / den * 100) + '%' : '—'
    var ctxEl = document.getElementById('sf-ctx')
    if (s.ctx && s.ctx.tokens > 0) {
      var pct = Math.min(100, Math.round(s.ctx.tokens / s.ctx.limit * 100))
      ctxEl.textContent = pct + '% · ' + fmtTokens(s.ctx.tokens) + ' / ' + fmtTokens(s.ctx.limit)
      ctxEl.style.color = pct >= 90 ? '#ef4444' : pct >= 70 ? '#f59e0b' : ''
    } else ctxEl.textContent = '—'
    var pct = s.total > 0 ? Math.min(100, Math.max(0, (1 - Math.max(0, s.remaining) / s.total) * 100)) : 0
    document.getElementById('sf-fill').style.width = pct + '%'
    var bar = root.querySelector('.sf-bar')
    bar.className = 'sf-bar' + (pct >= 90 ? ' error' : pct >= 70 ? ' warn' : '')
    var err = document.getElementById('sf-err')
    if (s.hasKey && !s.keyValid) { err.style.display = 'block'; err.textContent = 'key 探活失败：请检查 ' + 'SILICONFLOW_API_KEY' } else err.style.display = 'none'
    // 计费时段：当前时段 + 该时段生效价（V4-Flash 规则见 note 行；各模型时段划分不同）
    var tf = s.tariff, tEl = document.getElementById('sf-tariff'), tNote = document.getElementById('sf-tariff-note')
    if (tf && tf.price) {
      var p = tf.price
      var priceTxt = 'in ' + p.in + ' / cache ' + p.cache + ' / out ' + p.out + ' 元/M'
      var off = tf.mode === 'off'
      tEl.textContent = (off ? '谷时段（半价）' : '峰时段（2×）') + ' · ' + priceTxt
      tEl.style.color = off ? '#16a34a' : '#ef4444'
      tNote.textContent = 'V4-Flash 谷 2-8 点，其余峰价（各模型时段不同，以官方定价页为准）'
    } else { tEl.textContent = '—'; tNote.textContent = '' }
  }

  function load() {
    fetch(BASE + '/summary.json').then(function (r) { return r.json() }).then(render).catch(function () {
      document.getElementById('sf-val').textContent = '—'
    })
  }

  // 卡片展开时回填设置
  function fillSettings(s) {
    document.getElementById('sf-total').value = s.total || 0
    document.getElementById('sf-unit').value = s.unit
    document.getElementById('sf-reset').value = s.reset
    document.getElementById('sf-offset').textContent = (s.offset || 0).toFixed(2)
    document.getElementById('sf-actual').value = ''
    document.getElementById('sf-prices').value = JSON.stringify(s.prices || {}, null, 1)
  }

  // 拖拽：按住胶囊移动位置，localStorage 记忆；位移超过 5px 视为拖拽（不触发卡片开合）
  var POS_KEY = 'siliconflow-card:pos'
  try {
    var saved = JSON.parse(localStorage.getItem(POS_KEY) || 'null')
    if (saved) { root.style.right = saved.right + 'px'; root.style.bottom = saved.bottom + 'px' }
  } catch (e) {}
  var drag = null
  var capsule = document.getElementById('sf-capsule')
  capsule.addEventListener('pointerdown', function (e) {
    if (e.button !== 0) return
    var r = root.getBoundingClientRect()
    drag = { sx: e.clientX, sy: e.clientY, right: window.innerWidth - r.right, bottom: window.innerHeight - r.bottom, moved: false }
    capsule.setPointerCapture(e.pointerId)
  })
  capsule.addEventListener('pointermove', function (e) {
    if (!drag) return
    var dx = e.clientX - drag.sx, dy = e.clientY - drag.sy
    if (!drag.moved && Math.abs(dx) < 5 && Math.abs(dy) < 5) return
    drag.moved = true
    var right = Math.max(0, Math.min(window.innerWidth - 60, drag.right - dx))
    var bottom = Math.max(0, Math.min(window.innerHeight - 60, drag.bottom - dy))
    root.style.right = right + 'px'
    root.style.bottom = bottom + 'px'
  })
  capsule.addEventListener('pointerup', function (e) {
    if (!drag) return
    if (drag.moved) {
      var r = root.getBoundingClientRect()
      try { localStorage.setItem(POS_KEY, JSON.stringify({ right: window.innerWidth - r.right, bottom: window.innerHeight - r.bottom })) } catch (err) {}
    }
    var moved = drag.moved
    drag = null
    if (moved) e.stopImmediatePropagation() // 拖完不触发点击
  })

  function closeCard() { document.getElementById('sf-card').classList.remove('open') }
  document.getElementById('sf-close').addEventListener('click', function (e) { e.stopPropagation(); closeCard() })
  // 点击卡片以外区域收起（胶囊自身除外）
  document.addEventListener('pointerdown', function (e) {
    var card = document.getElementById('sf-card')
    if (!card.classList.contains('open')) return
    if (card.contains(e.target) || capsule.contains(e.target)) return
    closeCard()
  })

  document.getElementById('sf-capsule').addEventListener('click', function () {
    var card = document.getElementById('sf-card')
    var opening = !card.classList.contains('open')
    card.classList.toggle('open')
    if (opening) fetch(BASE + '/summary.json').then(function (r) { return r.json() }).then(function (s) { render(s); fillSettings(s) })
  })

  document.getElementById('sf-save').addEventListener('click', function () {
    var prices = {}
    try { prices = JSON.parse(document.getElementById('sf-prices').value || '{}') } catch (e) {}
    fetch(BASE + '/settings.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        total: Number(document.getElementById('sf-total').value) || 0,
        actual: (function () { var v = document.getElementById('sf-actual').value; return v === '' ? undefined : Number(v) })(),
        unit: document.getElementById('sf-unit').value,
        reset: document.getElementById('sf-reset').value,
        prices: prices,
      }),
    }).then(load)
  })

  load()
  setInterval(load, 60000)
})()
