const{chromium}=require('playwright');
(async()=>{
  const b=await chromium.launch({headless:true});
  const p=await b.newPage();
  await p.setViewportSize({width:800,height:600});
  const logs=[],errs=[];
  p.on('console',m=>{if(m.type()==='error'||m.text().includes('오류'))logs.push('['+m.type()+'] '+m.text());});
  p.on('pageerror',e=>errs.push('PAGEERR: '+e.message));
  await p.goto('file:///c:/dev/towerdefence/mobile.html');
  await p.waitForTimeout(3000);
  await p.screenshot({path:'shot1_start.png'});

  await p.click('#start-go');
  await p.waitForTimeout(500);
  await p.click('#mode-normal-btn');
  await p.waitForTimeout(1500);
  await p.screenshot({path:'shot2_game.png'});

  // 웨이브 JS로 직접 트리거 (UI hidden 상태 대응)
  await p.evaluate(()=>document.getElementById('wb').click());
  await p.waitForTimeout(2000);
  await p.screenshot({path:'shot3_wave.png'});

  // 캔버스 크기 확인
  const canvasSize=await p.evaluate(()=>{
    const c=document.getElementById('gc');
    const cw=document.getElementById('cw');
    return{
      canvasCSS:{w:c.style.width,h:c.style.height},
      cwSize:{w:cw.clientWidth,h:cw.clientHeight},
      viewport:{w:window.innerWidth,h:window.innerHeight}
    };
  });
  console.log('Canvas size:', JSON.stringify(canvasSize));

  // S 상태 확인
  const state=await p.evaluate(()=>{
    if(typeof S==='undefined') return 'S is undefined';
    return {wave:S.wave,waveActive:S.waveActive,enemies:S.enemies.length,over:S.over};
  });
  console.log('Game state:', JSON.stringify(state));

  const msg=await p.$eval('#msg',e=>e.textContent);
  console.log('MSG:', msg);
  console.log('ERRORS:', [...logs,...errs].join('\n')||'없음');
  await b.close();
})();
