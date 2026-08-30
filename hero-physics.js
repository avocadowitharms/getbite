const foodFiles=['apple.png','avocado.png','banana.png','burger.png','cake.png','carrot.png','chocolate.png','coffee.png','cookie.png','donut.png','pizza.png','popsicle.png','salad.png','strawberry.png','sushi.png'];
const hero=document.querySelector('[data-physics-hero]');
const field=document.querySelector('[data-food-field]');
const hint=document.querySelector('[data-scroll-hint]');

if(hero&&field){
  const pieces=[];
  const rand=(min,max)=>min+Math.random()*(max-min);
  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
  let floorOffset=0;
  let last=performance.now();
  let raf=0;

  function spawn(name,index){
    const img=document.createElement('img');
    img.src=`assets/${name}`;
    img.alt='';
    img.className='falling-food';
    img.draggable=false;

    const size=rand(72,122);
    const width=Math.max(field.clientWidth,320);
    const p={
      el:img,
      size,
      x:rand(6,Math.max(7,width-size-6)),
      y:-size-rand(0,180)-index*13,
      vx:rand(-1.05,1.05),
      vy:rand(0.2,1.5),
      angle:rand(-32,32),
      spin:rand(-1.25,1.25)
    };

    img.style.width=`${size}px`;
    img.style.height='auto';
    img.style.opacity='1';
    field.appendChild(img);
    pieces.push(p);
  }

  function collide(a,b){
    const ar=a.size*.34;
    const br=b.size*.34;
    const ax=a.x+a.size*.5;
    const ay=a.y+a.size*.5;
    const bx=b.x+b.size*.5;
    const by=b.y+b.size*.5;
    let dx=ax-bx;
    let dy=ay-by;
    let d=Math.hypot(dx,dy);
    const min=ar+br;
    if(!d||d>=min)return;

    const nx=dx/d;
    const ny=dy/d;
    const overlap=(min-d)*.52;
    a.x+=nx*overlap;
    a.y+=ny*overlap;
    b.x-=nx*overlap;
    b.y-=ny*overlap;

    const rvx=a.vx-b.vx;
    const rvy=a.vy-b.vy;
    const normalVelocity=rvx*nx+rvy*ny;
    if(normalVelocity<0){
      const impulse=-normalVelocity*.34;
      a.vx+=nx*impulse;
      a.vy+=ny*impulse;
      b.vx-=nx*impulse;
      b.vy-=ny*impulse;
    }
  }

  function updateFloor(){
    const rect=hero.getBoundingClientRect();
    const progress=clamp(-rect.top/Math.max(1,hero.offsetHeight*.72),0,1);
    floorOffset=progress*hero.offsetHeight*1.05;
    if(hint)hint.style.opacity=String(clamp(1-progress*3,0,1));
  }

  function frame(now){
    const dt=clamp((now-last)/16.667,.35,2.1);
    last=now;
    const width=Math.max(field.clientWidth,1);
    const floor=field.clientHeight-6+floorOffset;

    for(const p of pieces){
      p.vy+=.42*dt;
      p.x+=p.vx*dt;
      p.y+=p.vy*dt;
      p.angle+=p.spin*dt;

      if(p.x<0){p.x=0;p.vx=Math.abs(p.vx)*.72;}
      if(p.x+p.size>width){p.x=Math.max(0,width-p.size);p.vx=-Math.abs(p.vx)*.72;}

      if(p.y+p.size>floor){
        p.y=floor-p.size;
        if(Math.abs(p.vy)>1.1)p.vy=-Math.abs(p.vy)*.24;else p.vy=0;
        p.vx*=.94;
        p.spin*=.95;
      }
    }

    for(let i=0;i<pieces.length;i++){
      for(let j=i+1;j<pieces.length;j++)collide(pieces[i],pieces[j]);
    }

    for(const p of pieces){
      const hidden=p.y>field.clientHeight+120;
      p.el.style.opacity=hidden?'0':'1';
      p.el.style.transform=`translate3d(${p.x}px,${p.y}px,0) rotate(${p.angle}deg)`;
    }

    raf=requestAnimationFrame(frame);
  }

  foodFiles.forEach(spawn);
  updateFloor();

  window.addEventListener('scroll',updateFloor,{passive:true});
  window.addEventListener('resize',()=>{
    pieces.forEach(p=>{p.x=clamp(p.x,0,Math.max(0,field.clientWidth-p.size));});
    updateFloor();
  },{passive:true});

  raf=requestAnimationFrame(frame);

  document.addEventListener('visibilitychange',()=>{
    if(document.hidden&&raf){cancelAnimationFrame(raf);raf=0;}
    if(!document.hidden&&!raf){last=performance.now();raf=requestAnimationFrame(frame);}
  });
}
