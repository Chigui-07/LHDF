(() => {
  const shell = document.querySelector('.game-shell');
  if (!shell || document.getElementById('matchGameStage')) return;

  const LOGO_BASE = 'assets/clubs/guatemala/';
  const ROLES = ['goalkeeper','defender','midfielder','forward'];
  const ROLE_LABEL = { goalkeeper:'POR', defender:'DEF', midfielder:'MED', forward:'DEL' };
  const ROLE_NAME = { goalkeeper:'Portero', defender:'Defensa', midfielder:'Mediocampista', forward:'Delantero' };
  const FIELD = { x:55, y:42, w:850, h:456, goalH:138 };
  const MATCH_REAL_SECONDS = 180;
  const MATCH_GAME_SECONDS = 90 * 60;
  const GAME_TIME_SCALE = MATCH_GAME_SECONDS / MATCH_REAL_SECONDS;
  const MAX_AIM = { goalkeeper:100, defender:145, midfielder:155, forward:150 };
  const LAUNCH_SPEED = { goalkeeper:315, defender:390, midfielder:415, forward:405 };
  const ZONES = {
    home:{
      goalkeeper:{minX:70,maxX:215,minY:165,maxY:375},
      defender:{minX:90,maxX:690,minY:65,maxY:475},
      midfielder:{minX:145,maxX:830,minY:65,maxY:475},
      forward:{minX:245,maxX:885,minY:65,maxY:475}
    },
    away:{
      goalkeeper:{minX:745,maxX:890,minY:165,maxY:375},
      defender:{minX:270,maxX:870,minY:65,maxY:475},
      midfielder:{minX:130,maxX:815,minY:65,maxY:475},
      forward:{minX:75,maxX:715,minY:65,maxY:475}
    }
  };
  const START = {
    home:{ goalkeeper:{x:125,y:270}, defender:{x:285,y:320}, midfielder:{x:425,y:210}, forward:{x:610,y:290} },
    away:{ goalkeeper:{x:835,y:270}, defender:{x:675,y:220}, midfielder:{x:535,y:330}, forward:{x:350,y:250} }
  };

  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = 'css/match-game.css?v=3.1.6';
  document.head.appendChild(style);

  const extraStyle = document.createElement('style');
  extraStyle.textContent = `
    .halftime-overlay{position:fixed;inset:0;z-index:65;display:grid;place-items:center;background:rgba(0,8,5,.82);backdrop-filter:blur(7px);opacity:0;pointer-events:none;transition:.3s ease}
    .halftime-overlay.is-visible{opacity:1}.halftime-card{width:min(560px,88vw);padding:34px;border:1px solid rgba(255,255,255,.14);border-radius:26px;background:radial-gradient(circle at 50% 0,rgba(88,235,181,.18),transparent 42%),#06150f;text-align:center;box-shadow:0 24px 80px rgba(0,0,0,.55);transform:scale(.9);transition:.35s ease}
    .halftime-overlay.is-visible .halftime-card{transform:scale(1)}.halftime-card small{color:#82ffca;font-weight:900;letter-spacing:.15em}.halftime-card h2{margin:7px 0;font-size:clamp(2.5rem,7vw,5rem)}.halftime-card p{margin:0;color:rgba(255,255,255,.58)}
  `;
  document.head.appendChild(extraStyle);

  const stage = document.createElement('section');
  stage.id = 'matchGameStage';
  stage.className = 'screen secondary-screen match-game-scene';
  stage.innerHTML = `<div class="match-game-shell">
    <header class="match-game-header">
      <button id="matchGameBack" class="match-game-back" type="button">← Volver al club</button>
      <div class="match-scoreboard"><div><strong id="matchHomeCode">LOC</strong><span id="matchHomeScore">0</span></div><b id="matchClock">00:00</b><div><span id="matchAwayScore">0</span><strong id="matchAwayCode">VIS</strong></div></div>
      <button id="matchPauseButton" class="match-pause" type="button">⏸ Pausa</button>
    </header>
    <main class="physics-match-main">
      <section class="physics-field-wrap"><canvas id="matchCanvas" width="960" height="540"></canvas><div id="matchEvent" class="match-event">El partido está listo.</div></section>
      <aside class="physics-panel">
        <p class="eyebrow">PRUEBA 5.3</p>
        <h2 id="turnTitle">Apunta la ficha</h2>
        <p id="turnDescription">Mantén clic, arrastra la flecha y suelta. El cronómetro avanza mientras juegan.</p>
        <div class="physics-help">
          <div><b>🎯 Apunta</b><span>La flecha marca dirección y potencia.</span></div>
          <div><b>💥 Choques</b><span>Pelota y fichas reaccionan físicamente.</span></div>
          <div><b>⏱️ Cronómetro</b><span>3 minutos reales representan los 90 del partido.</span></div>
        </div>
        <div class="movement-meter"><small>POTENCIA</small><div><span id="movementFill"></span></div><b id="selectedPieceLabel">Selecciona una ficha</b></div>
        <button id="matchStartButton" class="match-start" type="button">Comenzar partido</button>
      </aside>
    </main>
    <footer class="physics-footer"><span>El portero permanece en su zona.</span><strong id="turnFooter">Tu turno</strong><span>Solo DEL puede marcar.</span></footer>
    <div id="goalCelebration" class="goal-celebration" hidden><div class="goal-celebration-card"><div class="goal-word">¡GOOOOOOL!</div><img id="goalClubLogo" alt="Escudo del club"><strong id="goalPlayerName">Jugador</strong><span id="goalClubName">Club</span><b id="goalScoreText">1 - 0</b></div></div>
    <div id="pauseOverlay" class="match-pause-overlay" hidden><div class="match-pause-card"><p class="eyebrow">PARTIDO EN PAUSA</p><h2>Partido detenido</h2><p>El cronómetro, la física y el turno quedan congelados.</p><button id="resumeMatchButton" type="button">Continuar</button><button id="pauseRulesButton" type="button">Cómo jugar</button><button id="abandonMatchButton" class="is-danger" type="button">Abandonar partido</button><div id="pauseRules" class="pause-rules" hidden>Apunta una ficha con la flecha y suelta. Cuando la jugada física se detiene, responde el rival. El cronómetro corre continuamente y solo se detiene en pausa, descanso y celebraciones.</div></div></div>
    <div id="halftimeOverlay" class="halftime-overlay"><div class="halftime-card"><small>45:00 · DESCANSO</small><h2>MEDIO TIEMPO</h2><p id="halftimeScore">0 - 0</p></div></div>
  </div>`;
  shell.appendChild(stage);

  const $ = (id) => document.getElementById(id);
  const canvas = $('matchCanvas'), ctx = canvas.getContext('2d');
  const startButton=$('matchStartButton'), pauseButton=$('matchPauseButton'), pauseOverlay=$('pauseOverlay'), goalCelebration=$('goalCelebration'), halftimeOverlay=$('halftimeOverlay');
  const eventEl=$('matchEvent'), turnTitle=$('turnTitle'), turnDescription=$('turnDescription'), turnFooter=$('turnFooter'), movementFill=$('movementFill'), selectedPieceLabel=$('selectedPieceLabel');

  let homeClub, awayClub, homeLineup, awayLineup;
  let pieces={home:{},away:{}}, ball={x:480,y:270,vx:0,vy:0,r:11};
  let running=false, paused=false, resolving=false, playerTurn=true, aiming=null;
  let gameSeconds=0, homeScore=0, awayScore=0, halftime=false, halftimeBreak=false, lastFrame=0, raf=0;
  let lastTouch=null, goalLock=false, matchStats={}, goalLog=[];
  let settleTimer=0, phaseToken=0, actionSide=null, aiDelay=-1;

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
  function eachPiece(fn){for(const side of ['home','away'])for(const role of ROLES)fn(pieces[side][role],side,role);}
  function minuteNow(){return Math.min(90,Math.floor(gameSeconds/60));}
  function formatClock(){const total=Math.min(MATCH_GAME_SECONDS,Math.floor(gameSeconds));const m=Math.floor(total/60),s=total%60;return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;}

  function resetPieces(){pieces={home:{},away:{}};for(const side of ['home','away'])for(const role of ROLES)pieces[side][role]={...START[side][role],r:23,vx:0,vy:0};ball={x:480,y:270,vx:0,vy:0,r:11};lastTouch=null;}
  function prepare(){window.ensureLHDFClubBeginning?.();const{history}=loadState();const hs=history?.clubStates?.[history.selectedClub],as=history?.clubStates?.[history.rivalClub];if(!hs||!as)return false;homeClub=clubInfo(history.selectedClub);awayClub=clubInfo(history.rivalClub);homeLineup=lineup(hs);awayLineup=lineup(as);if(!homeClub||!awayClub||!homeLineup||!awayLineup)return false;resetPieces();running=false;paused=false;resolving=false;playerTurn=true;aiming=null;gameSeconds=0;homeScore=0;awayScore=0;halftime=false;halftimeBreak=false;goalLock=false;matchStats={};goalLog=[];settleTimer=0;actionSide=null;aiDelay=-1;phaseToken++;$('matchHomeCode').textContent=code(homeClub);$('matchAwayCode').textContent=code(awayClub);$('matchHomeScore').textContent='0';$('matchAwayScore').textContent='0';$('matchClock').textContent='00:00';pauseButton.disabled=true;startButton.hidden=false;startButton.textContent='Comenzar partido';turnTitle.textContent='Apunta la ficha';turnDescription.textContent='Mantén clic, arrastra la flecha y suelta.';turnFooter.textContent='Tu turno';eventEl.textContent=`${homeClub.name} vs ${awayClub.name}.`;movementFill.style.width='0%';selectedPieceLabel.textContent='Selecciona una ficha';draw();return true;}
  function transition(target){if(typeof fade!=='undefined')fade.classList.add('is-visible');setTimeout(()=>{document.querySelectorAll('.screen.active').forEach(s=>s.classList.remove('active'));target.classList.add('active');if(typeof fade!=='undefined')requestAnimationFrame(()=>fade.classList.remove('is-visible'));},typeof TRANSITION_TIME==='number'?TRANSITION_TIME:480);}

  function drawField(){ctx.clearRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#07140e';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#136d43';ctx.fillRect(FIELD.x,FIELD.y,FIELD.w,FIELD.h);for(let i=0;i<10;i++){ctx.fillStyle=i%2?'rgba(255,255,255,.025)':'rgba(0,0,0,.03)';ctx.fillRect(FIELD.x+i*FIELD.w/10,FIELD.y,FIELD.w/10,FIELD.h);}ctx.strokeStyle='rgba(255,255,255,.78)';ctx.lineWidth=3;ctx.strokeRect(FIELD.x,FIELD.y,FIELD.w,FIELD.h);ctx.beginPath();ctx.moveTo(FIELD.x+FIELD.w/2,FIELD.y);ctx.lineTo(FIELD.x+FIELD.w/2,FIELD.y+FIELD.h);ctx.stroke();ctx.beginPath();ctx.arc(FIELD.x+FIELD.w/2,FIELD.y+FIELD.h/2,64,0,Math.PI*2);ctx.stroke();ctx.strokeRect(FIELD.x,FIELD.y+FIELD.h/2-115,145,230);ctx.strokeRect(FIELD.x+FIELD.w-145,FIELD.y+FIELD.h/2-115,145,230);const gt=FIELD.y+FIELD.h/2-FIELD.goalH/2;ctx.strokeRect(FIELD.x-24,gt,24,FIELD.goalH);ctx.strokeRect(FIELD.x+FIELD.w,gt,24,FIELD.goalH);}
  function drawPiece(side,role){const p=pieces[side][role],pl=player(side,role),selected=aiming?.side===side&&aiming?.role===role;if(selected){ctx.beginPath();ctx.arc(p.x,p.y,p.r+8,0,Math.PI*2);ctx.strokeStyle='#82ffca';ctx.lineWidth=3;ctx.stroke();}ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle=clubColor(side==='home'?homeClub:awayClub,side);ctx.fill();ctx.strokeStyle='rgba(0,0,0,.55)';ctx.lineWidth=3;ctx.stroke();ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='900 11px system-ui';ctx.fillText(ROLE_LABEL[role],p.x,p.y+4);ctx.font='700 11px system-ui';ctx.fillText((pl?.name||'Jugador').split(' ')[0],p.x,p.y-33);}
  function drawBall(){ctx.beginPath();ctx.arc(ball.x,ball.y,ball.r,0,Math.PI*2);ctx.fillStyle='#fff';ctx.fill();ctx.strokeStyle='#111';ctx.lineWidth=2;ctx.stroke();ctx.beginPath();ctx.arc(ball.x-3,ball.y-3,3,0,Math.PI*2);ctx.fillStyle='#111';ctx.fill();}
  function drawArrow(){if(!aiming)return;const p=pieces.home[aiming.role],dx=aiming.current.x-p.x,dy=aiming.current.y-p.y,d=Math.hypot(dx,dy)||1,max=MAX_AIM[aiming.role],len=Math.min(d,max),nx=dx/d,ny=dy/d,end={x:p.x+nx*len,y:p.y+ny*len};ctx.save();ctx.strokeStyle='#9affcf';ctx.fillStyle='#9affcf';ctx.lineWidth=4;ctx.setLineDash([10,7]);ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(end.x,end.y);ctx.stroke();ctx.setLineDash([]);const a=Math.atan2(end.y-p.y,end.x-p.x);ctx.beginPath();ctx.moveTo(end.x,end.y);ctx.lineTo(end.x-Math.cos(a-.55)*15,end.y-Math.sin(a-.55)*15);ctx.lineTo(end.x-Math.cos(a+.55)*15,end.y-Math.sin(a+.55)*15);ctx.closePath();ctx.fill();ctx.restore();}
  function draw(){drawField();for(const role of ROLES)drawPiece('home',role);for(const role of ROLES)drawPiece('away',role);drawBall();drawArrow();}

  function clampPiece(side,role,p){const z=ZONES[side][role];if(p.x<z.minX){p.x=z.minX;p.vx=Math.abs(p.vx)*.22;}if(p.x>z.maxX){p.x=z.maxX;p.vx=-Math.abs(p.vx)*.22;}if(p.y<z.minY){p.y=z.minY;p.vy=Math.abs(p.vy)*.22;}if(p.y>z.maxY){p.y=z.maxY;p.vy=-Math.abs(p.vy)*.22;}}
  function resolvePiecePair(a,b,sideA,roleA,sideB,roleB){const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1,min=a.r+b.r;if(d>=min)return;const nx=dx/d,ny=dy/d,over=min-d;a.x-=nx*over*.5;a.y-=ny*over*.5;b.x+=nx*over*.5;b.y+=ny*over*.5;const rvx=b.vx-a.vx,rvy=b.vy-a.vy,along=rvx*nx+rvy*ny;if(along<0){const restitution=.34,impulse=-(1+restitution)*along/2;a.vx-=impulse*nx*.72;a.vy-=impulse*ny*.72;b.vx+=impulse*nx*.72;b.vy+=impulse*ny*.72;}clampPiece(sideA,roleA,a);clampPiece(sideB,roleB,b);}
  function resolveBallPiece(p,side,role){const dx=ball.x-p.x,dy=ball.y-p.y,d=Math.hypot(dx,dy)||1,min=p.r+ball.r;if(d>=min)return;const nx=dx/d,ny=dy/d,over=min-d;ball.x+=nx*over;ball.y+=ny*over;const rel=(p.vx-ball.vx)*nx+(p.vy-ball.vy)*ny;if(rel>0){const impulse=Math.max(85,rel*1.38);ball.vx+=nx*impulse;ball.vy+=ny*impulse;p.vx-=nx*impulse*.09;p.vy-=ny*impulse*.09;lastTouch={side,role,playerId:player(side,role)?.id};if(role==='forward')addStat(lastTouch.playerId,'shots');if(role==='goalkeeper'&&Math.abs(ball.vx)>130)addStat(lastTouch.playerId,'saves');}}
  function resolveAllCollisions(){const list=[];eachPiece((p,s,r)=>list.push({p,s,r}));for(let i=0;i<list.length;i++){for(let j=i+1;j<list.length;j++)resolvePiecePair(list[i].p,list[j].p,list[i].s,list[i].r,list[j].s,list[j].r);resolveBallPiece(list[i].p,list[i].s,list[i].r);}}
  function updatePieces(dt){eachPiece((p,side,role)=>{p.x+=p.vx*dt;p.y+=p.vy*dt;const friction=Math.pow(.89,dt*60);p.vx*=friction;p.vy*=friction;if(Math.hypot(p.vx,p.vy)<5){p.vx=0;p.vy=0;}clampPiece(side,role,p);});resolveAllCollisions();}
  function updateBall(dt){ball.x+=ball.vx*dt;ball.y+=ball.vy*dt;const friction=Math.pow(.982,dt*60);ball.vx*=friction;ball.vy*=friction;if(Math.hypot(ball.vx,ball.vy)<4){ball.vx=0;ball.vy=0;}const gt=FIELD.y+FIELD.h/2-FIELD.goalH/2,gb=gt+FIELD.goalH,inGoalY=ball.y>gt&&ball.y<gb;if(ball.x-ball.r<=FIELD.x){if(inGoalY){if(lastTouch?.side==='away'&&lastTouch?.role==='forward')handleGoal('away');else{ball.x=FIELD.x+ball.r;ball.vx=Math.abs(ball.vx)*.65;eventEl.textContent='Solo un delantero puede convertir el gol.';}return;}ball.x=FIELD.x+ball.r;ball.vx=Math.abs(ball.vx)*.72;}if(ball.x+ball.r>=FIELD.x+FIELD.w){if(inGoalY){if(lastTouch?.side==='home'&&lastTouch?.role==='forward')handleGoal('home');else{ball.x=FIELD.x+FIELD.w-ball.r;ball.vx=-Math.abs(ball.vx)*.65;eventEl.textContent='Solo un delantero puede convertir el gol.';}return;}ball.x=FIELD.x+FIELD.w-ball.r;ball.vx=-Math.abs(ball.vx)*.72;}if(ball.y-ball.r<=FIELD.y){ball.y=FIELD.y+ball.r;ball.vy=Math.abs(ball.vy)*.72;}if(ball.y+ball.r>=FIELD.y+FIELD.h){ball.y=FIELD.y+FIELD.h-ball.r;ball.vy=-Math.abs(ball.vy)*.72;}}
  function bodiesSettled(){let max=Math.hypot(ball.vx,ball.vy);eachPiece(p=>{max=Math.max(max,Math.hypot(p.vx,p.vy));});return max<18;}

  function handleGoal(side){if(goalLock||!running)return;goalLock=true;aiming=null;aiDelay=-1;ball.vx=ball.vy=0;eachPiece(p=>{p.vx=p.vy=0;});if(side==='home')homeScore++;else awayScore++;const scorer=player(side,'forward'),club=side==='home'?homeClub:awayClub;addStat(scorer?.id,'goals');goalLog.push({side,scorerId:scorer?.id,minute:minuteNow()});$('matchHomeScore').textContent=String(homeScore);$('matchAwayScore').textContent=String(awayScore);$('goalClubLogo').src=logoPath(club.logo);$('goalPlayerName').textContent=scorer?.name||'Delantero';$('goalClubName').textContent=club.name;$('goalScoreText').textContent=`${homeScore} - ${awayScore}`;goalCelebration.hidden=false;setTimeout(()=>{if(!running)return;goalCelebration.hidden=true;resetPieces();goalLock=false;resolving=false;actionSide=null;if(gameSeconds>=MATCH_GAME_SECONDS){finishMatch();return;}if(side==='home')queueAITurn(.45);else beginPlayerTurn();},1800);}

  function showHalftime(){if(halftime||!running)return;halftime=true;halftimeBreak=true;aiming=null;aiDelay=-1;resolving=false;actionSide=null;eachPiece(p=>{p.vx=p.vy=0;});ball.vx=ball.vy=0;gameSeconds=45*60;$('matchClock').textContent='45:00';$('halftimeScore').textContent=`${homeClub.name} ${homeScore} - ${awayScore} ${awayClub.name}`;eventEl.textContent='45:00 · Descanso.';halftimeOverlay.classList.add('is-visible');setTimeout(()=>{if(!running)return;halftimeOverlay.classList.remove('is-visible');setTimeout(()=>{if(!running)return;resetPieces();halftimeBreak=false;draw();beginPlayerTurn();},320);},1900);}
  function updateMatchClock(dt){if(!running||paused||halftimeBreak||goalLock)return;const previous=gameSeconds;gameSeconds=Math.min(MATCH_GAME_SECONDS,gameSeconds+dt*GAME_TIME_SCALE);$('matchClock').textContent=formatClock();if(!halftime&&previous<45*60&&gameSeconds>=45*60){showHalftime();return;}if(gameSeconds>=MATCH_GAME_SECONDS)finishMatch();}

  function beginPlayerTurn(){if(!running||paused||halftimeBreak||goalLock||gameSeconds>=MATCH_GAME_SECONDS)return;phaseToken++;playerTurn=true;resolving=false;actionSide=null;aiming=null;settleTimer=0;aiDelay=-1;turnFooter.textContent='Tu turno';turnTitle.textContent='Apunta una ficha';turnDescription.textContent='Mantén clic, arrastra la flecha y suelta para lanzar la ficha.';movementFill.style.width='0%';selectedPieceLabel.textContent='Selecciona una ficha';draw();}
  function queueAITurn(delay=.35){if(!running||paused||halftimeBreak||goalLock||gameSeconds>=MATCH_GAME_SECONDS)return;phaseToken++;playerTurn=false;resolving=false;actionSide=null;aiming=null;settleTimer=0;aiDelay=delay;turnFooter.textContent='Turno rival';turnTitle.textContent=`${awayClub.name} prepara su movimiento`;turnDescription.textContent='La IA responderá en cuanto prepare su golpe.';}
  function completeAction(side){resolving=false;actionSide=null;settleTimer=0;if(!running||paused||halftimeBreak||goalLock)return;if(side==='home')queueAITurn(.28);else beginPlayerTurn();}

  function launchPiece(side,role,dx,dy,power){const p=pieces[side][role],len=Math.hypot(dx,dy)||1,nx=dx/len,ny=dy/len,speed=LAUNCH_SPEED[role]*clamp(power,.18,1);p.vx=nx*speed;p.vy=ny*speed;resolving=true;playerTurn=false;actionSide=side;settleTimer=0;aiDelay=-1;}
  function canvasPoint(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*canvas.width/r.width,y:(e.clientY-r.top)*canvas.height/r.height};}
  function findPiece(point,side='home'){let best=null;for(const role of ROLES){const p=pieces[side][role],d=dist(point,p);if(d<=p.r+9&&(!best||d<best.d))best={role,d};}return best;}
  function pointerDown(e){if(!running||paused||halftimeBreak||goalLock||resolving||!playerTurn)return;const pt=canvasPoint(e),hit=findPiece(pt,'home');if(!hit)return;const p=pieces.home[hit.role];aiming={side:'home',role:hit.role,current:{x:p.x,y:p.y},pointerId:e.pointerId};selectedPieceLabel.textContent=`${player('home',hit.role).name} · ${ROLE_NAME[hit.role]}`;canvas.setPointerCapture?.(e.pointerId);draw();}
  function pointerMove(e){if(!aiming||e.pointerId!==aiming.pointerId||paused||halftimeBreak)return;aiming.current=canvasPoint(e);const p=pieces.home[aiming.role],power=Math.min(1,dist(p,aiming.current)/MAX_AIM[aiming.role]);movementFill.style.width=`${Math.round(power*100)}%`;draw();}
  function pointerUp(e){if(!aiming||e.pointerId!==aiming.pointerId||paused||halftimeBreak)return;const action=aiming,p=pieces.home[action.role],dx=action.current.x-p.x,dy=action.current.y-p.y,d=Math.hypot(dx,dy);aiming=null;movementFill.style.width='0%';try{canvas.releasePointerCapture?.(e.pointerId);}catch{}if(d<12){selectedPieceLabel.textContent='Movimiento cancelado';draw();return;}selectedPieceLabel.textContent='Ficha lanzada';turnFooter.textContent='Resolviendo jugada';launchPiece('home',action.role,dx,dy,Math.min(1,d/MAX_AIM[action.role]));}

  function chooseAI(){const options=ROLES.map(role=>({role,d:dist(pieces.away[role],ball)})).sort((a,b)=>a.d-b.d);if(ball.x>760&&dist(pieces.away.goalkeeper,ball)<155)return 'goalkeeper';const forward=options.find(x=>x.role==='forward');if(ball.x<625&&forward?.d<260)return 'forward';return options.find(x=>x.role!=='goalkeeper')?.role||'midfielder';}
  function aiVector(role){const p=pieces.away[role],toBall={x:ball.x-p.x,y:ball.y-p.y},d=Math.hypot(toBall.x,toBall.y)||1;if(d<=190){const goal={x:FIELD.x-40,y:FIELD.y+FIELD.h/2};const gx=goal.x-ball.x,gy=goal.y-ball.y,gl=Math.hypot(gx,gy)||1;const desired={x:ball.x-gx/gl*(p.r+ball.r+6),y:ball.y-gy/gl*(p.r+ball.r+6)};return{x:desired.x-p.x,y:desired.y-p.y,power:clamp(d/105,.62,1)};}return{x:toBall.x,y:toBall.y,power:.92};}
  function executeAITurn(){if(!running||paused||halftimeBreak||goalLock||gameSeconds>=MATCH_GAME_SECONDS)return;const role=chooseAI(),v=aiVector(role);turnFooter.textContent='Turno rival';turnTitle.textContent=`${awayClub.name} mueve a ${player('away',role).name}`;turnDescription.textContent='El rival busca atacar la pelota.';eventEl.textContent=`${formatClock()} · ${player('away',role).name} va hacia la pelota.`;launchPiece('away',role,v.x,v.y,v.power);}

  function saveResultOnce(){const{histories,history}=loadState();if(!history||history.inauguralMatchPlayed)return;const hs=history.clubStates?.[history.selectedClub],as=history.clubStates?.[history.rivalClub];if(!hs||!as)return;const apply=(state,gf,ga)=>{state.statistics=state.statistics||{};state.statistics.matches=(state.statistics.matches||0)+1;state.statistics.goalsFor=(state.statistics.goalsFor||0)+gf;state.statistics.goalsAgainst=(state.statistics.goalsAgainst||0)+ga;if(gf>ga)state.statistics.wins=(state.statistics.wins||0)+1;else if(gf<ga)state.statistics.losses=(state.statistics.losses||0)+1;else state.statistics.draws=(state.statistics.draws||0)+1;};apply(hs,homeScore,awayScore);apply(as,awayScore,homeScore);for(const side of ['home','away'])for(const role of ROLES){const pl=player(side,role),state=history.playerStates?.[pl?.id];if(!state)continue;state.stats=state.stats||{};state.stats.matches=(state.stats.matches||0)+1;const ms=matchStats[pl.id]||{};for(const[k,v]of Object.entries(ms))state.stats[k]=(state.stats[k]||0)+v;}history.inauguralMatchPlayed=true;history.matches=history.matches||[];history.matches.push({type:'inaugural',homeClub:history.selectedClub,awayClub:history.rivalClub,homeScore,awayScore,goals:goalLog,date:'Inicio de la historia'});history.updatedAt=new Date().toISOString();localStorage.setItem('lhdf.histories',JSON.stringify(histories));}
  function finishMatch(){if(!running)return;running=false;resolving=true;aiming=null;aiDelay=-1;actionSide=null;phaseToken++;gameSeconds=MATCH_GAME_SECONDS;$('matchClock').textContent='90:00';pauseButton.disabled=true;saveResultOnce();eventEl.textContent=`Final · ${homeClub.name} ${homeScore}-${awayScore} ${awayClub.name}`;turnFooter.textContent='Final';turnTitle.textContent='Partido terminado';turnDescription.textContent='El cronómetro llegó a 90:00.';startButton.hidden=false;startButton.textContent='Repetir prueba';}

  function physicsLoop(now){const dt=Math.min(.033,Math.max(.001,(now-lastFrame)/1000||.016));lastFrame=now;if(running&&!paused){updateMatchClock(dt);if(running&&!halftimeBreak&&!goalLock){updatePieces(dt);updateBall(dt);if(aiDelay>=0&&!resolving){aiDelay-=dt;if(aiDelay<=0){aiDelay=-1;executeAITurn();}}if(resolving&&actionSide){settleTimer+=dt;if((bodiesSettled()&&settleTimer>.18)||settleTimer>3.5){const completedSide=actionSide;completeAction(completedSide);}}}draw();}raf=requestAnimationFrame(physicsLoop);}
  function startMatch(){prepare();running=true;playerTurn=true;resolving=false;startButton.hidden=true;pauseButton.disabled=false;lastFrame=performance.now();eventEl.textContent='00:00 · Comienza el partido.';beginPlayerTurn();}

  canvas.addEventListener('pointerdown',pointerDown);canvas.addEventListener('pointermove',pointerMove);canvas.addEventListener('pointerup',pointerUp);canvas.addEventListener('pointercancel',(e)=>{aiming=null;movementFill.style.width='0%';try{canvas.releasePointerCapture?.(e.pointerId);}catch{}draw();});
  startButton.addEventListener('click',startMatch);
  $('matchGameBack').addEventListener('click',()=>{if(running&&!confirm('¿Salir del partido actual?'))return;running=false;phaseToken++;window.showOwnedClubMenu?.();});
  pauseButton.addEventListener('click',()=>{if(!running||halftimeBreak)return;paused=true;pauseOverlay.hidden=false;});
  $('resumeMatchButton').addEventListener('click',()=>{paused=false;pauseOverlay.hidden=true;lastFrame=performance.now();});
  $('pauseRulesButton').addEventListener('click',()=>{const rules=$('pauseRules');rules.hidden=!rules.hidden;});
  $('abandonMatchButton').addEventListener('click',()=>{if(!confirm('¿Abandonar este partido?'))return;running=false;phaseToken++;pauseOverlay.hidden=true;window.showOwnedClubMenu?.();});

  window.showInauguralMatch=function(){if(!prepare()){alert('Primero entra a tu club para preparar la plantilla.');return;}transition(stage);};
  function installLauncher(){const options=document.querySelector('.club-menu-options');if(!options)return;let b=$('clubPlayMatchButton');if(!b){b=document.createElement('button');b.id='clubPlayMatchButton';b.className='club-menu-option club-match-launch is-active';b.type='button';options.appendChild(b);b.addEventListener('click',e=>{e.stopPropagation();window.showInauguralMatch();});}b.innerHTML='<em>Jugable · prueba 5.3</em><strong>Partido inaugural</strong><span>Física por turnos con IA ofensiva y cronómetro continuo.</span>';}

  installLauncher();setTimeout(installLauncher,900);lastFrame=performance.now();raf=requestAnimationFrame(physicsLoop);
})();