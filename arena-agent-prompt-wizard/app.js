(function () {
  'use strict';

  var STEP_TITLES = [
    'Task type',
    'Objective & Definition of Done',
    'Required Deliverables',
    'Done Criteria',
    'Context & Ground Truth',
    'Technical & Style Constraints',
    'Tool & Execution Boundaries',
    'Phased Execution Plan',
    'Output Contract',
    'Prompt Brief'
  ];

  var CHIP_LABELS = {
    code: 'Code',
    research: 'Research',
    document: 'Documents',
    design: 'Designs',
    multimodal: 'Images / Multimodal',
    other: 'Other'
  };

  var DEFAULT_AMBIGUITY =
    'If a critical requirement is underspecified or a source conflicts, pause and ask before assuming; ' +
    'for minor implementation details, pick the simplest compliant option and log the assumption.';

  var DEFAULT_RECOVERY =
    'If a command or tool fails twice with the same error, stop retrying blindly—diagnose the root cause or ask for guidance.';

  var S = {
    step: 0,
    taskType: 'code',
    goal: '',
    deliverables: [],
    doneCriteria: [],
    inputs: '',
    facts: '',
    outOfScope: '',
    stack: '',
    formatting: '',
    ambiguity: '',
    allowed: '',
    restricted: '',
    recovery: '',
    plan: [],
    contract: ''
  };

  function $(id) { return document.getElementById(id); }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function save() {
    try { localStorage.setItem('arena-prompt-wizard', JSON.stringify(S)); } catch (e) { /* ignore */ }
  }

  function load() {
    try {
      var raw = localStorage.getItem('arena-prompt-wizard');
      if (raw) {
        var o = JSON.parse(raw);
        Object.keys(S).forEach(function (k) {
          if (Object.prototype.hasOwnProperty.call(o, k)) S[k] = o[k];
        });
      }
    } catch (e) { /* ignore */ }
  }

  function setStatus(msg) {
    var el = $('statusToast');
    if (!el) return;
    el.textContent = msg;
    el.classList.remove('visible');
    el.offsetWidth; // trigger reflow for the opacity transition
    el.classList.add('visible');
    window.clearTimeout(el._to);
    el._to = window.setTimeout(function () { el.classList.remove('visible'); }, 2400);
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(
        function () { setStatus('Copied to clipboard.'); },
        function () { setStatus('Clipboard blocked — select the text and copy manually.'); }
      );
    }
    var ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      setStatus('Copied to clipboard.');
    } catch (e) {
      setStatus('Clipboard blocked — select the text and copy manually.');
    }
    document.body.removeChild(ta);
    return Promise.resolve();
  }

  // ---------- generated artifacts ----------

  function generatePlan() {
    var parts = [
      'Inspect & Map — Audit inputs and deliverables, verify assumptions, and outline the approach in under 5 bullets. [Optional: STOP here for sign-off before executing]',
      'Execute — Build the deliverables or synthesize findings incrementally.',
      'Verify — Run the self-checks below and fix any failures before finishing.',
      'Handoff — Summarize what changed, list verification results, and flag any remaining risks or assumptions.'
    ];
    S.plan = parts;
    return parts;
  }

  function generateContract() {
    var lines = [];
    lines.push('- **Deliverables:** ' + (S.deliverables.length ? S.deliverables.join(', ') : '(none captured yet)'));
    lines.push('- **Verification:** ' + (S.doneCriteria.length
      ? 'Cite the command output or evidence for each done criterion.'
      : 'Add done criteria in the wizard so this is concrete.'));
    lines.push('- **Restricted actions:** none violated — boundaries are set in the Tool & Execution Boundaries section.');
    lines.push('- **Remaining risks / assumptions:** ' + (S.outOfScope ? S.outOfScope : '(add an Out of Scope line in the wizard).'));
    S.contract = lines.join('\n');
    return S.contract;
  }

  function renderPromptBrief() {
    var L = [];
    L.push('# Objective & Definition of Done');
    L.push('');
    L.push('- **Primary Goal:** ' + (S.goal || '(not entered yet)'));
    L.push('');
    L.push('- **Required Deliverables:**');
    L.push('');
    (S.deliverables.length ? S.deliverables : ['(none yet)']).forEach(function (d, i) {
      L.push('  ' + (i + 1) + '. ' + d);
    });
    L.push('');
    L.push('- **Done Criteria (Pass/Fail):**');
    L.push('');
    (S.doneCriteria.length ? S.doneCriteria : ['(none yet)']).forEach(function (d) {
      L.push('  - ' + d);
    });
    L.push('');
    L.push('# Context & Ground Truth');
    L.push('');
    L.push('- **Inputs Provided:** ' + (S.inputs || '(none yet)'));
    L.push('');
    L.push('- **Hard Facts / Invariants:** ' + (S.facts || '(none yet)'));
    L.push('');
    L.push('- **Out of Scope:** ' + (S.outOfScope || '(none yet)'));
    L.push('');
    L.push('# Technical & Style Constraints');
    L.push('');
    L.push('- **Stack / Environment:** ' + (S.stack || '(none yet)'));
    L.push('');
    L.push('- **Formatting & Standards:** ' + (S.formatting || '(none yet)'));
    L.push('');
    L.push('- **Ambiguity Handling:** ' + (S.ambiguity || DEFAULT_AMBIGUITY));
    L.push('');
    L.push('# Tool & Execution Boundaries');
    L.push('');
    L.push('- **Allowed Actions:** ' + (S.allowed || '(none yet)'));
    L.push('');
    L.push('- **Restricted Actions:** ' + (S.restricted || '(none yet)'));
    L.push('');
    L.push('- **Error Recovery Rule:** ' + (S.recovery || DEFAULT_RECOVERY));
    L.push('');
    L.push('# Phased Execution Plan');
    L.push('');
    S.plan.forEach(function (p, i) { L.push((i + 1) + '. ' + p); });
    L.push('');
    L.push('# Output Contract');
    L.push('');
    L.push(S.contract);
    L.push('');
    return L.join('\n');
  }

  function generateRubric() {
    if (!S.deliverables.length) return '(Add deliverables in the wizard to generate a rubric here.)';
    return S.deliverables.map(function (d) {
      return [
        '## Rubric — ' + d,
        '',
        '| Criterion | Scale | Pass threshold |',
        '|---|---|---|',
        '| Exact deliverable present (path / format matches the brief) | 1–5 | 4 |',
        '| Completeness — all required items delivered | 1–5 | 4 |',
        '| Correctness — facts and logic are accurate | 1–5 | 3 |',
        '| Boundary compliance — no restricted actions taken | pass/fail | pass |',
        '| Self-checkability — verifiable evidence, not "seems good" | pass/fail | pass |'
      ].join('\n') + '\n';
    }).join('\n');
  }

  function generateEvalSpec() {
    var L = [];
    L.push('# Eval & Rubric Design Brief');
    L.push('');
    L.push('## Objective & Definition of Done');
    L.push('- **Primary Goal:** ' + (S.goal || '(not entered yet)'));
    L.push('- **Required Deliverables:** ' + (S.deliverables.length ? S.deliverables.join(', ') : '(none yet)'));
    L.push('- **Done Criteria (Pass/Fail):** ' + (S.doneCriteria.length ? S.doneCriteria.join('; ') : '(none yet)'));
    L.push('');
    L.push('## Rubric Design Rules');
    L.push('- Score on a 1–5 scale per criterion; define what each level means.');
    L.push('- Every criterion must map to a measurable outcome (evidence-based, not "seems good").');
    L.push('- Include criteria for: correctness, completeness, format adherence, safety/boundary compliance, and self-checkability.');
    L.push('');
    L.push('## Eval Spec Design Rules');
    L.push('- The Arena prompt must be fully self-contained (goal + definition of done + guardrails).');
    L.push('- Define expected pass criteria for the agent run (e.g., "output file exists with X", "tests pass").');
    L.push('');
    L.push('## Constraints');
    L.push('- **Allowed Actions:** ' + (S.allowed || '(none yet)'));
    L.push('- **Restricted Actions:** ' + (S.restricted || '(none yet)'));
    L.push('');
    L.push('## Ambiguity Handling');
    L.push(S.ambiguity || DEFAULT_AMBIGUITY);
    return L.join('\n');
  }

  // ---------- template library ----------

  var TEMPLATES = [
    {
      id: 'prompt-brief',
      title: 'Prompt Brief Template',
      category: 'Arena prompt',
      summary:
        'The classic Arena brief: Objective/Definition of Done, Required Deliverables, Done Criteria, Context & Ground Truth, Technical & Style Constraints, Tool & Execution Boundaries, Phased Execution Plan and a Verification Checklist.',
      body: renderPromptBrief
    },
    {
      id: 'prompt-guardrails',
      title: 'Arena Prompt & Guardrails Spec',
      category: 'Arena prompt',
      summary:
        'Arena-specific spec: self-contained objective, deliverables, approval gate for irreversible actions, a drift checkpoint at the halfway point, and an Output Contract.',
      body: function () {
        return [
          '# Arena Agent Prompt & Guardrails Spec',
          '',
          '# Objective & Definition of Done',
          '- **Primary Goal:** ' + (S.goal || '[Exact outcome; the agent must produce this]'),
          '- **Required Deliverables:**',
          '  1. [File path / structured output 1]',
          '  2. [File path / structured output 2]',
          '- **Done Criteria (Pass/Fail):**',
          '  - [Measurable condition 1]',
          '  - [Measurable condition 2]',
          '',
          '# Tool & Execution Boundaries (Arena-specific)',
          '- **Allowed Actions:** Read files, run non-destructive tests/linters, web search for official docs',
          '- **Restricted Actions:** Do NOT modify files outside the allowed workspace, do NOT delete data, do NOT send messages externally, do NOT install packages',
          '- **Error Recovery Rule:** Stop after 2 identical failures — diagnose the root cause or ask for guidance.',
          '',
          '# Guardrails',
          '- **Approval Gate:** Anything irreversible (deploy, push, pay) requires an explicit human gate.',
          '- **Drift Checkpoint:** At 50% of the plan, print a short status summary before continuing.',
          '',
          '# Output Contract',
          'Final reply must contain: deliverable paths, verification results (with evidence), and open risks.'
        ].join('\n');
      }
    },
    {
      id: 'eval-rubric',
      title: 'Eval & Rubric Design Template',
      category: 'Evals & rubrics',
      summary:
        'Generate a weighted rubric, an eval spec prompt to run in Arena Agent Mode, and a final verification checklist to guarantee top-quality outputs.',
      body: generateEvalSpec
    },
    {
      id: 'phased-plan',
      title: 'Phased Execution Plan',
      category: 'Planning',
      summary:
        'Four phases — Inspect & Map, Execute, Verify, Handoff — with the "STOP here for sign-off" option in phase 1.',
      body: function () { return generatePlan().map(function (p, i) { return (i + 1) + '. ' + p; }).join('\n'); }
    }
  ];

  // ---------- stepper ----------

  function updateProgress() {
    var total = STEP_TITLES.length;
    var pct = Math.round(((S.step + 1) / total) * 100);
    $('progressBar').setAttribute('aria-valuenow', pct);
    $('progressFill').style.width = pct + '%';
    $('progressLabel').textContent = pct + '%';
    $('stepperList').querySelectorAll('.step').forEach(function (el) {
      el.classList.toggle('active', parseInt(el.getAttribute('data-step'), 10) === S.step);
    });
  }

  function renderStepper() {
    $('stepperList').innerHTML = STEP_TITLES.map(function (t, i) {
      return '<span class="step' + (i === S.step ? ' active' : '') + '" data-step="' + i + '" tabindex="0" role="button">' +
        '<span class="step-num">' + (i + 1) + '</span><span class="step-title">' + esc(t) + '</span></span>';
    }).join('');
    $('stepperList').querySelectorAll('.step').forEach(function (el) {
      el.addEventListener('click', function () {
        goTo(parseInt(el.getAttribute('data-step'), 10));
      });
    });
    updateProgress();
  }

  function goTo(i) {
    S.step = Math.max(0, Math.min(STEP_TITLES.length - 1, i));
    renderStep();
    renderStepper();
    save();
  }

  // ---------- wizard steps ----------

  function stepTaskType() {
    var chips = Object.keys(CHIP_LABELS).map(function (t) {
      return '<button type="button" class="chip' + (t === S.taskType ? ' active' : '') + '" data-task="' + t + '">' +
        esc(CHIP_LABELS[t]) + '</button>';
    }).join('');
    return '<section class="step-card fade-in">' +
      '<h2>What kind of job is this?</h2>' +
      '<p>Arena agents fit different shapes of work — pick the closest type.</p>' +
      '<div class="chips" role="group" aria-label="Task types">' + chips + '</div>' +
      '<p class="hint">Real-world split among Arena users: code writing 17.5%, research &amp; lookup 10.8%, planning &amp; brainstorming 10.6%…</p>' +
    '</section>';
  }

  function stepGoal() {
    return '<section class="step-card fade-in">' +
      '<h2>Objective &amp; Definition of Done</h2>' +
      '<p>Write the primary goal as 1–2 sentences stating the exact artifact you want.</p>' +
      '<label for="goalInput">Primary Goal</label>' +
      '<textarea id="goalInput" class="textarea" rows="4"></textarea>' +
    '</section>';
  }

  function stepDeliverables() {
    return '<section class="step-card fade-in">' +
      '<h2>Required Deliverables</h2>' +
      '<p>List the exact file paths, formats, or structured outputs that must exist when the agent finishes.</p>' +
      '<ol id="deliverablesList"></ol>' +
      '<button type="button" id="addDeliverableBtn" class="link-btn">+ Add deliverable</button>' +
    '</section>';
  }

  function stepDoneCriteria() {
    return '<section class="step-card fade-in">' +
      '<h2>Done Criteria (Pass/Fail)</h2>' +
      '<p>List the measurable conditions that make the job "done" — these become your verification checklist.</p>' +
      '<ol id="doneCriteriaList"></ol>' +
      '<button type="button" id="addDoneCriteriaBtn" class="link-btn">+ Add done criterion</button>' +
    '</section>';
  }

  function stepContext() {
    return '<section class="step-card fade-in">' +
      '<h2>Context &amp; Ground Truth</h2>' +
      '<label for="inputsInput">Inputs Provided</label>' +
      '<textarea id="inputsInput" class="textarea" rows="3" placeholder="Paste URLs, snippets, or describe files that matter…"></textarea>' +
      '<label for="factsInput">Hard Facts / Invariants</label>' +
      '<textarea id="factsInput" class="textarea" rows="3" placeholder="Non-negotiable rules, API contracts, behavior that must stay intact…"></textarea>' +
      '<label for="scopeInput">Out of Scope</label>' +
      '<textarea id="scopeInput" class="textarea" rows="3" placeholder="Explicitly state what not to touch — e.g., out of scope: refactors in other files"></textarea>' +
    '</section>';
  }

  function stepConstraints() {
    return '<section class="step-card fade-in">' +
      '<h2>Technical &amp; Style Constraints</h2>' +
      '<label>Stack / Environment</label>' +
      '<textarea id="stackInput" class="textarea" rows="2"></textarea>' +
      '<label>Formatting &amp; Standards</label>' +
      '<textarea id="formattingInput" class="textarea" rows="2"></textarea>' +
      '<label>Ambiguity Handling</label>' +
      '<textarea id="ambiguityInput" class="textarea" rows="3">' + esc(S.ambiguity || DEFAULT_AMBIGUITY) + '</textarea>' +
    '</section>';
  }

  function stepBoundaries() {
    return '<section class="step-card fade-in">' +
      '<h2>Tool &amp; Execution Boundaries (Arena-specific)</h2>' +
      '<label>Allowed Actions</label>' +
      '<textarea id="allowedInput" class="textarea" rows="3" placeholder="Read files, run non-destructive tests/linters, web search for official docs…"></textarea>' +
      '<label>Restricted Actions</label>' +
      '<textarea id="restrictedInput" class="textarea" rows="3" placeholder="Do NOT modify files outside the allowed workspace, delete data, send messages externally, or install packages…"></textarea>' +
      '<label>Error Recovery Rule</label>' +
      '<textarea id="recoveryInput" class="textarea" rows="2">' + esc(S.recovery || DEFAULT_RECOVERY) + '</textarea>' +
      '<p class="hint">Guardrails: approval gates for irreversible actions (deploy, push, pay, email) are strongly recommended.</p>' +
    '</section>';
  }

  function stepPlan() {
    generatePlan();
    return '<section class="step-card fade-in">' +
      '<h2>Phased Execution Plan</h2>' +
      '<p>Edit the phases if they don’t fit — they drive the agent’s checkpoints.</p>' +
      '<ol id="planList"></ol>' +
    '</section>';
  }

  function stepContract() {
    generateContract();
    return '<section class="step-card fade-in">' +
      '<h2>Output Contract</h2>' +
      '<label>What the agent must reply with when done</label>' +
      '<textarea id="contractInput" class="textarea" rows="6"></textarea>' +
    '</section>';
  }

  function stepBrief() {
    generatePlan();
    generateContract();
    return '<section class="step-card fade-in">' +
      '<h2>Prompt Brief</h2>' +
      '<p>Ready to paste into Arena Agent Mode — the live preview is above.</p>' +
      '<p class="hint">On the last step, “Copy Prompt Brief” copies it to your clipboard.</p>' +
    '</section>';
  }

  // ---------- step renderer ----------

  function renderStep() {
    var title = STEP_TITLES[S.step];
    var html;
    if (title === 'Task type') html = stepTaskType();
    else if (title === 'Objective & Definition of Done') html = stepGoal();
    else if (title === 'Required Deliverables') html = stepDeliverables();
    else if (title === 'Done Criteria') html = stepDoneCriteria();
    else if (title === 'Context & Ground Truth') html = stepContext();
    else if (title === 'Technical & Style Constraints') html = stepConstraints();
    else if (title === 'Tool & Execution Boundaries') html = stepBoundaries();
    else if (title === 'Phased Execution Plan') html = stepPlan();
    else if (title === 'Output Contract') html = stepContract();
    else html = stepBrief();

    $('stepContent').innerHTML = html;
    $('nextBtn').textContent = title === 'Prompt Brief' ? 'Copy Prompt Brief' : 'Next';
    wireUpCurrentStep();
    updateProgress();
    renderPreview();
    renderRubric();
    renderEvalSpec();
  }

  function renderPreview() { $('previewCode').textContent = renderPromptBrief(); }
  function renderRubric() { $('rubricPreview').textContent = generateRubric(); }
  function renderEvalSpec() { $('evalSpecPreview').textContent = generateEvalSpec(); }

  // ---------- wiring ----------

  function bindTextarea(id, key) {
    var el = $(id);
    if (!el) return;
    el.value = S[key] == null ? '' : S[key];
    el.addEventListener('input', function () { S[key] = el.value; save(); });
  }

  function renderPlanList() {
    $('planList').innerHTML = S.plan.map(function (p, i) {
      return '<li class="plan-step fade-in">' + (i + 1) + '. ' + esc(p) + '</li>';
    }).join('');
  }

  function renderListEditor(key, listId, addBtnId, label) {
    var list = $(listId);
    var addBtn = $(addBtnId);
    var items = S[key];
    list.innerHTML = items.length
      ? items.map(function (v, i) {
          return '<li class="row" data-index="' + i + '">' +
            '<input class="row-input" aria-label="' + esc(label) + ' ' + (i + 1) + '" value="' + esc(v) + '">' +
            '<button type="button" class="row-remove" aria-label="Remove ' + esc(label.toLowerCase()) + ' ' + (i + 1) + '">✕</button></li>';
        }).join('')
      : '<li class="row empty">(no items yet)</li>';

    list.querySelectorAll('.row-input').forEach(function (inp, i) {
      inp.addEventListener('input', function () { S[key][i] = inp.value; save(); });
    });
    list.querySelectorAll('.row-remove').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var idx = parseInt(btn.closest('.row').getAttribute('data-index'), 10);
        S[key].splice(idx, 1);
        save();
        renderListEditor(key, listId, addBtnId, label);
      });
    });
    if (addBtn) {
      addBtn.addEventListener('click', function () {
        S[key].push('');
        save();
        renderListEditor(key, listId, addBtnId, label);
      });
    }
  }

  function wireUpCurrentStep() {
    var title = STEP_TITLES[S.step];
    if (title === 'Task type') {
      document.querySelectorAll('[data-task]').forEach(function (btn) {
        btn.classList.toggle('active', btn.getAttribute('data-task') === S.taskType);
        btn.addEventListener('click', function () {
          S.taskType = btn.getAttribute('data-task');
          save();
          renderStepper();
        });
      });
    } else if (title === 'Objective & Definition of Done') {
      bindTextarea('goalInput', 'goal');
    } else if (title === 'Required Deliverables') {
      renderListEditor('deliverables', 'deliverablesList', 'addDeliverableBtn', 'Deliverable');
    } else if (title === 'Done Criteria') {
      renderListEditor('doneCriteria', 'doneCriteriaList', 'addDoneCriteriaBtn', 'Done criterion');
    } else if (title === 'Context & Ground Truth') {
      bindTextarea('inputsInput', 'inputs');
      bindTextarea('factsInput', 'facts');
      bindTextarea('scopeInput', 'outOfScope');
    } else if (title === 'Technical & Style Constraints') {
      bindTextarea('stackInput', 'stack');
      bindTextarea('formattingInput', 'formatting');
      bindTextarea('ambiguityInput', 'ambiguity');
    } else if (title === 'Tool & Execution Boundaries') {
      bindTextarea('allowedInput', 'allowed');
      bindTextarea('restrictedInput', 'restricted');
      bindTextarea('recoveryInput', 'recovery');
    } else if (title === 'Phased Execution Plan') {
      generatePlan();
      renderPlanList();
    } else if (title === 'Output Contract') {
      generateContract();
      bindTextarea('contractInput', 'contract');
    }
  }

  function nextStep() {
    if (S.step < STEP_TITLES.length - 1) { goTo(S.step + 1); return; }
    copyText(renderPromptBrief());
  }

  function prevStep() { goTo(S.step - 1); }

  // ---------- library ----------

  function renderLibrary(filter) {
    var list = $('libraryList');
    var f = String(filter == null ? '' : filter).trim().toLowerCase();
    var visible = TEMPLATES.filter(function (t) {
      return !f ||
        t.title.toLowerCase().indexOf(f) !== -1 ||
        t.category.toLowerCase().indexOf(f) !== -1 ||
        t.summary.toLowerCase().indexOf(f) !== -1;
    });
    list.innerHTML = visible.length
      ? visible.map(function (t) {
          return '<li class="library-card fade-in">' +
            '<div class="library-head"><span class="library-title">' + esc(t.title) + '</span>' +
            '<span class="library-cat">' + esc(t.category) + '</span></div>' +
            '<p class="library-summary">' + esc(t.summary) + '</p>' +
            '<button type="button" class="link-btn library-copy" data-template="' + t.id + '">Copy to clipboard</button>' +
            '</li>';
        }).join('')
      : '<li class="library-card fade-in empty"><em>No templates match the search.</em></li>';

    list.querySelectorAll('.library-copy').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-template');
        var t = TEMPLATES.filter(function (x) { return x.id === id; })[0];
        if (!t) return;
        copyText(typeof t.body === 'function' ? t.body() : t.body);
        setStatus('Template "' + t.title + '" copied to clipboard.');
      });
    });
  }

  // ---------- init ----------

  load();
  generatePlan();
  generateContract();
  renderStepper();
  renderStep();
  renderLibrary('');

  $('prevBtn').addEventListener('click', prevStep);
  $('nextBtn').addEventListener('click', nextStep);
  $('resetBtn').addEventListener('click', function () {
    S.step = 0;
    S.taskType = 'code';
    S.goal = '';
    S.deliverables = [];
    S.doneCriteria = [];
    S.inputs = '';
    S.facts = '';
    S.outOfScope = '';
    S.stack = '';
    S.formatting = '';
    S.ambiguity = '';
    S.allowed = '';
    S.restricted = '';
    S.recovery = '';
    S.plan = [];
    S.contract = '';
    save();
    renderStepper();
    renderStep();
    renderLibrary('');
    setStatus('Wizard reset.');
  });
  $('generateRubricBtn').addEventListener('click', function () {
    renderRubric();
    setStatus('Rubric markdown refreshed.');
  });
  $('copyPromptBtn').addEventListener('click', function () { copyText(renderPromptBrief()); });
  $('sendToArenaBtn').addEventListener('click', function () {
    window.open('https://arena.ai/agent', '_blank', 'noopener,noreferrer');
    setStatus('Opened arena.ai/agent — paste the Prompt Brief there.');
  });
  $('copyEvalSpecBtn').addEventListener('click', function () { copyText(generateEvalSpec()); });
  $('copyRubricBtn').addEventListener('click', function () { copyText(generateRubric()); });
  $('librarySearch').addEventListener('input', function (e) { renderLibrary(e.target.value); });
  setStatus('Ready — answer the wizard, then copy the Prompt Brief to Arena Agent Mode.');
})();
