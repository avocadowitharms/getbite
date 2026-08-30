(() => {
  const foodFiles=['apple.png','avocado.png','banana.png','burger.png','cake.png','carrot.png','chocolate.png','coffee.png','cookie.png','donut.png','pizza.png','popsicle.png','salad.png','strawberry.png','sushi.png'];

  function addLinework(){
    if(document.getElementById('bite-linework'))return;
    const style=document.createElement('style');
    style.id='bite-linework';
    style.textContent=`
      .hero.physics-hero{
        border:2px solid #11110f!important;
        box-shadow:7px 8px 0 #11110f!important;
        border-radius:34px!important;
      }
      .button{
        border:2px solid #11110f!important;
      }
      .button:hover{
        box-shadow:3px 4px 0 #11110f!important;
      }
      .system-step{
        border:2px solid #11110f!important;
        box-shadow:4px 5px 0 #11110f!important;
      }
      .step-number{
        border:1.5px solid #11110f!important;
        background:#fffefa!important;
        color:#11110f!important;
      }
      .mini-editor,.bite-result,.range-demo{
        border:2px solid #11110f!important;
      }
      .range-track{
        outline:1.5px solid #11110f;
        outline-offset:-1px;
      }
      .flex-chip,.flex-pill{
        border:1.5px solid #11110f!important;
        background:#fffefa!important;
      }
      .editor-showcase{
        border:2px solid #11110f!important;
        box-shadow:6px 7px 0 #11110f!important;
      }
      .editor-plate{
        box-shadow:4px 5px 0 #11110f!important;
      }
      .flex-section{
        border:2px solid #11110f!important;
        box-shadow:6px 7px 0 #11110f!important;
      }
      .feature-grid article{
        border:2px solid #11110f!important;
        box-shadow:3px 4px 0 #11110f!important;
      }
      .feature-icon{
        border:1.5px solid #11110f!important;
      }
      .goals-section{
        border:2px solid #11110f!important;
        box-shadow:6px 7px 0 #11110f!important;
      }
      .goal-visual{
        border:2px solid #11110f!important;
        box-shadow:3px 4px 0 #11110f!important;
      }
      .privacy-preview{
        border:2px solid #11110f!important;
        box-shadow:5px 6px 0 #11110f!important;
      }
      .privacy-badges span{
        border:1.5px solid #11110f!important;
        background:#fffefa!important;
        color:#11110f!important;
      }
      .cta-mark img{
        outline:2px solid #11110f;
        outline-offset:2px;
      }
      @media(max-width:680px){
        .hero.physics-hero{box-shadow:4px 5px 0 #11110f!important}
        .system-step,.feature-grid article{box-shadow:3px 3px 0 #11110f!important}
        .editor-showcase,.flex-section,.goals-section,.privacy-preview{box-shadow:4px 4px 0 #11110f!important}
      }
    `;
    document.head.appendChild(style);
  }

  function init(){
    addLinework();
    const hero=document.querySelector('[data-physics-hero]');
    const field=document.querySelector('[data-food-field]');
    const hint=document.querySelector('[data-scroll-hint]');
    if(!hero||!field||field.dataset.physicsReady==='true')return;
    field.dataset.physicsReady='true';

    const reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pieces=[];
    let floorOffset=0;
    let raf=0;
    let last=performance.now();

    const random=(min,max)=>min+Math.random()*(max-min);
    const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));

    function dimensions(){
      const rect=field.getBoundingClientRect();
      return {
        width: Math.max(rect.width, hero.clientWidth, window.innerWidth, 320),
        height: Math.max(rect.height, hero.clientHeight, 640)
      };
    }

    function createPiece(name,index){
      const {width,height}=dimensions();
      const img=document.createElement('img');
      img.src=`assets/${name}`;
      img.alt='';
      img.className='falling-food';
      img.draggable=false;
      img.decoding='async';

      const size=random(72,124);
      const piece={
        el:img,
        size,
        x:random(0,Math.max(1,width-size)),
        y:-size-random(10,height*.35)-index*18,
        vx:random(-.65,.65),
        vy:random(.2,1.2),
        rotation:random(-30,30),
        vr:random(-.85,.85)
      };

      img.style.width=`${size}px`;
      img.style.height=`${size}px`;
      img.style.opacity='1';
      img.style.transform=`translate3d(${piece.x}px,${piece.y}px,0) rotate(${piece.rotation}deg)`;
      field.appendChild(img);
      pieces.push(piece);
    }

    function resolvePair(a,b){
      const dx=(a.x+a.size*.5)-(b.x+b.size*.5);
      const dy=(a.y+a.size*.52)-(b.y+b.size*.52);
      const distance=Math.hypot(dx,dy)||.001;
      const minDistance=(a.size+b.size)*.36;
      if(distance>=minDistance)return;
      const overlap=minDistance-distance;
      const nx=dx/distance;
      const ny=dy/distance;
      const correction=overlap*.5;
      a.x+=nx*correction;
      a.y+=ny*correction;
      b.x-=nx*correction;
      b.y-=ny*correction;
      const relativeVx=a.vx-b.vx;
      const relativeVy=a.vy-b.vy;
      const alongNormal=relativeVx*nx+relativeVy*ny;
      if(alongNormal<0){
        const impulse=-alongNormal*.42;
        a.vx+=nx*impulse;
        a.vy+=ny*impulse;
        b.vx-=nx*impulse;
        b.vy-=ny*impulse;
      }
    }

    function updateScrollDepth(){
      const rect=hero.getBoundingClientRect();
      const depth=clamp((-rect.top)/Math.max(1,hero.offsetHeight*.82),0,1);
      floorOffset=depth*hero.offsetHeight*.95;
      if(hint)hint.style.opacity=String(Math.max(0,1-depth*2.4));
    }

    function placeStatic(){
      const {width,height}=dimensions();
      pieces.forEach((p,i)=>{
        p.x=(i*91)%Math.max(1,width-p.size);
        p.y=height-p.size-12-(i%4)*32;
        p.el.style.transform=`translate3d(${p.x}px,${p.y}px,0) rotate(${p.rotation}deg)`;
      });
    }

    function tick(now){
      const dt=Math.min(2.2,Math.max(.5,(now-last)/16.667||1));
      last=now;
      const {width,height}=dimensions();
      const floor=height-8+floorOffset;

      for(const p of pieces){
        p.vy+=.52*dt;
        p.x+=p.vx*dt;
        p.y+=p.vy*dt;
        p.rotation+=p.vr*dt;

        if(p.x<0){p.x=0;p.vx=Math.abs(p.vx)*.68;}
        if(p.x+p.size>width){p.x=width-p.size;p.vx=-Math.abs(p.vx)*.68;}

        if(p.y+p.size>floor){
          p.y=floor-p.size;
          if(Math.abs(p.vy)>1)p.vy*=-.24;else p.vy=0;
          p.vx*=.93;
          p.vr*=.94;
        }
      }

      for(let i=0;i<pieces.length;i++){
        for(let j=i+1;j<pieces.length;j++)resolvePair(pieces[i],pieces[j]);
      }

      for(const p of pieces){
        p.el.style.transform=`translate3d(${p.x}px,${p.y}px,0) rotate(${p.rotation}deg)`;
        p.el.style.opacity=p.y>height+100?'0':'1';
      }

      raf=requestAnimationFrame(tick);
    }

    foodFiles.forEach(createPiece);
    updateScrollDepth();

    if(reduced){
      placeStatic();
    }else{
      raf=requestAnimationFrame(tick);
      window.addEventListener('scroll',updateScrollDepth,{passive:true});
      window.addEventListener('resize',updateScrollDepth,{passive:true});
    }

    document.addEventListener('visibilitychange',()=>{
      if(reduced)return;
      if(document.hidden&&raf){cancelAnimationFrame(raf);raf=0;}
      else if(!document.hidden&&!raf){last=performance.now();raf=requestAnimationFrame(tick);}
    });
  }

  if(document.readyState==='complete'){
    requestAnimationFrame(init);
  }else{
    window.addEventListener('load',()=>requestAnimationFrame(init),{once:true});
  }
})();
