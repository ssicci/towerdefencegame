const{chromium}=require('playwright');
(async()=>{
  const b=await chromium.launch({headless:true});
  const p=await b.newPage();
  await p.setViewportSize({width:390,height:844});
  const logs=[],errs=[];
  p.on('console',m=>logs.push('['+m.type()+'] '+m.text()));
  p.on('pageerror',e=>errs.push('PAGEERR: '+e.message));
  await p.goto('file:///c:/dev/towerdefence/mobile.html');
  await p.waitForTimeout(3000);
  await p.screenshot({path:'diag1.png'});

  // 시작화면의 버튼 좌표 찾기
  const info=await p.evaluate(()=>{
    const startScreen=document.getElementById('start-screen');
    const startGo=document.getElementById('start-go');
    const modeBtn=document.querySelector('.ss-btn[data-mode="normal"]');
    const diffBtn=document.querySelector('.ss-btn[data-diff="easy"]');
    const canvas=document.getElementById('gc');
    const cw=document.getElementById('cw');

    function getRect(el){
      if(!el)return null;
      const r=el.getBoundingClientRect();
      return{top:r.top,left:r.left,width:r.width,height:r.height,cx:r.left+r.width/2,cy:r.top+r.height/2};
    }

    function getTopElement(x,y){
      const el=document.elementFromPoint(x,y);
      return el?el.tagName+'#'+el.id+'.'+[...el.classList].join('.'):'null';
    }

    const goRect=getRect(startGo);
    const modeBtnRect=getRect(modeBtn);
    const diffBtnRect=getRect(diffBtn);

    return{
      startScreen:{
        display:getComputedStyle(startScreen).display,
        zIndex:getComputedStyle(startScreen).zIndex,
        pointerEvents:getComputedStyle(startScreen).pointerEvents,
        rect:getRect(startScreen)
      },
      canvas:{
        pointerEvents:canvas.style.pointerEvents,
        cssPointerEvents:getComputedStyle(canvas).pointerEvents,
        rect:getRect(canvas),
        width:canvas.width,height:canvas.height,
        cssWidth:canvas.style.width,cssHeight:canvas.style.height
      },
      cw:{
        display:getComputedStyle(cw).display,
        position:getComputedStyle(cw).position,
        zIndex:getComputedStyle(cw).zIndex
      },
      startGo:{
        rect:goRect,
        topEl:goRect?getTopElement(goRect.cx,goRect.cy):'n/a',
        pointerEvents:startGo?getComputedStyle(startGo).pointerEvents:'n/a'
      },
      modeBtn:{
        rect:modeBtnRect,
        topEl:modeBtnRect?getTopElement(modeBtnRect.cx,modeBtnRect.cy):'n/a'
      },
      diffBtn:{
        rect:diffBtnRect,
        topEl:diffBtnRect?getTopElement(diffBtnRect.cx,diffBtnRect.cy):'n/a'
      }
    };
  });
  console.log('=== DIAG ===');
  console.log(JSON.stringify(info,null,2));
  console.log('=== LOGS ===');
  console.log(logs.slice(0,30).join('\n')||'없음');
  console.log('=== ERRORS ===');
  console.log(errs.join('\n')||'없음');

  // 실제 클릭 시도
  const modeBtnRect=info.modeBtn.rect;
  if(modeBtnRect){
    await p.mouse.click(modeBtnRect.cx,modeBtnRect.cy);
    await p.waitForTimeout(300);
    const afterClick=await p.evaluate(()=>{
      const btn=document.querySelector('.ss-btn[data-mode="normal"]');
      return{hasSel:btn&&btn.classList.contains('sel')};
    });
    console.log('After click on mode btn (already sel, should stay sel):', JSON.stringify(afterClick));
    // sandbox 버튼 클릭 테스트
    const sbRect=await p.evaluate(()=>{
      const b=document.querySelector('.ss-btn[data-mode="sandbox"]');
      if(!b)return null;
      const r=b.getBoundingClientRect();
      return{cx:r.left+r.width/2,cy:r.top+r.height/2};
    });
    if(sbRect){
      await p.mouse.click(sbRect.cx,sbRect.cy);
      await p.waitForTimeout(300);
      const afterSb=await p.evaluate(()=>{
        const btn=document.querySelector('.ss-btn[data-mode="sandbox"]');
        return{hasSel:btn&&btn.classList.contains('sel')};
      });
      console.log('After click sandbox btn (should be sel):', JSON.stringify(afterSb));
    }
  }

  await b.close();
})();
