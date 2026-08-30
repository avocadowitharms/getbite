const foodFiles=['apple.png','avocado.png','banana.png','burger.png','cake.png','carrot.png','chocolate.png','coffee.png','cookie.png','donut.png','pizza.png','popsicle.png','salad.png','strawberry.png','sushi.png'];
const hero=document.querySelector('[data-physics-hero]');
const field=document.querySelector('[data-food-field]');
const hint=document.querySelector('[data-scroll-hint]');

if(hero&&field){
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pieces=[];
  let floorOffset=0;
  let raf=0;
  let last=performance.now();

  const random=(min,max)=>min+Math.random()*(max-min);
  const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));

  function createPiece(name,index){
    const img=document.createElement('img');
    img.src=`food/${name}`;
    img.alt='';
    img.className='falling-food';
    img.draggable=false;

    const size=random(64,112);
    const piece={
      el:img,
      size,
      x:random(0,Math.max(1,field.clientWidth-size)),
      y:-size-random(25,field.clientHeight*.75)-index*19,
      vx:random(-.45,.45),
      vy:random(-.1,.35),
      rotation:random(-25,25),
      vr:random(-.65,.65),
      settled:false
    };

    img.style.width=`${size}px`;
    img.style.height=`${size}px`;
    img.addEventListener('error',()=>{img.style.display='none';});
    field.appendChild(img);
    pieces.push(piece);
  }

  function placeReducedMotion(){
    const width=Math.max(1,field.clientWidth);
    const base=field.clientHeight-28;
    pieces.forEach((piece,index)=>{
      piece.x=(index*83)%(Math.max(1,width-piece.size));
      piece.y=base-piece.size-(index%3)*34;
      piece.el.style.transform=`translate3d(${piece.x}px,${piece.y}px,0) rotate(${piece.rotation}deg)`;
    });
  }

  function resolvePair(a,b){
    const ax=a.x+a.size*.5;
    const ay=a.y+a.size*.54;
    const bx=b.x+b.size*.5;
    const by=b.y+b.size*.54;
    const dx=ax-bx;
    const dy=ay-by;
    const distance=Math.hypot(dx,dy)||.001;
    const minDistance=(a.size+b.size)*.34;
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
      const impulse=-alongNormal*.38;
      a.vx+=nx*impulse;
      a.vy+=ny*impulse;
      b.vx-=nx*impulse;
      b.vy-=ny*impulse;
    }
  }

  function updateScrollDepth(){
    const rect=hero.getBoundingClientRect();
    const scrollDistance=Math.max(1,hero.offsetHeight*.82);
    const depth=clamp((-rect.top)/scrollDistance,0,1);
    floorOffset=depth*hero.offsetHeight*.78;
    if(hint)hint.style.opacity=String(1-depth*2.2);
  }

  function tick(now){
    const dt=Math.min(2,(now-last)/16.667||1);
    last=now;
    const width=field.clientWidth;
    const floor=field.clientHeight-7+floorOffset;

    for(const p of pieces){
      p.vy+=.34*dt;
      p.x+=p.vx*dt;
      p.y+=p.vy*dt;
      p.rotation+=p.vr*dt;

      if(p.x<0){p.x=0;p.vx=Math.abs(p.vx)*.62;}
      if(p.x+p.size>width){p.x=width-p.size;p.vx=-Math.abs(p.vx)*.62;}

      if(p.y+p.size>floor){
        p.y=floor-p.size;
        if(Math.abs(p.vy)>.6)p.vy*=-.18;else p.vy=0;
        p.vx*=.91;
        p.vr*=.92;
      }
    }

    for(let i=0;i<pieces.length;i++){
      for(let j=i+1;j<pieces.length;j++)resolvePair(pieces[i],pieces[j]);
    }

    for(const p of pieces){
      p.el.style.transform=`translate3d(${p.x}px,${p.y}px,0) rotate(${p.rotation}deg)`;
      p.el.style.opacity=p.y>field.clientHeight+40?'0':'1';
    }

    raf=requestAnimationFrame(tick);
  }

  foodFiles.forEach(createPiece);
  updateScrollDepth();

  if(reduced){
    placeReducedMotion();
  }else{
    raf=requestAnimationFrame(tick);
    window.addEventListener('scroll',updateScrollDepth,{passive:true});
    window.addEventListener('resize',()=>{
      pieces.forEach(p=>{p.x=clamp(p.x,0,Math.max(0,field.clientWidth-p.size));});
      updateScrollDepth();
    },{passive:true});
  }

  document.addEventListener('visibilitychange',()=>{
    if(reduced)return;
    if(document.hidden&&raf){cancelAnimationFrame(raf);raf=0;}
    else if(!document.hidden&&!raf){last=performance.now();raf=requestAnimationFrame(tick);}
  });
}
