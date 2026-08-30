const foodFiles=['apple.png','avocado.png','banana.png','burger.png','cake.png','carrot.png','chocolate.png','coffee.png','cookie.png','donut.png','pizza.png','popsicle.png','salad.png','strawberry.png','sushi.png'];
const field=document.querySelector('[data-food-field]');
if(field){
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pieces=[];
  const floorPad=8;
  const makePiece=(name,i)=>{
    const img=document.createElement('img');
    img.src=`food/${name}`;
    img.alt='';
    img.className='falling-food';
    const size=58+Math.random()*54;
    const x=Math.random()*Math.max(20,field.clientWidth-size);
    const y=-120-Math.random()*field.clientHeight*.75-i*24;
    const p={el:img,x,y,vx:(Math.random()-.5)*.45,vy:0,rot:(Math.random()-.5)*30,vr:(Math.random()-.5)*.6,size};
    img.style.width=`${size}px`;
    field.appendChild(img);
    pieces.push(p);
  };
  foodFiles.forEach(makePiece);
  if(reduced){
    pieces.forEach((p,i)=>{p.y=field.clientHeight-p.size-floorPad-(i%4)*18;p.x=(i*91)%Math.max(1,field.clientWidth-p.size);p.el.style.transform=`translate(${p.x}px,${p.y}px) rotate(${p.rot}deg)`});
  }else{
    let last=performance.now();
    const tick=now=>{
      const dt=Math.min(32,now-last)/16.67;last=now;
      const floor=field.clientHeight-floorPad;
      for(const p of pieces){
        p.vy+=.34*dt;
        p.x+=p.vx*dt;p.y+=p.vy*dt;p.rot+=p.vr*dt;
        if(p.x<0){p.x=0;p.vx=Math.abs(p.vx)*.75}
        if(p.x+p.size>field.clientWidth){p.x=field.clientWidth-p.size;p.vx=-Math.abs(p.vx)*.75}
        const bottom=p.y+p.size;
        if(bottom>floor){p.y=floor-p.size;p.vy*=-.24;p.vx*=.93;p.vr*=.94;if(Math.abs(p.vy)<.18)p.vy=0}
        for(const q of pieces){
          if(q===p)continue;
          const dx=(p.x+p.size/2)-(q.x+q.size/2),dy=(p.y+p.size/2)-(q.y+q.size/2),min=(p.size+q.size)*.3,d=Math.hypot(dx,dy);
          if(d&&d<min){const push=(min-d)*.035;p.x+=dx/d*push;p.y+=dy/d*push;p.vx+=dx/d*.025;p.vy+=dy/d*.018}
        }
        p.el.style.transform=`translate(${p.x}px,${p.y}px) rotate(${p.rot}deg)`;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    window.addEventListener('scroll',()=>{
      const depth=Math.min(1,window.scrollY/Math.max(1,field.clientHeight*.9));
      field.style.setProperty('--scroll-depth',depth.toFixed(3));
    },{passive:true});
  }
}