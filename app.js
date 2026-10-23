/* 進行・入力・UI・音。ルールはengine.js、原画とアニメーションはscene.js。 */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const { Match, KeyGate, KEYS, RULES } = window.FishingRules;
  const directionNames = { up: '上', right: '右', down: '下', left: '左' };
  const directionAngles = { up: 0, right: 90, down: 180, left: 270 };
  const scene = new window.LakeScene();
  const gate = new KeyGate();
  let state = 'title';
  let match = null;
  let gameTime = 0;
  let lastFrame = performance.now();
  let countdownAt = 0;
  let countdownResume = false;
  let finishAt = 0;
  let feedbackUntil = 0;
  const audio = new window.FishingAudio.AudioDirector(window, updateSound);
  let previousCount = '';
  let focusBeforeHelp = null;

  function announce(text) { $('announcer').textContent = text; }
  function setDirection(direction, idleName = '待機中') {
    // SVGElementにはHTMLElement.hiddenの反映を前提にしない。
    if (direction) {
      $('direction').removeAttribute('hidden');
      $('prompt-idle').setAttribute('hidden', '');
    } else {
      $('direction').setAttribute('hidden', '');
      $('prompt-idle').removeAttribute('hidden');
    }
    $('direction').setAttribute('data-direction', direction || '');
    if (direction) $('direction-arrow').setAttribute('transform', `rotate(${directionAngles[direction]} 50 50)`);
    $('direction-name').textContent = direction ? directionNames[direction] : idleName;
  }

  function updateSound() {
    const soundOn = audio.enabled;
    $('sound').textContent = soundOn ? 'SOUND ON' : 'SOUND OFF';
    $('sound').setAttribute('aria-pressed', String(soundOn));
    $('sound').setAttribute('aria-label', soundOn ? '音をオフにする' : '音をオンにする');
  }

  function hpText(units) { return String(units / 2); }
  function updateHp() {
    for (const player of ['fish', 'human']) {
      const hp = match ? match.hp[player] : RULES.maxHp;
      $(player + '-hp').innerHTML = hpText(hp) + '<span>/ 100</span>';
      const bar = $(player + '-bar');
      bar.setAttribute('aria-valuenow', hpText(hp));
      bar.querySelector('.health-fill').style.width = hp / 2 + '%';
      bar.querySelector('.health-loss').style.width = hp / 2 + '%';
    }
  }

  function resetCue() {
    $('cue').className = 'cue dormant';
    setDirection(null);
    $('prompt-label').textContent = 'STAND BY';
    $('cue').setAttribute('aria-label', '次の共通方向指示を待機中');
    for (const player of ['fish', 'human']) {
      $(player + '-judge').textContent = 'READY';
      $(player + '-detail').textContent = player === 'fish' ? 'WASD' : '矢印キー';
      $(player + '-judge').parentElement.className = 'judgment ' + player + '-judgment';
    }
  }

  function showJudgment(player, result, elapsed) {
    const element = $(player + '-judge');
    element.parentElement.className = 'judgment ' + player + '-judgment has-result ' + result.toLowerCase();
    element.textContent = result === 'MISS' ? 'NO INPUT' : result;
    $(player + '-detail').textContent = result === 'MISS' ? '変化なし' : result === 'BAD' ? '自分 −2.5' : Math.round(elapsed) + ' ms / 相手 −' + (result === 'GREAT' ? '7.5' : '5');
  }

  function onEvent(event) {
    scene.react(event);
    if (event.type === 'prompt') {
      resetCue();
      $('cue').className = 'cue active';
      setDirection(event.round.direction);
      $('deadline-ring').style.strokeDashoffset = '0';
      $('prompt-label').textContent = 'SAME DIRECTION';
      $('cue').setAttribute('aria-label', '共通方向指示 ' + directionNames[event.round.direction]);
      $('round-counter').textContent = String(event.round.number).padStart(2, '0') + ' / 20';
      $('round-feedback').textContent = '';
      $('phase').textContent = 'MAKE YOUR MOVE.';
      audio.play('prompt');
    } else if (event.type === 'judge') {
      showJudgment(event.player, event.result, event.elapsed);
      audio.play(event.result, event.player);
    } else if (event.type === 'resolve') {
      for (const player of ['fish', 'human']) if (event.results[player] === 'MISS') showJudgment(player, 'MISS', 0);
      updateHp();
      $('cue').className = 'cue dormant resolved';
      $('prompt-label').textContent = 'ROUND RESOLVED';
      $('deadline-ring').style.strokeDashoffset = '100';
      const fishLoss = (event.previous.fish - event.hp.fish) / 2;
      const humanLoss = (event.previous.human - event.hp.human) / 2;
      $('round-feedback').textContent = fishLoss || humanLoss ? `FISH −${fishLoss}　/　HUMAN −${humanLoss}` : 'NO DAMAGE / 次の指示を待とう';
      feedbackUntil = gameTime + 1000;
      $('phase').textContent = 'THE TENSION HOLDS.';
    } else if (event.type === 'finish') {
      state = 'finishing';
      finishAt = performance.now();
      $('pause').disabled = true;
      setDirection(null, '対戦終了');
      $('prompt-label').textContent = 'DUEL COMPLETE';
      $('phase').textContent = event.result;
      announce(event.result + '。魚の体力' + hpText(match.hp.fish) + '、人間の体力' + hpText(match.hp.human));
      audio.setPhase('finishing');
      audio.play(event.result === 'DOUBLE K.O.' ? 'double' : event.result === 'DRAW' ? 'draw' : 'win');
      scene.engaged = false;
    }
  }

  function startCountdown(resume = false) {
    countdownResume = resume;
    countdownAt = performance.now();
    previousCount = '';
    state = 'countdown';
    audio.setPhase('countdown');
    $('arena').classList.add('playing');
    for (const id of ['intro', 'paused', 'result', 'help']) $(id).hidden = true;
    $('countdown').hidden = false;
    $('count-number').textContent = '3';
    $('pause').disabled = false;
    $('pause').setAttribute('aria-label', '一時停止');
    $('pause').textContent = 'Ⅱ';
    document.activeElement?.blur();
  }

  function newGame() {
    audio.reset();
    match = new Match(Math.random, onEvent);
    gameTime = 0;
    scene.reset();
    resetCue();
    updateHp();
    $('timer').innerHTML = '60<span>.0</span>';
    $('timer').parentElement.classList.remove('urgent');
    $('round-counter').textContent = '00 / 20';
    $('round-feedback').textContent = '';
    $('phase').textContent = 'THE LINE IS DRAWN.';
    startCountdown(false);
  }

  function pause(message = 'ふたりの準備ができたら再開してください。') {
    if (!['playing', 'countdown'].includes(state)) return;
    state = 'paused';
    scene.clearSignals();
    audio.setPhase('paused');
    $('countdown').hidden = true;
    $('paused').hidden = false;
    $('pause-message').textContent = message;
    $('pause').textContent = '▶';
    $('pause').setAttribute('aria-label', '対戦を再開');
    $('resume').focus();
    announce('一時停止。' + message);
  }

  function toTitle() {
    state = 'title';
    audio.setPhase('title');
    match = null;
    $('arena').classList.remove('playing');
    for (const id of ['paused', 'result', 'help', 'countdown']) $(id).hidden = true;
    $('intro').hidden = false;
    $('pause').disabled = true;
    $('pause').textContent = 'Ⅱ';
    scene.reset();
    resetCue();
    updateHp();
    $('timer').innerHTML = '60<span>.0</span>';
    $('timer').parentElement.classList.remove('urgent');
    $('round-counter').textContent = '00 / 20';
    $('round-feedback').textContent = '';
    $('phase').textContent = 'THE LINE IS DRAWN.';
    $('start').focus();
  }

  function showResult() {
    state = 'result';
    audio.setPhase('result');
    $('result-title').textContent = match.result;
    $('result-reason').textContent = match.result === 'DOUBLE K.O.' ? 'BOTH FELL. NEITHER YIELDED.' : match.result === 'DRAW' ? 'SAME STRENGTH. SAME RESOLVE.' : match.time >= RULES.duration ? 'TIME UP / DUEL COMPLETE' : 'K.O. / DUEL COMPLETE';
    $('result-copy').textContent = {
      'HUMAN WIN': '最後まで、引ききった。釣り上げ成功。',
      'FISH WIN': '糸を切り、餌もいただく。自由を取り戻した。',
      'DOUBLE K.O.': '同じ一瞬に、最後の力を使いきった。',
      'DRAW': '60秒の攻防。互いの意地は、譲らなかった。'
    }[match.result];
    $('result-fish').textContent = hpText(match.hp.fish);
    $('result-human').textContent = hpText(match.hp.human);
    $('stats').replaceChildren();
    for (const label of ['GREAT', 'GOOD', 'BAD', 'MISS']) {
      const left = document.createElement('span');
      const middle = document.createElement('b');
      const right = document.createElement('span');
      left.textContent = String(match.stats.fish[label]);
      middle.textContent = label === 'MISS' ? 'NO INPUT' : label;
      right.textContent = String(match.stats.human[label]);
      $('stats').append(left, middle, right);
    }
    $('result').hidden = false;
    $('rematch').focus();
  }

  function openHelp() {
    if (state === 'finishing') return;
    focusBeforeHelp = document.activeElement;
    if (state === 'playing' || state === 'countdown') pause();
    $('help').hidden = false;
    $('help-close').focus();
  }
  function closeHelp() {
    $('help').hidden = true;
    if (state === 'paused') $('resume').focus();
    else focusBeforeHelp?.focus();
  }

  function frame(stamp) {
    const delta = Math.max(0, stamp - lastFrame);
    lastFrame = stamp;
    if (state === 'playing') {
      // 復帰時に矢印をまとめて消化しない。大きい描画停止は両者同時に停止。
      if (delta > 200) pause('画面の更新が止まったため、一時停止しました。');
      else {
        gameTime = Math.min(RULES.duration, gameTime + delta);
        match.advance(gameTime);
        const remaining = Math.max(0, RULES.duration - gameTime);
        const tenths = Math.ceil(remaining / 100);
        $('timer').innerHTML = Math.floor(tenths / 10).toString().padStart(2, '0') + '<span>.' + tenths % 10 + '</span>';
        $('timer').parentElement.classList.toggle('urgent', remaining <= 10000);
        if (match.active) {
          const fraction = Math.max(0, Math.min(1, (gameTime - match.active.openedAt) / RULES.window));
          $('deadline-ring').style.strokeDashoffset = String(fraction * 100);
        } else if (gameTime > feedbackUntil && !match.result) {
          resetCue();
          $('round-feedback').textContent = '';
        }
      }
    } else if (state === 'countdown') {
      if (delta > 200) countdownAt = stamp;
      const elapsed = stamp - countdownAt;
      const count = elapsed < 1000 ? '3' : elapsed < 2000 ? '2' : elapsed < 3000 ? '1' : 'GO';
      $('count-number').textContent = count;
      if (count !== previousCount) { audio.play(count === 'GO' ? 'go' : 'count'); previousCount = count; }
      if (elapsed >= 3300) {
        state = 'playing';
        scene.engaged = true;
        audio.setPhase('playing');
        $('countdown').hidden = true;
        announce(countdownResume ? '対戦を再開しました。' : '対戦開始。左の魚はWASD、右の人間は矢印キーです。');
      }
    } else if (state === 'finishing' && stamp - finishAt >= 2200) showResult();
    scene.update(delta / 1000, state === 'paused' || (!$('help').hidden));
    audio.updateMix();
    requestAnimationFrame(frame);
  }

  document.addEventListener('keydown', event => {
    if (KEYS[event.code]) event.preventDefault();
    const key = gate.down(event.code, event.repeat);
    if (event.code === 'Escape' && !event.repeat) {
      if (!$('help').hidden) closeHelp();
      else if (state === 'paused') startCountdown(true);
      else pause();
      return;
    }
    if (key && state === 'playing' && $('help').hidden) {
      const sinceFrame = Math.max(0, performance.now() - lastFrame);
      if (sinceFrame > 200) { pause('画面の更新が止まったため、一時停止しました。'); return; }
      // 入力ハンドラが受け付けた時刻。描画フレームより細かい精度で判定。
      const receivedAt = gameTime + sinceFrame;
      if (receivedAt <= RULES.duration) match.input(key[0], key[1], receivedAt);
    }
  });
  document.addEventListener('keyup', event => gate.up(event.code));
  window.addEventListener('blur', () => { gate.clear(); pause('画面を離れたため、一時停止しました。'); audio.silence(); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { gate.clear(); pause('画面を離れたため、一時停止しました。'); audio.silence(); }
  });

  $('start').addEventListener('click', newGame);
  $('rematch').addEventListener('click', newGame);
  $('resume').addEventListener('click', () => startCountdown(true));
  $('pause').addEventListener('click', () => state === 'paused' ? startCountdown(true) : pause());
  $('quit').addEventListener('click', toTitle);
  $('back').addEventListener('click', toTitle);
  document.querySelector('.brand').addEventListener('click', event => { event.preventDefault(); if (state === 'playing' || state === 'countdown') pause(); else if (state !== 'paused' && state !== 'finishing') toTitle(); });
  $('sound').addEventListener('click', () => {
    audio.setEnabled(!audio.enabled).then(updateSound);
    updateSound();
  });
  for (const id of ['help-open', 'guide']) $(id).addEventListener('click', openHelp);
  for (const id of ['help-close', 'help-done']) $(id).addEventListener('click', closeHelp);
  $('help').addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const nodes = [$('help-close'), $('help-done')];
    const first = nodes[0], last = nodes[1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  $('fullscreen').addEventListener('click', async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await $('arena').requestFullscreen();
    } catch (_) { announce('この環境では全画面表示を利用できません。'); }
  });
  $('start').focus({ preventScroll: true });
  requestAnimationFrame(frame);
})();
