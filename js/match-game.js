(() => {
  const shell = document.querySelector('.game-shell');
  if (!shell || document.getElementById('matchGameStage')) return;

  const LOGO_BASE = 'assets/clubs/guatemala/';
  const ROLES = ['goalkeeper','defender','midfielder','forward'];
  const ROLE_LABEL = { goalkeeper:'POR', defender:'DEF', midfielder:'MED', forward:'DEL' };
  const ROLE_NAME = { goalkeeper:'Portero', defender:'Defensa', midfielder:'Mediocampista', forward:'Delantero' };
  const FIELD = { x:55, y:42, w:850, h:456, goalH:138 };
  const MATCH_END = 90;
  const MAX_AIM = { goalkeeper:105, defender:145, midfielder:155, forward:150 };
  const ZONES = {
    home:{ goalkeeper:{minX:70,maxX:215,minY:170,maxY:370}, defender:{minX:100,maxX:530,minY:75,maxY:465}, midfielder:{minX:210,maxX:725,minY:70,maxY:470}, forward:{minX:390,maxX:875,minY:70,maxY:470} },
    away:{ goalkeeper:{minX:745,maxX:890,minY:170,maxY:370}, defender:{minX:430,maxX:860,minY:75,maxY:465}, midfielder:{minX:235,maxX:750,minY:70,maxY:470}, forward:{minX:85,maxX:570,minY:70,maxY:470} }
  };
  const START = {
    home:{ goalkeeper:{x:125,y:270}, defender:{x:285,y:320}, midfielder:{x:425,y:210}, forward:{x:610,y:290} },
    away:{ goalkeeper:{x:835,y:270}, defender:{x:675,y:220}, midfielder:{x:535,y:330}, forward:{x:350,y:250} }
  };

  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = 'css/match-game.css?v=3.1.6';
  document.head.appendChild(style);

  const stage = document.createElement('section');
  stage.id = 'matchGameStage';
  stage.className = 'screen secondary-screen match-game-scene';
  stage.innerHTML = `<div class="match-game-shell">
    <header class="match-game-header">
      <button id="matchGameBack" class="match-game-back" type="button">← Volver al club</button>
      <div class="match-scoreboard"><div><strong id="matchHomeCode">LOC</strong><span id="matchHomeScore">0</span></div><b id="matchClock">00'</b><div><span id="matchAwayScore">0</span><strong id="matchAwayCode">VIS</strong></div></div>
      <button id="matchPauseButton" class="match-pause" type="button">⏸ Pausa</button>
    </header>
    <main class="physics-match-main">
      <section class="physics-field-wrap"><canvas id="matchCanvas" width="960" height="540"></canvas><div id="matchEvent" class="match-event">El partido está listo.</div></section>
      <aside class="physics-panel">
        <p class="eyebrow">PRUEBA 5.1</p>
        <h2 id="turnTitle">Apunta la ficha</h2>
        <p id="turnDescription">Mantén clic, arrastra la flecha y suelta. La ficha golpeará físicamente la pelota.</p>
        <div class="physics-help">
          <div><b>🎯 Apunta</b><span>La flecha marca dirección y potencia.</span></div>
          <div><b>⚽ Impacto físico</b><span>La ficha transmite fuerza a la pelota al chocar.</span></div>
          <div><b>🔁 Un movimiento</b><span>Después responde inmediatamente la IA.</span></div>
        </div>
        <div class="movement-meter"><small>POTENCIA</small><div><span id="movementFill"></span></div><b id="selectedPieceLabel">Selecciona una ficha</b></div>
        <button id="matchStartButton" class="match-start" type="button">Comenzar partido</button>
      </aside>
    </main>
    <footer class="physics-footer"><span>El portero permanece en su zona.</span><strong id="turnFooter">Tu turno</strong><span>Solo DEL puede marcar.</span></footer>
    <div id="goalCelebration" class="goal-celebration" hidden><div class="goal-celebration-card"><div class="goal-word">¡GOOOOOOL!</div><img id="goalClubLogo" alt="Escudo del club"><strong id="goalPlayerName">Jugador</strong><span id="goalClubName">Club</span><b id="goalScoreText">1 - 0</b></div></div>
    <div id="pauseOverlay" class="match-pause-overlay" hidden><div class="match-pause-card"><p class="eyebrow">PARTIDO EN PAUSA</p><h2>Partido detenido</h2><p>La física y el turno quedan congelados.</p><button id="resumeMatchButton" type="button">Continuar</button><button id="pauseRulesButton" type="button">Cómo jugar</button><button id="abandonMatchButton" class="is-danger" type="button">Abandonar partido</button><div id="pauseRules" class="pause-rules" hidden>Mantén clic sobre una ficha, arrastra para apuntar y suelta. La longitud de la flecha controla la distancia y potencia del movimiento. La ficha se desplaza sola y golpea físicamente la pelota. Después juega el rival.</div></div></div>
  </div>`;
  shell.appendChild(stage);

  const $ = (id) => document.getElementById(id);
  const canvas = $('matchCanvas'), ctx = canvas.getContext('2d');
  const startButton=$('matchStartButton'), pauseButton=$('matchPauseButton'), pauseOverlay=$('pauseOverlay'), goalCelebration=$('goalCelebration');
  const eventEl=$('matchEvent'), turnTitle=$('turnTitle'), turnDescription=$('turnDescription'), turnFooter=$('turnFooter'), movementFill=$('movementFill'), selectedPieceLabel=$('selectedPieceLabel');

  let homeClub, awayClub, homeLineup, awayLineup;
  let pieces={home:{},away:{}}, ball={x:480,y:270,vx:0,vy:0,r:11};
  let running=false, paused=false, resolving=false, playerTurn=true, aiming=null;
  let minute=0, homeScore=0, awayScore=0, halftime=false, lastFrame=0, raf=0;
  let lastTouch=null, goalLock=false, matchStats={}, goalLog=[];

  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  const playerInfo=(id)=>window.LHDF_DATA?.players?.find(p=>p.id===id)||null;
  const clubInfo=(id)=>window.LHDF_DATA?.clubs?.find(c=>c.id===id)||null;
  const logoPath=(file)=>`${LOGO_BASE}${encodeURIComponent(file).replace(/%2F/g,'/')}`;
  const code=(club)=>(club?.name||'CLB').replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g,'').slice(0,3).toUpperCase();
  const clubColor=(club,side)=>({municipal:'#d52b3d',comunicaciones:'#efefef','antigua-gfc':'#27905d','xelaju-mc':'#2452c9',mixco:'#51a663',guastatoya:'#e9cf35','san-pedro':'#d72c39',suchitepequez:'#e5c728',marquense:'#e8c22a',aurora:'#2675d0',malacateco:'#d8323d','coban-imperial':'#2476c8'}[club?.id]||(side==='home'?'#36d69a':'#eee'));

  function loadState(){try{const histories=JSON.parse(localStorage.getItem('lhdf.histories')||'[]');const id=localStorage.getItem('lhdf.currentHistoryId');return{histories,history:histories.find(h=>h.id===id)||null};}catch{return{histories:[],history:null};}}
  function lineup(state){if(!state?.lineup)return null;const out={};for(const role of ROLES){out[role]=playerInfo(state.lineup[role]);if(!out[role])return null;}return out;}
  function player(side,role){return (side==='home'?homeLineup:awayLineup)?.[role]||null;}
  function addStat(id,key,n=1){if(!id)return;matchStats[id]=matchStats[id]||{};matchStats[id][key]=(matchStats[id][key]||0)+n;}

  function resetPieces(){pieces={home:{},away:{}};for(const side of ['home','away'])for(const role of ROLES)pieces[side][role]={...START[side][role],r:23};ball={x:480,y:270,vx:0,vy:0,r:11};lastTouch=null;}
  function prepare(){window.ensureLHDFClubBeginning?.();const{history}=loadState();const hs=history?.clubStates?.[history.selectedClub],as=history?.clubStates?.[history.rivalClub];if(!hs||!as)return false;homeClub=clubInfo(history.selectedClub);awayClub=clubInfo(history.rivalClub);homeLineup=lineup(hs);awayLineup=lineup(as);if(!homeClub||!awayClub||!homeLineup||!awayLineup)return false;resetPieces();running=false;paused=false;resolving=false;playerTurn=true;aiming=null;minute=0;homeScore=0;awayScore=0;halftime=false;goalLock=false;matchStats={};goalLog=[];$('matchHomeCode').textContent=code(homeClub);$('matchAwayCode').textContent=code(awayClub);$('matchHomeScore').textContent='0';$('matchAwayScore').textContent='0';$('matchClock').textContent="00'";pauseButton.disabled=true;startButton.hidden=false;startButton.textContent='Comenzar partido';turnTitle.textContent='Apunta la ficha';turnDescription.textContent='Mantén clic, arrastra la flecha y suelta.';turnFooter.textContent='Tu turno';eventEl.textContent=`${homeClub.name} vs ${awayClub.name}.`;movementFill.style.width='0%';selectedPieceLabel.textContent='Selecciona una ficha';draw();return true;}
  function transition(target){if(typeof fade!=='undefined')fade.classList.add('is-visible');setTimeout(()=>{document.querySelectorAll('.screen.active').forEach(s=>s.classList.remove('active'));target.classList.add('active');if(typeof fade!=='undefined')requestAnimationFrame(()=>fade.classList.remove('is-visible'));},typeof TRANSITION_TIME==='number'?TRANSITION_TIME:480);}

  function drawField(){ctx.clearRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#07140e';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#136d43';ctx.fillRect(FIELD.x,FIELD.y,FIELD.w,FIELD.h);for(let i=0;i<10;i++){ctx.fillStyle=i%2?'rgba(255,255,255,.025)':'rgba(0,0,0,.03)';ctx.fillRect(FIELD.x+i*FIELD.w/10,FIELD.y,FIELD.w/10,FIELD.h);}ctx.strokeStyle='rgba(255,255,255,.78)';ctx.lineWidth=3;ctx.strokeRect(FIELD.x,FIELD.y,FIELD.w,FIELD.h);ctx.beginPath();ctx.moveTo(FIELD.x+FIELD.w/2,FIELD.y);ctx.lineTo(FIELD.x+FIELD.w/2,FIELD.y+FIELD.h);ctx.stroke();ctx.beginPath();ctx.arc(FIELD.x+FIELD.w/2,FIELD.y+FIELD.h/2,64,0,Math.PI*2);ctx.stroke();ctx.strokeRect(FIELD.x,FIELD.y+FIELD.h/2-115,145,230);ctx.strokeRect(FIELD.x+FIELD.w-145,FIELD.y+FIELD.h/2-115,145,230);const gt=FIELD.y+FIELD.h/2-FIELD.goalH/2;ctx.strokeRect(FIELD.x-24,gt,24,FIELD.goalH);ctx.strokeRect(FIELD.x+FIELD.w,gt,24,FIELD.goalH);}
  function drawPiece(side,role){const p=pieces[side][role],pl=player(side,role),selected=aiming?.side===side&&aiming?.role===role;if(selected){ctx.beginPath();ctx.arc(p.x,p.y,p.r+8,0,Math.PI*2);ctx.strokeStyle='#82ffca';ctx.lineWidth=3;ctx.stroke();}ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle=clubColor(side==='home'?homeClub:awayClub,side);ctx.fill();ctx.strokeStyle='rgba(0,0,0,.55)';ctx.lineWidth=3;ctx.stroke();ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='900 11px system-ui';ctx.fillText(ROLE_LABEL[role],p.x,p.y+4);ctx.font='700 11px system-ui';ctx.fillText((pl?.name||'Jugador').split(' ')[0],p.x,p.y-33);}
  function drawBall(){ctx.beginPath();ctx.arc(ball.x,ball.y,ball.r,0,Math.PI*2);ctx.fillStyle='#fff';ctx.fill();ctx.strokeStyle='#111';ctx.lineWidth=2;ctx.stroke();ctx.beginPath();ctx.arc(ball.x-3,ball.y-3,3,0,Math.PI*2);ctx.fillStyle='#111';ctx.fill();}
  function drawArrow(){if(!aiming)return;const p=pieces.home[aiming.role],dx=aiming.current.x-p.x,dy=aiming.current.y-p.y,d=Math.hypot(dx,dy)||1,max=MAX_AIM[aiming.role],len=Math.min(d,max),nx=dx/d,ny=dy/d,end={x:p.x+nx*len,y:p.y+ny*len};ctx.save();ctx.strokeStyle='#9affcf';ctx.fillStyle='#9affcf';ctx.lineWidth=4;ctx.setLineDash([10,7]);ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(end.x,end.y);ctx.stroke();ctx.setLineDash([]);const a=Math.atan2(end.y-p.y,end.x-p.x);ctx.beginPath();ctx.moveTo(end.x,end.y);ctx.lineTo(end.x-Math.cos(a-.55)*15,end.y-Math.sin(a-.55)*15);ctx.lineTo(end.x-Math.cos(a+.55)*15,end.y-Math.sin(a+.55)*15);ctx.closePath();ctx.fill();ctx.restore();}
  function draw(){drawField();for(const role of ROLES)drawPiece('home',role);for(const role of ROLES)drawPiece('away',role);drawBall();drawArrow();}

  function clampPiece(side,role,p){const z=ZONES[side][role];p.x=clamp(p.x,z.minX,z.maxX);p.y=clamp(p.y,z.minY,z.maxY);}
  function resolvePieceCollisions(side,role,vx,vy){const a=pieces[side][role];for(const s of ['home','away'])for(const r of ROLES){if(s===side&&r===role)continue;const b=pieces[s][r],dx=a.x-b.x,dy=a.y-b.y,d=Math.hypot(dx,dy)||1,min=a.r+b.r;if(d<min){const nx=dx/d,ny=dy/d;a.x+=nx*(min-d);a.y+=ny*(min-d);clampPiece(side,role,a);}}
    const dx=ball.x-a.x,dy=ball.y-a.y,d=Math.hypot(dx,dy)||1,min=a.r+ball.r;if(d<min){const nx=dx/d,ny=dy/d;ball.x+=nx*(min-d);ball.y+=ny*(min-d);const speed=Math.hypot(vx,vy);const impulse=clamp(90+speed*.78,120,500);ball.vx=nx*impulse+vx*.34;ball.vy=ny*impulse+vy*.34;lastTouch={side,role,playerId:player(side,role)?.id};if(role==='forward')addStat(lastTouch.playerId,'shots');}}

  function updateBall(dt){ball.x+=ball.vx*dt;ball.y+=ball.vy*dt;const friction=Math.pow(.982,dt*60);ball.vx*=friction;ball.vy*=friction;if(Math.hypot(ball.vx,ball.vy)<4){ball.vx=0;ball.vy=0;}const gt=FIELD.y+FIELD.h/2-FIELD.goalH/2,gb=gt+FIELD.goalH,inGoalY=ball.y>gt&&ball.y<gb;if(ball.x-ball.r<=FIELD.x){if(inGoalY){if(lastTouch?.side==='away'&&lastTouch?.role==='forward')handleGoal('away');else{ball.x=FIELD.x+ball.r;ball.vx=Math.abs(ball.vx)*.65;eventEl.textContent='Solo un delantero puede convertir el gol.';}return;}ball.x=FIELD.x+ball.r;ball.vx=Math.abs(ball.vx)*.72;}if(ball.x+ball.r>=FIELD.x+FIELD.w){if(inGoalY){if(lastTouch?.side==='home'&&lastTouch?.role==='forward')handleGoal('home');else{ball.x=FIELD.x+FIELD.w-ball.r;ball.vx=-Math.abs(ball.vx)*.65;eventEl.textContent='Solo un delantero puede convertir el gol.';}return;}ball.x=FIELD.x+FIELD.w-ball.r;ball.vx=-Math.abs(ball.vx)*.72;}if(ball.y-ball.r<=FIELD.y){ball.y=FIELD.y+ball.r;ball.vy=Math.abs(ball.vy)*.72;}if(ball.y+ball.r>=FIELD.y+FIELD.h){ball.y=FIELD.y+FIELD.h-ball.r;ball.vy=-Math.abs(ball.vy)*.72;}}

  function handleGoal(side){if(goalLock)return;goalLock=true;ball.vx=ball.vy=0;if(side==='home')homeScore++;else awayScore++;const scorer=player(side,'forward'),club=side==='home'?homeClub:awayClub;addStat(scorer?.id,'goals');goalLog.push({side,scorerId:scorer?.id,minute});$('matchHomeScore').textContent=String(homeScore);$('matchAwayScore').textContent=String(awayScore);$('goalClubLogo').src=logoPath(club.logo);$('goalPlayerName').textContent=scorer?.name||'Delantero';$('goalClubName').textContent=club.name;$('goalScoreText').textContent=`${homeScore} - ${awayScore}`;goalCelebration.hidden=false;setTimeout(()=>{goalCelebration.hidden=true;resetPieces();goalLock=false;resolving=false;if(minute>=MATCH_END){finishMatch();return;}if(side==='home'){turnFooter.textContent='Turno rival';scheduleAI(550);}else beginPlayerTurn();},1800);}

  function advanceClock(){minute=Math.min(MATCH_END,minute+3);if(!halftime&&minute>=45){halftime=true;minute=45;eventEl.textContent='45’ · Descanso.';resetPieces();}$('matchClock').textContent=`${String(minute).padStart(2,'0')}'`;if(minute>=MATCH_END)finishMatch();}
  function beginPlayerTurn(){if(!running||paused||minute>=MATCH_END)return;playerTurn=true;resolving=false;aiming=null;turnFooter.textContent='Tu turno';turnTitle.textContent='Apunta una ficha';turnDescription.textContent='Mantén clic, arrastra la flecha y suelta para ejecutar el movimiento.';movementFill.style.width='0%';selectedPieceLabel.textContent='Selecciona una ficha';draw();}
  function finishAction(side){if(!running||goalLock)return;advanceClock();if(!running||goalLock)return;if(side==='home'){playerTurn=false;resolving=true;turnFooter.textContent='Turno rival';turnTitle.textContent=`${awayClub.name} prepara su movimiento`;turnDescription.textContent='La IA responderá ahora.';scheduleAI(380);}else{resolving=false;beginPlayerTurn();}}

  function animatePiece(side,role,target,onDone){const p=pieces[side][role],start={x:p.x,y:p.y};const z=ZONES[side][role];target={x:clamp(target.x,z.minX,z.maxX),y:clamp(target.y,z.minY,z.maxY)};const dx=target.x-start.x,dy=target.y-start.y,d=Math.hypot(dx,dy)||1,max=MAX_AIM[role],q=Math.min(1,max/d),end={x:start.x+dx*q,y:start.y+dy*q};clampPiece(side,role,end);const duration=430,t0=performance.now(),prev={...start};function step(now){if(!running)return;if(paused){requestAnimationFrame(step);return;}const t=Math.min(1,(now-t0)/duration),ease=1-Math.pow(1-t,2.4);p.x=start.x+(end.x-start.x)*ease;p.y=start.y+(end.y-start.y)*ease;const vx=(p.x-prev.x)/.016,vy=(p.y-prev.y)/.016;prev.x=p.x;prev.y=p.y;resolvePieceCollisions(side,role,vx,vy);draw();if(t<1&&!goalLock){requestAnimationFrame(step);return;}if(!goalLock)onDone?.();}requestAnimationFrame(step);}

  function canvasPoint(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*canvas.width/r.width,y:(e.clientY-r.top)*canvas.height/r.height};}
  function findPiece(point,side='home'){let best=null;for(const role of ROLES){const p=pieces[side][role],d=dist(point,p);if(d<=p.r+9&&(!best||d<best.d))best={role,d};}return best;}
  function pointerDown(e){if(!running||paused||resolving||!playerTurn)return;const pt=canvasPoint(e),hit=findPiece(pt,'home');if(!hit)return;const p=pieces.home[hit.role];aiming={side:'home',role:hit.role,current:{x:p.x,y:p.y},pointerId:e.pointerId};selectedPieceLabel.textContent=`${player('home',hit.role).name} · ${ROLE_NAME[hit.role]}`;canvas.setPointerCapture?.(e.pointerId);draw();}
  function pointerMove(e){if(!aiming||e.pointerId!==aiming.pointerId||paused)return;aiming.current=canvasPoint(e);const p=pieces.home[aiming.role],power=Math.min(1,dist(p,aiming.current)/MAX_AIM[aiming.role]);movementFill.style.width=`${Math.round(power*100)}%`;draw();}
  function pointerUp(e){if(!aiming||e.pointerId!==aiming.pointerId||paused)return;const action=aiming,p=pieces.home[action.role],d=dist(p,action.current);aiming=null;movementFill.style.width='0%';if(d<12){selectedPieceLabel.textContent='Movimiento cancelado';draw();return;}playerTurn=false;resolving=true;selectedPieceLabel.textContent='Movimiento ejecutado';animatePiece('home',action.role,action.current,()=>finishAction('home'));}

  function chooseAI(){const options=ROLES.map(role=>({role,d:dist(pieces.away[role],ball)})).sort((a,b)=>a.d-b.d);if(ball.x<250&&dist(pieces.away.goalkeeper,ball)<150)return 'goalkeeper';return options.find(x=>x.role!=='goalkeeper')?.role||'midfielder';}
  function scheduleAI(delay=0){if(!running||paused||minute>=MATCH_END||goalLock)return;playerTurn=false;resolving=true;setTimeout(()=>{if(!running||paused||goalLock)return;const role=chooseAI(),p=pieces.away[role];let target;if(dist(p,ball)<210){const goal={x:FIELD.x-35,y:FIELD.y+FIELD.h/2};const dx=goal.x-ball.x,dy=goal.y-ball.y,len=Math.hypot(dx,dy)||1;target={x:ball.x-dx/len*(p.r+ball.r+4),y:ball.y-dy/len*(p.r+ball.r+4)};}else target={x:ball.x,y:ball.y};animatePiece('away',role,target,()=>finishAction('away'));},delay);}

  function saveResultOnce(){const{histories,history}=loadState();if(!history||history.inauguralMatchPlayed)return;const hs=history.clubStates?.[history.selectedClub],as=history.clubStates?.[history.rivalClub];if(!hs||!as)return;const apply=(state,gf,ga)=>{state.statistics=state.statistics||{};state.statistics.matches=(state.statistics.matches||0)+1;state.statistics.goalsFor=(state.statistics.goalsFor||0)+gf;state.statistics.goalsAgainst=(state.statistics.goalsAgainst||0)+ga;if(gf>ga)state.statistics.wins=(state.statistics.wins||0)+1;else if(gf<ga)state.statistics.losses=(state.statistics.losses||0)+1;else state.statistics.draws=(state.statistics.draws||0)+1;};apply(hs,homeScore,awayScore);apply(as,awayScore,homeScore);for(const side of ['home','away'])for(const role of ROLES){const pl=player(side,role),state=history.playerStates?.[pl?.id];if(!state)continue;state.stats=state.stats||{};state.stats.matches=(state.stats.matches||0)+1;const ms=matchStats[pl.id]||{};for(const[k,v]of Object.entries(ms))state.stats[k]=(state.stats[k]||0)+v;}history.inauguralMatchPlayed=true;history.matches=history.matches||[];history.matches.push({type:'inaugural',homeClub:history.selectedClub,awayClub:history.rivalClub,homeScore,awayScore,goals:goalLog,date:'Inicio de la historia'});history.updatedAt=new Date().toISOString();localStorage.setItem('lhdf.histories',JSON.stringify(histories));}
  function finishMatch(){if(!running)return;running=false;resolving=true;aiming=null;pauseButton.disabled=true;saveResultOnce();eventEl.textContent=`Final · ${homeClub.name} ${homeScore}-${awayScore} ${awayClub.name}`;turnFooter.textContent='Final';turnTitle.textContent='Partido terminado';turnDescription.textContent='Puedes repetir la prueba para seguir ajustando la física.';startButton.hidden=false;startButton.textContent='Repetir prueba';}

  function physicsLoop(now){const dt=Math.min(.033,Math.max(.001,(now-lastFrame)/1000||.016));lastFrame=now;if(running&&!paused){updateBall(dt);draw();}raf=requestAnimationFrame(physicsLoop);}
  function startMatch(){prepare();running=true;playerTurn=true;resolving=false;startButton.hidden=true;pauseButton.disabled=false;eventEl.textContent=`00’ · ${homeClub.name} inicia el partido.`;beginPlayerTurn();}

  canvas.addEventListener('pointerdown',pointerDown);canvas.addEventListener('pointermove',pointerMove);canvas.addEventListener('pointerup',pointerUp);canvas.addEventListener('pointercancel',()=>{aiming=null;movementFill.style.width='0%';draw();});
  startButton.addEventListener('click',startMatch);
  $('matchGameBack').addEventListener('click',()=>{if(running&&!confirm('¿Salir del partido actual?'))return;running=false;window.showOwnedClubMenu?.();});
  pauseButton.addEventListener('click',()=>{if(!running)return;paused=true;pauseOverlay.hidden=false;});
  $('resumeMatchButton').addEventListener('click',()=>{paused=false;pauseOverlay.hidden=true;});
  $('pauseRulesButton').addEventListener('click',()=>{const rules=$('pauseRules');rules.hidden=!rules.hidden;});
  $('abandonMatchButton').addEventListener('click',()=>{if(!confirm('¿Abandonar este partido?'))return;running=false;pauseOverlay.hidden=true;window.showOwnedClubMenu?.();});

  window.showInauguralMatch=function(){if(!prepare()){alert('Primero entra a tu club para preparar la plantilla.');return;}transition(stage);};
  function installLauncher(){const options=document.querySelector('.club-menu-options');if(!options)return;let b=$('clubPlayMatchButton');if(!b){b=document.createElement('button');b.id='clubPlayMatchButton';b.className='club-menu-option club-match-launch is-active';b.type='button';options.appendChild(b);b.addEventListener('click',e=>{e.stopPropagation();window.showInauguralMatch();});}b.innerHTML='<em>Jugable · prueba 5.1</em><strong>Partido inaugural</strong><span>Fichas apuntables, pelota física y turnos alternados.</span>';}

  installLauncher();setTimeout(installLauncher,900);lastFrame=performance.now();raf=requestAnimationFrame(physicsLoop);
})();