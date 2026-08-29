(() => {
  const shell = document.querySelector('.game-shell');
  if (!shell || document.getElementById('matchGameStage')) return;

  const LOGO_BASE = 'assets/clubs/guatemala/';
  const ROLES = ['goalkeeper','defender','midfielder','forward'];
  const ROLE_LABEL = { goalkeeper:'POR', defender:'DEF', midfielder:'MED', forward:'DEL' };
  const ROLE_NAME = { goalkeeper:'Portero', defender:'Defensa', midfielder:'Mediocampista', forward:'Delantero' };
  const FIELD = { x:55, y:42, w:850, h:456, goalH:138 };
  const MATCH_END = 90;
  const MOVE_BUDGET = { goalkeeper:105, defender:150, midfielder:165, forward:155 };
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
  style.href = 'css/match-game.css?v=3.1.4';
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
        <p class="eyebrow" id="turnEyebrow">PRUEBA 5</p>
        <h2 id="turnTitle">Fichas + pelota física</h2>
        <p id="turnDescription">En tu turno arrastra una ficha con el mouse. La ficha golpea físicamente la pelota.</p>
        <div class="physics-help">
          <div><b>🖱️ Arrastra una ficha</b><span>Solo puedes mover una por turno.</span></div>
          <div><b>⚽ Golpea la pelota</b><span>El choque transmite dirección y fuerza.</span></div>
          <div><b>📏 Distancia limitada</b><span>Cuando gastas el movimiento, termina el turno.</span></div>
        </div>
        <div class="movement-meter"><small>MOVIMIENTO DEL TURNO</small><div><span id="movementFill"></span></div><b id="selectedPieceLabel">Selecciona una ficha</b></div>
        <button id="matchStartButton" class="match-start" type="button">Comenzar partido</button>
      </aside>
    </main>
    <footer class="physics-footer"><span>El portero permanece en su área.</span><strong id="turnFooter">Tu turno</strong><span>Solo DEL puede marcar.</span></footer>
    <div id="goalCelebration" class="goal-celebration" hidden><div class="goal-celebration-card"><div class="goal-word">¡GOOOOOOL!</div><img id="goalClubLogo" alt="Escudo del club"><strong id="goalPlayerName">Jugador</strong><span id="goalClubName">Club</span><b id="goalScoreText">1 - 0</b></div></div>
    <div id="pauseOverlay" class="match-pause-overlay" hidden><div class="match-pause-card"><p class="eyebrow">PARTIDO EN PAUSA</p><h2>Partido detenido</h2><p>La física y el turno quedan congelados.</p><button id="resumeMatchButton" type="button">Continuar</button><button id="pauseRulesButton" type="button">Cómo jugar</button><button id="abandonMatchButton" class="is-danger" type="button">Abandonar partido</button><div id="pauseRules" class="pause-rules" hidden>Durante tu turno arrastra una ficha con el mouse. La ficha tiene una distancia máxima de movimiento. Si choca con la pelota, transmite fuerza según la velocidad y dirección del impacto. Al soltar o agotar el movimiento, juega el rival.</div></div></div>
  </div>`;
  shell.appendChild(stage);

  const $ = (id) => document.getElementById(id);
  const canvas = $('matchCanvas');
  const ctx = canvas.getContext('2d');
  const startButton = $('matchStartButton');
  const pauseButton = $('matchPauseButton');
  const pauseOverlay = $('pauseOverlay');
  const goalCelebration = $('goalCelebration');
  const eventEl = $('matchEvent');
  const turnTitle = $('turnTitle');
  const turnDescription = $('turnDescription');
  const turnFooter = $('turnFooter');
  const movementFill = $('movementFill');
  const selectedPieceLabel = $('selectedPieceLabel');

  let homeClub, awayClub, homeLineup, awayLineup;
  let pieces = { home:{}, away:{} };
  let ball = { x:480, y:270, vx:0, vy:0, r:11 };
  let running=false, paused=false, resolving=false, playerTurn=true, dragging=null;
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
  function addStat(id,key,n=1){matchStats[id]=matchStats[id]||{};matchStats[id][key]=(matchStats[id][key]||0)+n;}

  function resetPieces(){pieces={home:{},away:{}};for(const side of ['home','away'])for(const role of ROLES)pieces[side][role]={...START[side][role],r:23};ball={x:480,y:270,vx:0,vy:0,r:11};lastTouch=null;}
  function prepare(){window.ensureLHDFClubBeginning?.();const{history}=loadState();const hs=history?.clubStates?.[history.selectedClub],as=history?.clubStates?.[history.rivalClub];if(!hs||!as)return false;homeClub=clubInfo(history.selectedClub);awayClub=clubInfo(history.rivalClub);homeLineup=lineup(hs);awayLineup=lineup(as);if(!homeClub||!awayClub||!homeLineup||!awayLineup)return false;resetPieces();running=false;paused=false;resolving=false;playerTurn=true;dragging=null;minute=0;homeScore=0;awayScore=0;halftime=false;lastTouch=null;goalLock=false;matchStats={};goalLog=[];$('matchHomeCode').textContent=code(homeClub);$('matchAwayCode').textContent=code(awayClub);$('matchHomeScore').textContent='0';$('matchAwayScore').textContent='0';$('matchClock').textContent="00'";pauseButton.disabled=true;startButton.hidden=false;startButton.textContent='Comenzar partido';turnTitle.textContent='Fichas + pelota física';turnDescription.textContent='Arrastra una ficha durante tu turno y golpea la pelota físicamente.';turnFooter.textContent='Tu turno';eventEl.textContent=`${homeClub.name} vs ${awayClub.name}.`;movementFill.style.width='0%';selectedPieceLabel.textContent='Selecciona una ficha';draw();return true;}
  function transition(target){if(typeof fade!=='undefined')fade.classList.add('is-visible');setTimeout(()=>{document.querySelectorAll('.screen.active').forEach(s=>s.classList.remove('active'));target.classList.add('active');if(typeof fade!=='undefined')requestAnimationFrame(()=>fade.classList.remove('is-visible'));},typeof TRANSITION_TIME==='number'?TRANSITION_TIME:480);}

  function drawField(){ctx.clearRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#07140e';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#136d43';ctx.fillRect(FIELD.x,FIELD.y,FIELD.w,FIELD.h);for(let i=0;i<10;i++){ctx.fillStyle=i%2?'rgba(255,255,255,.025)':'rgba(0,0,0,.03)';ctx.fillRect(FIELD.x+i*FIELD.w/10,FIELD.y,FIELD.w/10,FIELD.h);}ctx.strokeStyle='rgba(255,255,255,.78)';ctx.lineWidth=3;ctx.strokeRect(FIELD.x,FIELD.y,FIELD.w,FIELD.h);ctx.beginPath();ctx.moveTo(FIELD.x+FIELD.w/2,FIELD.y);ctx.lineTo(FIELD.x+FIELD.w/2,FIELD.y+FIELD.h);ctx.stroke();ctx.beginPath();ctx.arc(FIELD.x+FIELD.w/2,FIELD.y+FIELD.h/2,64,0,Math.PI*2);ctx.stroke();ctx.strokeRect(FIELD.x,FIELD.y+FIELD.h/2-115,145,230);ctx.strokeRect(FIELD.x+FIELD.w-145,FIELD.y+FIELD.h/2-115,145,230);const gt=FIELD.y+FIELD.h/2-FIELD.goalH/2;ctx.strokeRect(FIELD.x-24,gt,24,FIELD.goalH);ctx.strokeRect(FIELD.x+FIELD.w,gt,24,FIELD.goalH);}
  function drawPiece(side,role){const p=pieces[side][role],pl=player(side,role);const selected=dragging?.side===side&&dragging?.role===role;if(selected){ctx.beginPath();ctx.arc(p.x,p.y,p.r+8,0,Math.PI*2);ctx.strokeStyle='#82ffca';ctx.lineWidth=3;ctx.stroke();}ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle=clubColor(side==='home'?homeClub:awayClub,side);ctx.fill();ctx.strokeStyle='rgba(0,0,0,.55)';ctx.lineWidth=3;ctx.stroke();ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='900 11px system-ui';ctx.fillText(ROLE_LABEL[role],p.x,p.y+4);ctx.font='700 11px system-ui';ctx.fillText((pl?.name||'Jugador').split(' ')[0],p.x,p.y-33);}
  function drawBall(){ctx.beginPath();ctx.arc(ball.x,ball.y,ball.r,0,Math.PI*2);ctx.fillStyle='#fff';ctx.fill();ctx.strokeStyle='#111';ctx.lineWidth=2;ctx.stroke();ctx.beginPath();ctx.arc(ball.x-3,ball.y-3,3,0,Math.PI*2);ctx.fillStyle='#111';ctx.fill();}
  function draw(){drawField();for(const role of ROLES)drawPiece('home',role);for(const role of ROLES)drawPiece('away',role);drawBall();}

  function clampPiece(side,role,p){const z=ZONES[side][role];p.x=clamp(p.x,z.minX,z.maxX);p.y=clamp(p.y,z.minY,z.maxY);}
  function resolvePieceCollisions(moverSide,moverRole,vx,vy){const a=pieces[moverSide][moverRole];for(const side of ['home','away'])for(const role of ROLES){if(side===moverSide&&role===moverRole)continue;const b=pieces[side][role],dx=a.x-b.x,dy=a.y-b.y,d=Math.hypot(dx,dy)||1,min=a.r+b.r;if(d<min){const nx=dx/d,ny=dy/d,over=min-d;a.x+=nx*over;a.y+=ny*over;clampPiece(moverSide,moverRole,a);}}
    const dx=ball.x-a.x,dy=ball.y-a.y,d=Math.hypot(dx,dy)||1,min=a.r+ball.r;if(d<min){const nx=dx/d,ny=dy/d,over=min-d;ball.x+=nx*over;ball.y+=ny*over;const speed=Math.hypot(vx,vy);const impulse=clamp(110+speed*1.85,120,620);ball.vx=nx*impulse+vx*.55;ball.vy=ny*impulse+vy*.55;lastTouch={side:moverSide,role:moverRole,playerId:player(moverSide,moverRole)?.id};if(moverRole==='forward')addStat(lastTouch.playerId,'shots');}}

  function updateBall(dt){ball.x+=ball.vx*dt;ball.y+=ball.vy*dt;const drag=Math.pow(.985,dt*60);ball.vx*=drag;ball.vy*=drag;if(Math.hypot(ball.vx,ball.vy)<5){ball.vx=0;ball.vy=0;}const gt=FIELD.y+FIELD.h/2-FIELD.goalH/2,gb=gt+FIELD.goalH,inGoalY=ball.y>gt&&ball.y<gb;if(ball.x-ball.r<=FIELD.x){if(inGoalY){handleGoal('away');return;}ball.x=FIELD.x+ball.r;ball.vx=Math.abs(ball.vx)*.72;}if(ball.x+ball.r>=FIELD.x+FIELD.w){if(inGoalY){handleGoal('home');return;}ball.x=FIELD.x+FIELD.w-ball.r;ball.vx=-Math.abs(ball.vx)*.72;}if(ball.y-ball.r<=FIELD.y){ball.y=FIELD.y+ball.r;ball.vy=Math.abs(ball.vy)*.72;}if(ball.y+ball.r>=FIELD.y+FIELD.h){ball.y=FIELD.y+FIELD.h-ball.r;ball.vy=-Math.abs(ball.vy)*.72;}}

  function handleGoal(scoringSide){if(goalLock)return;goalLock=true;const valid=lastTouch?.side===scoringSide&&lastTouch?.role==='forward';if(!valid){eventEl.textContent='Solo el delantero puede marcar. Saque de portería.';resetAfterPlay(scoringSide==='home'?'away':'home');setTimeout(()=>{goalLock=false;},500);return;}if(scoringSide==='home')homeScore++;else awayScore++;const scorer=player(scoringSide,'forward');addStat(scorer.id,'goals');goalLog.push({side:scoringSide,scorerId:scorer.id,minute});$('matchHomeScore').textContent=String(homeScore);$('matchAwayScore').textContent=String(awayScore);const club=scoringSide==='home'?homeClub:awayClub;$('goalClubLogo').src=logoPath(club.logo);$('goalPlayerName').textContent=scorer.name;$('goalClubName').textContent=club.name;$('goalScoreText').textContent=`${homeScore} - ${awayScore}`;goalCelebration.hidden=false;setTimeout(()=>{goalCelebration.hidden=true;resetAfterGoal(scoringSide==='home'?'away':'home');goalLock=false;},1800);}
  function resetAfterGoal(kickoffSide){resetPieces();lastTouch=null;eventEl.textContent=`${kickoffSide==='home'?homeClub.name:awayClub.name} reanuda desde el centro.`;playerTurn=kickoffSide==='home';resolving=false;if(playerTurn)beginPlayerTurn();else scheduleAI();}
  function resetAfterPlay(side){ball.x=side==='home'?145:815;ball.y=270;ball.vx=ball.vy=0;lastTouch=null;}

  function advanceClock(){minute=Math.min(MATCH_END,minute+3);if(!halftime&&minute>=45){halftime=true;minute=45;eventEl.textContent='45’ · Descanso.';resetPieces();} $('matchClock').textContent=`${String(minute).padStart(2,'0')}'`;if(minute>=MATCH_END)finishMatch();}
  function beginPlayerTurn(){if(!running||paused||minute>=90)return;playerTurn=true;resolving=false;turnFooter.textContent='Tu turno';turnTitle.textContent='Mueve una ficha';turnDescription.textContent='Mantén clic y arrástrala. El choque con la pelota es físico.';movementFill.style.width='0%';selectedPieceLabel.textContent='Selecciona una ficha';}
  function endPlayerTurn(){if(!running||resolving)return;dragging=null;movementFill.style.width='0%';selectedPieceLabel.textContent='Movimiento terminado';resolving=true;advanceClock();if(!running||goalLock)return;turnFooter.textContent='Turno rival';turnTitle.textContent=`${awayClub.name} mueve una ficha`;turnDescription.textContent='La IA juega con la misma pelota física.';setTimeout(scheduleAI,450);}

  function canvasPoint(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*canvas.width/r.width,y:(e.clientY-r.top)*canvas.height/r.height};}
  function findPiece(point,side='home'){let best=null;for(const role of ROLES){const p=pieces[side][role],d=dist(point,p);if(d<=p.r+8&&(!best||d<best.d))best={side,role,d};}return best;}
  function pointerDown(e){if(!running||paused||resolving||!playerTurn)return;const pt=canvasPoint(e),hit=findPiece(pt,'home');if(!hit)return;const p=pieces.home[hit.role];dragging={side:'home',role:hit.role,last:{x:p.x,y:p.y},budget:MOVE_BUDGET[hit.role],used:0,lastT:performance.now()};selectedPieceLabel.textContent=`${player('home',hit.role).name} · ${ROLE_NAME[hit.role]}`;canvas.setPointerCapture?.(e.pointerId);}
  function pointerMove(e){if(!dragging||paused||resolving)return;const now=performance.now(),pt=canvasPoint(e),p=pieces.home[dragging.role];const target={x:clamp(pt.x,FIELD.x+p.r,FIELD.x+FIELD.w-p.r),y:clamp(pt.y,FIELD.y+p.r,FIELD.y+FIELD.h-p.r)};const z=ZONES.home[dragging.role];target.x=clamp(target.x,z.minX,z.maxX);target.y=clamp(target.y,z.minY,z.maxY);let dx=target.x-p.x,dy=target.y-p.y,step=Math.hypot(dx,dy);const left=dragging.budget-dragging.used;if(step>left&&step>0){const q=left/step;dx*=q;dy*=q;step=left;}const dt=Math.max(.016,(now-dragging.lastT)/1000);const vx=dx/dt,vy=dy/dt;p.x+=dx;p.y+=dy;dragging.used+=step;dragging.lastT=now;resolvePieceCollisions('home',dragging.role,vx,vy);movementFill.style.width=`${Math.min(100,dragging.used/dragging.budget*100)}%`;draw();if(dragging.used>=dragging.budget-1)endPlayerTurn();}
  function pointerUp(){if(!dragging)return;endPlayerTurn();}

  function chooseAI(){const candidates=ROLES.map(role=>({role,d:dist(pieces.away[role],ball)})).sort((a,b)=>a.d-b.d);if(ball.x<430){const f=candidates.find(c=>c.role==='forward');if(f&&f.d<170)return f.role;}return candidates.find(c=>c.role!=='goalkeeper')?.role||'goalkeeper';}
  function scheduleAI(){if(!running||paused||minute>=90)return;playerTurn=false;resolving=true;const role=chooseAI(),p=pieces.away[role];let target;if(dist(p,ball)<190){const towardGoal={x:FIELD.x-60,y:FIELD.y+FIELD.h/2};const dx=towardGoal.x-ball.x,dy=towardGoal.y-ball.y,len=Math.hypot(dx,dy)||1;target={x:ball.x-dx/len*(p.r+ball.r+7),y:ball.y-dy/len*(p.r+ball.r+7)};}else target={x:ball.x,y:ball.y};const z=ZONES.away[role];target.x=clamp(target.x,z.minX,z.maxX);target.y=clamp(target.y,z.minY,z.maxY);animateAI(role,target);}
  function animateAI(role,target){const p=pieces.away[role],start={x:p.x,y:p.y},dx=target.x-start.x,dy=target.y-start.y,d=Math.hypot(dx,dy)||1,max=MOVE_BUDGET[role],q=Math.min(1,max/d),end={x:start.x+dx*q,y:start.y+dy*q},duration=520,t0=performance.now(),prev={...start};function step(now){if(!running||paused)return;const t=Math.min(1,(now-t0)/duration),ease=1-Math.pow(1-t,3);p.x=start.x+(end.x-start.x)*ease;p.y=start.y+(end.y-start.y)*ease;const dt=.016,vx=(p.x-prev.x)/dt,vy=(p.y-prev.y)/dt;prev={x:p.x,y:p.y};resolvePieceCollisions('away',role,vx,vy);draw();if(t<1){requestAnimationFrame(step);return;}advanceClock();if(!running||goalLock)return;resolving=false;beginPlayerTurn();}requestAnimationFrame(step);}

  function saveResultOnce(){const{histories,history}=loadState();if(!history||history.inauguralMatchPlayed)return;const hs=history.clubStates?.[history.selectedClub],as=history.clubStates?.[history.rivalClub];if(!hs||!as)return;function clubStats(state,gf,ga){state.statistics=state.statistics||{};state.statistics.matches=(state.statistics.matches||0)+1;state.statistics.goalsFor=(state.statistics.goalsFor||0)+gf;state.statistics.goalsAgainst=(state.statistics.goalsAgainst||0)+ga;if(gf>ga)state.statistics.wins=(state.statistics.wins||0)+1;else if(gf<ga)state.statistics.losses=(state.statistics.losses||0)+1;else state.statistics.draws=(state.statistics.draws||0)+1;}clubStats(hs,homeScore,awayScore);clubStats(as,awayScore,homeScore);for(const side of ['home','away'])for(const role of ROLES){const id=player(side,role).id,ps=history.playerStates?.[id];if(!ps)continue;ps.stats=ps.stats||{};ps.stats.matches=(ps.stats.matches||0)+1;for(const[k,v]of Object.entries(matchStats[id]||{}))ps.stats[k]=(ps.stats[k]||0)+v;}history.inauguralMatchPlayed=true;history.matches=history.matches||[];history.matches.push({type:'inaugural',homeClubId:history.selectedClub,awayClubId:history.rivalClub,homeScore,awayScore,goals:goalLog,playedAt:new Date().toISOString()});hs.history=hs.history||[];hs.history.push({type:'match-result',date:'Partido inaugural',title:`${homeClub.name} ${homeScore}-${awayScore} ${awayClub.name}`,description:'Primer partido completado con el sistema de fichas y pelota física.'});history.updatedAt=new Date().toISOString();localStorage.setItem('lhdf.histories',JSON.stringify(histories));}
  function finishMatch(){if(!running)return;running=false;resolving=true;dragging=null;pauseButton.disabled=true;saveResultOnce();eventEl.textContent=`Final · ${homeClub.name} ${homeScore}-${awayScore} ${awayClub.name}`;turnFooter.textContent='Final';turnTitle.textContent='Partido terminado';turnDescription.textContent='La prueba terminó. Puedes repetirla para seguir ajustando la física.';startButton.hidden=false;startButton.textContent='Repetir prueba';}

  function physicsLoop(now){const dt=Math.min(.033,Math.max(.001,(now-lastFrame)/1000||.016));lastFrame=now;if(running&&!paused){updateBall(dt);draw();}raf=requestAnimationFrame(physicsLoop);}
  function startMatch(){prepare();running=true;playerTurn=true;resolving=false;startButton.hidden=true;pauseButton.disabled=false;eventEl.textContent=`00’ · ${homeClub.name} inicia el partido.`;beginPlayerTurn();}

  canvas.addEventListener('pointerdown',pointerDown);canvas.addEventListener('pointermove',pointerMove);canvas.addEventListener('pointerup',pointerUp);canvas.addEventListener('pointercancel',pointerUp);
  startButton.addEventListener('click',startMatch);
  $('matchGameBack').addEventListener('click',()=>{if(running&&!confirm('¿Salir del partido actual?'))return;running=false;window.showOwnedClubMenu?.();});
  pauseButton.addEventListener('click',()=>{if(!running)return;paused=true;pauseOverlay.hidden=false;});
  $('resumeMatchButton').addEventListener('click',()=>{paused=false;pauseOverlay.hidden=true;});
  $('pauseRulesButton').addEventListener('click',()=>{const rules=$('pauseRules');rules.hidden=!rules.hidden;});
  $('abandonMatchButton').addEventListener('click',()=>{if(!confirm('¿Abandonar este partido?'))return;paused=false;running=false;pauseOverlay.hidden=true;window.showOwnedClubMenu?.();});

  window.showInauguralMatch=function(){if(!prepare()){alert('Primero entra a tu club para preparar la plantilla y alineación.');return;}transition(stage);};
  function installLauncher(){const options=document.querySelector('.club-menu-options');if(!options)return;let button=$('clubPlayMatchButton');if(!button){button=document.createElement('button');button.id='clubPlayMatchButton';button.className='club-menu-option club-match-launch is-active';button.type='button';options.appendChild(button);button.addEventListener('click',e=>{e.stopPropagation();window.showInauguralMatch();});}button.innerHTML='<em>Jugable · prueba 5</em><strong>Partido inaugural</strong><span>Mueve fichas con el mouse y golpea una pelota con física real.</span>';}
  installLauncher();setTimeout(installLauncher,900);prepare();raf=requestAnimationFrame(physicsLoop);
})();