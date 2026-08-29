(() => {
  const shell = document.querySelector('.game-shell');
  if (!shell || document.getElementById('matchGameStage')) return;

  const LOGO_BASE = 'assets/clubs/guatemala/';
  const ROLES = ['goalkeeper', 'defender', 'midfielder', 'forward'];
  const LABEL = { goalkeeper: 'POR', defender: 'DEF', midfielder: 'MED', forward: 'DEL' };
  const NAME = { goalkeeper: 'Portero', defender: 'Defensa', midfielder: 'Mediocampista', forward: 'Delantero' };
  const START = {
    home: { goalkeeper:{x:10,y:50}, defender:{x:29,y:58}, midfielder:{x:47,y:39}, forward:{x:67,y:54} },
    away: { goalkeeper:{x:90,y:50}, defender:{x:71,y:42}, midfielder:{x:53,y:61}, forward:{x:33,y:46} }
  };
  const ZONE = {
    home: {
      goalkeeper:{minX:4,maxX:19,minY:28,maxY:72}, defender:{minX:8,maxX:57,minY:10,maxY:90},
      midfielder:{minX:20,maxX:79,minY:8,maxY:92}, forward:{minX:40,maxX:94,minY:8,maxY:92}
    },
    away: {
      goalkeeper:{minX:81,maxX:96,minY:28,maxY:72}, defender:{minX:43,maxX:92,minY:10,maxY:90},
      midfielder:{minX:21,maxX:80,minY:8,maxY:92}, forward:{minX:6,maxX:60,minY:8,maxY:92}
    }
  };

  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = 'css/match-game.css?v=3.1.3';
  document.head.appendChild(style);

  const stage = document.createElement('section');
  stage.id = 'matchGameStage';
  stage.className = 'screen secondary-screen match-game-scene';
  stage.innerHTML = `
    <div class="match-game-shell">
      <header class="match-game-header">
        <button id="matchGameBack" class="match-game-back" type="button">← Volver al club</button>
        <div class="match-scoreboard"><div><strong id="matchHomeCode">LOC</strong><span id="matchHomeScore">0</span></div><b id="matchClock">00'</b><div><span id="matchAwayScore">0</span><strong id="matchAwayCode">VIS</strong></div></div>
        <button id="matchPauseButton" class="match-pause" type="button">⏸ Pausa</button>
      </header>
      <main class="board-match-main">
        <section class="board-wrap">
          <div id="turnField" class="board-field">
            <div class="board-half-line"></div><div class="board-center-circle"></div>
            <div class="board-box board-box-home"></div><div class="board-box board-box-away"></div>
            <div class="board-goal board-goal-home"></div><div class="board-goal board-goal-away"></div>
            <svg class="board-aim" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><defs><marker id="aimArrowHead" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0,0 L5,2.5 L0,5 Z"></path></marker></defs><line id="aimLine" x1="0" y1="0" x2="0" y2="0"></line></svg>
            <div id="homePieces" class="board-team"></div><div id="awayPieces" class="board-team"></div><div id="boardBall" class="board-ball">⚽</div>
          </div>
          <div id="matchEvent" class="match-event">El partido está listo.</div>
        </section>
        <aside class="board-panel">
          <p class="eyebrow" id="turnEyebrow">PARTIDO TÁCTICO</p><h2 id="turnTitle">Apunta y juega</h2>
          <p id="turnDescription">Arrastra una ficha para moverla, pasar o disparar. Cada acción consume tu turno.</p>
          <div class="board-help"><div><b>↗ Mover ficha</b><span>Suelta en una zona vacía.</span></div><div><b>⚽ Pase</b><span>Con balón, suelta sobre un compañero.</span></div><div><b>🥅 Tiro</b><span>Con el delantero, apunta dentro de la portería.</span></div></div>
          <div class="turn-rule"><strong>1 movimiento</strong><span>por turno</span></div>
          <button id="matchStartButton" class="match-start" type="button">Comenzar partido</button>
        </aside>
      </main>
      <footer class="board-footer"><span id="selectedLabel">Ficha: —</span><strong id="possessionLabel">Posesión: —</strong><span>POR · DEF · MED · DEL</span></footer>
      <div id="goalCelebration" class="goal-celebration" hidden><div class="goal-celebration-card"><div class="goal-word">¡GOOOOOOL!</div><img id="goalClubLogo" alt="Escudo del club"><strong id="goalPlayerName">Jugador</strong><span id="goalClubName">Club</span><b id="goalScoreText">1 - 0</b></div></div>
      <div id="pauseOverlay" class="match-pause-overlay" hidden><div class="match-pause-card"><p class="eyebrow">PARTIDO EN PAUSA</p><h2>La historia espera.</h2><p>El turno actual queda detenido.</p><button id="resumeMatchButton" type="button">Continuar</button><button id="pauseRulesButton" type="button">Cómo jugar</button><button id="abandonMatchButton" class="is-danger" type="button">Abandonar partido</button><div id="pauseRules" class="pause-rules" hidden>Mover una ficha, pasar o disparar consume el turno. Las posiciones tienen zonas amplias de movimiento. El portero permanece cerca de su arco y solo el delantero puede rematar.</div></div></div>
    </div>`;
  shell.appendChild(stage);

  const $ = (id) => document.getElementById(id);
  const field = $('turnField'), homeEl = $('homePieces'), awayEl = $('awayPieces'), ballEl = $('boardBall'), aim = $('aimLine');
  const homeScoreEl = $('matchHomeScore'), awayScoreEl = $('matchAwayScore'), homeCodeEl = $('matchHomeCode'), awayCodeEl = $('matchAwayCode'), clockEl = $('matchClock');
  const eventEl = $('matchEvent'), turnEyebrow = $('turnEyebrow'), turnTitle = $('turnTitle'), turnDescription = $('turnDescription'), selectedLabel = $('selectedLabel'), possessionLabel = $('possessionLabel');
  const startButton = $('matchStartButton'), pauseButton = $('matchPauseButton'), pauseOverlay = $('pauseOverlay'), goalCelebration = $('goalCelebration');

  let homeClub, awayClub, homeLineup, awayLineup;
  let pos = { home:{}, away:{} };
  let possession = { side:'home', role:'goalkeeper' };
  let selected = null, drag = null, minute = 0, homeScore = 0, awayScore = 0;
  let running = false, paused = false, resolving = false, halftime = false;
  let stats = {}, goalLog = [], pendingAssist = { home:null, away:null };

  const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
  const distance = (a,b) => Math.hypot(a.x-b.x,a.y-b.y);
  const chance = (p) => Math.random() < p;
  const pick = (a,b) => Math.floor(Math.random()*(b-a+1))+a;
  const playerInfo = (id) => window.LHDF_DATA?.players?.find(p=>p.id===id)||null;
  const clubInfo = (id) => window.LHDF_DATA?.clubs?.find(c=>c.id===id)||null;
  const logoPath = (file) => `${LOGO_BASE}${encodeURIComponent(file).replace(/%2F/g,'/')}`;
  const code = (club) => (club?.name||'CLB').replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g,'').slice(0,3).toUpperCase();

  function loadState(){try{const histories=JSON.parse(localStorage.getItem('lhdf.histories')||'[]');const id=localStorage.getItem('lhdf.currentHistoryId');return{histories,history:histories.find(h=>h.id===id)||null};}catch{return{histories:[],history:null};}}
  function lineup(state){if(!state?.lineup)return null;const result={};for(const role of ROLES){result[role]=playerInfo(state.lineup[role]);if(!result[role])return null;}return result;}
  function club(side){return side==='home'?homeClub:awayClub;}
  function squad(side){return side==='home'?homeLineup:awayLineup;}
  function player(side,role){return squad(side)?.[role]||null;}
  function addStat(id,key,n=1){stats[id]=stats[id]||{};stats[id][key]=(stats[id][key]||0)+n;}

  function resetPositions(){pos={home:{},away:{}};for(const side of ['home','away'])for(const role of ROLES)pos[side][role]={...START[side][role]};}
  function colorFor(c,side){const map={municipal:'#d52b3d',comunicaciones:'#efefef','antigua-gfc':'#27905d','xelaju-mc':'#2452c9',mixco:'#51a663',guastatoya:'#e9cf35','san-pedro':'#d72c39',suchitepequez:'#e5c728',marquense:'#e8c22a',aurora:'#2675d0',malacateco:'#d8323d','coban-imperial':'#2476c8'};return map[c?.id]||(side==='home'?'#36d69a':'#eee');}
  function piece(side,role){const p=pos[side][role],pl=player(side,role),owns=possession.side===side&&possession.role===role;return `<button type="button" class="board-piece ${owns?'has-ball':''}" data-side="${side}" data-role="${role}" style="left:${p.x}%;top:${p.y}%;--piece-color:${colorFor(club(side),side)}"><span>${NAME[role]}</span><strong>${pl?.name||'Jugador'}</strong><b>${LABEL[role]}</b></button>`;}
  function render(){homeEl.innerHTML=ROLES.map(r=>piece('home',r)).join('');awayEl.innerHTML=ROLES.map(r=>piece('away',r)).join('');const bp=pos[possession.side][possession.role];ballEl.style.left=`${bp.x}%`;ballEl.style.top=`${bp.y}%`;homeScoreEl.textContent=homeScore;awayScoreEl.textContent=awayScore;clockEl.textContent=`${String(Math.min(minute,90)).padStart(2,'0')}'`;possessionLabel.textContent=`Posesión: ${club(possession.side)?.name||'—'} · ${player(possession.side,possession.role)?.name||'—'}`;selectedLabel.textContent=selected?`Ficha: ${player(selected.side,selected.role)?.name||'—'}`:'Ficha: —';}
  function setEvent(text){eventEl.textContent=`${String(Math.min(minute,90)).padStart(2,'0')}’ · ${text}`;}
  function advance(){minute+=pick(2,4);if(!halftime&&minute>=45){halftime=true;minute=45;setEvent('Descanso. Los equipos reorganizan sus fichas.');}minute=Math.min(90,minute);render();}

  function prepare(){window.ensureLHDFClubBeginning?.();const{history}=loadState();const hs=history?.clubStates?.[history.selectedClub],as=history?.clubStates?.[history.rivalClub];if(!hs||!as)return false;homeClub=clubInfo(history.selectedClub);awayClub=clubInfo(history.rivalClub);homeLineup=lineup(hs);awayLineup=lineup(as);if(!homeClub||!awayClub||!homeLineup||!awayLineup)return false;resetPositions();possession={side:'home',role:'goalkeeper'};selected=null;drag=null;minute=homeScore=awayScore=0;running=paused=resolving=halftime=false;stats={};goalLog=[];pendingAssist={home:null,away:null};homeCodeEl.textContent=code(homeClub);awayCodeEl.textContent=code(awayClub);startButton.hidden=false;startButton.textContent='Comenzar partido';pauseButton.disabled=true;turnEyebrow.textContent='PARTIDO TÁCTICO';turnTitle.textContent='Apunta y juega';turnDescription.textContent='Arrastra una ficha. Cada acción consume tu turno.';eventEl.textContent=`${homeClub.name} vs ${awayClub.name}.`;render();return true;}
  function transition(target){if(typeof fade!=='undefined')fade.classList.add('is-visible');setTimeout(()=>{document.querySelectorAll('.screen.active').forEach(s=>s.classList.remove('active'));target.classList.add('active');if(typeof fade!=='undefined')requestAnimationFrame(()=>fade.classList.remove('is-visible'));},typeof TRANSITION_TIME==='number'?TRANSITION_TIME:480);}

  function pointer(event){const r=field.getBoundingClientRect();return{x:clamp((event.clientX-r.left)/r.width*100,0,100),y:clamp((event.clientY-r.top)/r.height*100,0,100)};}
  function zonePoint(side,role,p){const z=ZONE[side][role];return{x:clamp(p.x,z.minX,z.maxX),y:clamp(p.y,z.minY,z.maxY)};}
  function moveLimit(role){return role==='goalkeeper'?12:role==='defender'?16:role==='midfielder'?18:17;}
  function limitedMove(side,role,target){const from=pos[side][role],z=zonePoint(side,role,target),d=distance(from,z),m=moveLimit(role);if(d<=m)return z;const q=m/d;return zonePoint(side,role,{x:from.x+(z.x-from.x)*q,y:from.y+(z.y-from.y)*q});}
  function nearest(point,side,except=null,radius=7.5){let best=null;for(const role of ROLES){if(role===except)continue;const d=distance(point,pos[side][role]);if(d<=radius&&(!best||d<best.d))best={role,d};}return best;}
  function segmentDistance(p,a,b){const dx=b.x-a.x,dy=b.y-a.y;if(!dx&&!dy)return distance(p,a);const t=clamp(((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy),0,1);return distance(p,{x:a.x+t*dx,y:a.y+t*dy});}
  function interceptor(side,from,to){const rival=side==='home'?'away':'home';let best=null;for(const role of ROLES){const lane=segmentDistance(pos[rival][role],from,to);if(lane<5.4&&distance(pos[rival][role],to)>5&&(!best||lane<best.lane))best={role,lane};}return best;}

  function attemptSteal(side,role){const rival=side==='home'?'away':'home';if(possession.side!==rival)return;const carrier=pos[rival][possession.role];if(distance(pos[side][role],carrier)>8.5)return;const p=role==='defender'?.58:role==='midfielder'?.52:role==='forward'?.36:.2;if(chance(p)){possession={side,role};addStat(player(side,role).id,'recoveries');pendingAssist[rival]=null;setEvent(`${player(side,role).name} gana el duelo y recupera la pelota.`);}else setEvent(`${player(rival,possession.role).name} protege la pelota.`);}
  function move(side,role,target){pos[side][role]=limitedMove(side,role,target);const pl=player(side,role);if(possession.side===side&&possession.role===role)setEvent(`${pl.name} conduce y cambia de posición.`);else{setEvent(`${pl.name} se mueve para ocupar espacio.`);attemptSteal(side,role);}render();}
  function pass(side,fromRole,toRole){if(possession.side!==side||possession.role!==fromRole)return;const from=pos[side][fromRole],to=pos[side][toRole],passer=player(side,fromRole),receiver=player(side,toRole),cut=interceptor(side,from,to),d=distance(from,to);let p=clamp(.96-Math.max(0,d-18)*.009,.62,.96);if(cut)p-=.27;if(chance(p)){possession={side,role:toRole};addStat(passer.id,'passesCompleted');if(toRole==='forward')pendingAssist[side]=passer.id;setEvent(`${passer.name} encuentra a ${receiver.name}.`);}else{const rival=side==='home'?'away':'home',role=cut?.role||nearest(to,rival,null,14)?.role||'midfielder';possession={side:rival,role};addStat(player(rival,role).id,'interceptions');pendingAssist[side]=null;setEvent(`${player(rival,role).name} intercepta el pase.`);}render();}
  function goalAim(side,p){return side==='home'?p.x>=94&&p.y>=36&&p.y<=64:p.x<=6&&p.y>=36&&p.y<=64;}
  function shoot(side,target){if(possession.side!==side||possession.role!=='forward')return;const rival=side==='home'?'away':'home',striker=player(side,'forward'),keeper=player(rival,'goalkeeper'),sp=pos[side].forward,kp=pos[rival].goalkeeper;addStat(striker.id,'shots');const d=side==='home'?100-sp.x:sp.x;if(!chance(clamp(.86-Math.max(0,d-20)*.008,.46,.86))){possession={side:rival,role:'goalkeeper'};pendingAssist[side]=null;setEvent(`${striker.name} remata fuera.`);render();return;}addStat(striker.id,'shotsOnTarget');const aimY=clamp(target.y,36,64),gap=Math.abs(kp.y-aimY);if(chance(clamp(.72-gap*.025+Math.max(0,d-25)*.004,.18,.76))){addStat(keeper.id,'saves');possession={side:rival,role:'goalkeeper'};pendingAssist[side]=null;setEvent(`${keeper.name} realiza la atajada.`);render();return;}if(side==='home')homeScore++;else awayScore++;addStat(striker.id,'goals');addStat(keeper.id,'goalsConceded');if(pendingAssist[side])addStat(pendingAssist[side],'assists');goalLog.push({side,scorerId:striker.id,assisterId:pendingAssist[side],minute:Math.min(minute,90)});pendingAssist[side]=null;render();goal(side,striker);}
  function goal(side,striker){resolving=true;const c=club(side);$('goalClubLogo').src=logoPath(c.logo);$('goalPlayerName').textContent=striker.name;$('goalClubName').textContent=c.name;$('goalScoreText').textContent=`${homeScore} - ${awayScore}`;goalCelebration.hidden=false;setTimeout(()=>{goalCelebration.hidden=true;resetPositions();possession={side:side==='home'?'away':'home',role:'goalkeeper'};selected=null;render();setEvent(`Saque de ${club(possession.side).name} después del gol.`);resolving=false;if(minute>=90)finish();else if(side==='home')scheduleAI();else homeTurn();},1800);}

  function homeTurn(){if(!running||paused||resolving)return;selected=null;render();turnEyebrow.textContent='TU TURNO';turnTitle.textContent=possession.side==='home'?'Construye tu jugada':'Defiende y busca recuperar';turnDescription.textContent='Elige una ficha y arrástrala. Solo tienes una acción.';}
  function homeAction(role,target){if(!running||paused||resolving)return;resolving=true;const owns=possession.side==='home'&&possession.role===role,teamMate=owns?nearest(target,'home',role,8):null;if(owns&&role==='forward'&&goalAim('home',target))shoot('home',target);else if(teamMate)pass('home',role,teamMate.role);else move('home',role,target);advance();if(!goalCelebration.hidden)return;if(minute>=90){finish();return;}selected=null;render();scheduleAI();}
  function scheduleAI(){turnEyebrow.textContent='TURNO RIVAL';turnTitle.textContent=`${awayClub.name} está jugando...`;turnDescription.textContent='El rival también tiene una sola acción.';setTimeout(aiTurn,650);}
  function randomPoint(side,role,toward=false){const z=ZONE[side][role];if(toward){const c=pos[possession.side][possession.role];return zonePoint(side,role,{x:c.x+pick(-5,5),y:c.y+pick(-6,6)});}return{x:pick(Math.ceil(z.minX),Math.floor(z.maxX)),y:pick(Math.ceil(z.minY),Math.floor(z.maxY))};}
  function aiTurn(){if(!running||paused){resolving=false;return;}resolving=true;if(possession.side==='away'){const role=possession.role;if(role==='forward'&&(pos.away.forward.x<44||chance(.55)))shoot('away',{x:2,y:clamp(50+pick(-14,14),36,64)});else if(role==='goalkeeper')pass('away','goalkeeper','defender');else if(role==='defender'&&chance(.72))pass('away','defender',chance(.25)?'forward':'midfielder');else if(role==='midfielder'&&chance(.76))pass('away','midfielder','forward');else if(role==='forward'&&chance(.5))pass('away','forward','midfielder');else move('away',role,role==='goalkeeper'?randomPoint('away',role):zonePoint('away',role,{x:pos.away[role].x-pick(8,15),y:pos.away[role].y+pick(-10,10)}));}else{const carrier=pos.home[possession.role],candidates=ROLES.filter(r=>r!=='goalkeeper').map(role=>({role,d:distance(pos.away[role],carrier)})).sort((a,b)=>a.d-b.d),chosen=candidates[0];move('away',chosen.role,randomPoint('away',chosen.role,true));}advance();if(!goalCelebration.hidden)return;if(minute>=90){finish();return;}resolving=false;homeTurn();}

  function saveOnce(){const{histories,history}=loadState();if(!history||history.inauguralMatchPlayed)return;const hs=history.clubStates?.[history.selectedClub],as=history.clubStates?.[history.rivalClub];if(!hs||!as)return;function clubStats(s,gf,ga){s.statistics=s.statistics||{};s.statistics.matches=(s.statistics.matches||0)+1;s.statistics.goalsFor=(s.statistics.goalsFor||0)+gf;s.statistics.goalsAgainst=(s.statistics.goalsAgainst||0)+ga;if(gf>ga)s.statistics.wins=(s.statistics.wins||0)+1;else if(gf<ga)s.statistics.losses=(s.statistics.losses||0)+1;else s.statistics.draws=(s.statistics.draws||0)+1;}clubStats(hs,homeScore,awayScore);clubStats(as,awayScore,homeScore);[...Object.values(homeLineup),...Object.values(awayLineup)].forEach(pl=>{const st=history.playerStates?.[pl.id];if(!st)return;st.stats=st.stats||{};st.stats.matches=(st.stats.matches||0)+1;for(const[k,v]of Object.entries(stats[pl.id]||{}))st.stats[k]=(st.stats[k]||0)+v;});const title=`${homeClub.name} ${homeScore}-${awayScore} ${awayClub.name}`;hs.history=hs.history||[];hs.history.push({type:'first-match-played',date:'Primer partido',title:'Primer partido de la historia',description:title});history.matches=history.matches||[];history.matches.push({id:`match-${Date.now()}`,type:'inaugural',homeClubId:homeClub.id,awayClubId:awayClub.id,homeScore,awayScore,goals:goalLog,playedAt:new Date().toISOString()});history.inauguralMatchPlayed=true;history.updatedAt=new Date().toISOString();localStorage.setItem('lhdf.histories',JSON.stringify(histories));}
  function finish(){if(!running)return;running=false;resolving=true;pauseButton.disabled=true;saveOnce();selected=null;render();const result=homeScore===awayScore?'Empate':homeScore>awayScore?`Victoria de ${homeClub.name}`:`Victoria de ${awayClub.name}`;eventEl.textContent=`90’ · FINAL · ${homeClub.name} ${homeScore}-${awayScore} ${awayClub.name}`;turnEyebrow.textContent='FINAL DEL PARTIDO';turnTitle.textContent=result;turnDescription.textContent='El encuentro ha terminado.';startButton.hidden=false;startButton.textContent='Repetir prueba';}
  function start(){if(!prepare())return;running=true;resolving=false;pauseButton.disabled=false;startButton.hidden=true;setEvent(`${homeLineup.goalkeeper.name} inicia la jugada.`);homeTurn();}

  function beginDrag(event){if(!running||paused||resolving)return;const el=event.target.closest('.board-piece[data-side="home"]');if(!el)return;event.preventDefault();const role=el.dataset.role,start={...pos.home[role]},current=pointer(event);selected={side:'home',role};selectedLabel.textContent=`Ficha: ${player('home',role).name}`;el.classList.add('is-selected');drag={role,pointerId:event.pointerId,start,current};el.setPointerCapture?.(event.pointerId);aim.setAttribute('x1',start.x);aim.setAttribute('y1',start.y);aim.setAttribute('x2',current.x);aim.setAttribute('y2',current.y);aim.classList.add('is-visible');}
  function dragMove(event){if(!drag||event.pointerId!==drag.pointerId)return;drag.current=pointer(event);aim.setAttribute('x2',drag.current.x);aim.setAttribute('y2',drag.current.y);}
  function dragEnd(event){if(!drag||event.pointerId!==drag.pointerId)return;const action=drag;drag=null;aim.classList.remove('is-visible');if(distance(action.start,action.current)<2.5){selected=null;render();return;}homeAction(action.role,action.current);}
  field.addEventListener('pointerdown',beginDrag);window.addEventListener('pointermove',dragMove);window.addEventListener('pointerup',dragEnd);window.addEventListener('pointercancel',()=>{drag=null;aim.classList.remove('is-visible');selected=null;render();});

  window.showInauguralMatch=function(){if(!prepare()){window.alert('Primero entra a tu club para preparar la plantilla y la alineación.');return;}transition(stage);};
  function launcher(){const options=document.querySelector('.club-menu-options');if(!options)return;let b=$('clubPlayMatchButton');if(!b){b=document.createElement('button');b.id='clubPlayMatchButton';b.className='club-menu-option club-match-launch is-active';b.type='button';options.appendChild(b);b.addEventListener('click',e=>{e.stopPropagation();window.showInauguralMatch();});}b.innerHTML='<em>Jugable · prueba 4</em><strong>Partido inaugural</strong><span>Mueve y apunta las fichas en un partido táctico por turnos.</span>';}
  startButton.addEventListener('click',start);$('matchGameBack').addEventListener('click',()=>{if(running&&!confirm('¿Salir del partido actual?'))return;running=false;window.showOwnedClubMenu?.();});pauseButton.addEventListener('click',()=>{if(!running)return;paused=true;pauseOverlay.hidden=false;});$('resumeMatchButton').addEventListener('click',()=>{paused=false;pauseOverlay.hidden=true;if(!resolving)homeTurn();});$('pauseRulesButton').addEventListener('click',()=>{$('pauseRules').hidden=!$('pauseRules').hidden;});$('abandonMatchButton').addEventListener('click',()=>{if(!confirm('¿Abandonar este partido?'))return;running=false;paused=false;pauseOverlay.hidden=true;window.showOwnedClubMenu?.();});
  launcher();setTimeout(launcher,900);
})();