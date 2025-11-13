var objs=[[100,100],[200,100],[150,200]]
var cols=[
  [255, 173, 173],
  [202, 255, 191],
  [155, 246, 255],
  [253, 255, 182],
  [255, 198, 255],
  [0,0,0],
  [255,255,255],
  [255, 214, 165],
  [189, 178, 255],
  [160, 196, 255],
  [233, 182, 59],
  [198, 110, 82],
]
var prevdragtime = 0
function getColor(ind){
  return cols[ind%cols.length]
}
function isClose(){
  let fl=false
  objs.forEach((e,i)=>{
    for(let j=i+1;j<objs.length;j++){
      let e2=objs[j]
      let d=dist(e[0],e[1],e2[0],e2[1])
      if(d<r1*0.7){
        objs[j][0]+=r1*0.1
        objs[j][1]+=r1*0.1
      }
      if(d<r1*3.5){
        fl=true
      }
      if(objs[j][0]>width){objs[j][0]=width}
      if(objs[j][0]<0){objs[j][0]=0}
      if(objs[j][1]>height){objs[j][1]=height}
      if(objs[j][1]<0){objs[j][1]=0}
  }
})
  return fl
}

var currentURLParams=new URL(window.location.href).searchParams
var r1_param=currentURLParams.get("r1");
var m1_param=currentURLParams.get("m1");
var m2_param=currentURLParams.get("m2");
var G_param=currentURLParams.get("G");
var dT_param=currentURLParams.get("dT");
var Drag_param=currentURLParams.get("Drag");
var canvasSize_param=currentURLParams.get("canvasSize");
var chaos_param=currentURLParams.get("chaos");
var r1=r1_param!==null?parseFloat(r1_param):30
var m1=m1_param!==null?parseFloat(m1_param):10
var m2=m2_param!==null?parseFloat(m2_param):1
var G=G_param!==null?parseFloat(G_param):0.6
var dT=dT_param!==null?parseFloat(dT_param):10
var Drag=Drag_param!==null?parseFloat(Drag_param):1
var canvasSize=canvasSize_param!==null?parseInt(canvasSize_param):300
var chaos=chaos_param!==null

var smobs = []
var print = console.log
var pixelColors = []
var objVels = []
var basinLayer
function setup() {
  createCanvas(canvasSize, canvasSize);
  //ensure pixels[] maps 1:1 to canvas
  pixelDensity(1);
  background(30);
  strokeWeight(1);
  //layer for captured pixels so main canvas can be cleared each frame
  basinLayer=createGraphics(canvasSize,canvasSize);
  basinLayer.pixelDensity(1);
  basinLayer.background(30);
  basinLayer.strokeWeight(1);
  for (let i = 0; i < width; i++) {
    const row = [];
    for (let j = 0; j < height; j++) {
      //-1=not yet determined
      row.push(-1);
    }
    pixelColors.push(row);
  }
  //create test particles/smobs for each pixel
  for (let i = 0; i < width; i++) {
    const row = [];
    for (let j = 0; j < height; j++) {
      row.push({
        x: i,
        y: j,
        vx: 0,
        vy: 0,
        initialX: i,
        initialY: j,
        captured: false,
        capturedBy: -1
      });
    }
    smobs.push(row);
  }
  print("Setup complete with", width * height, "test particles")
  for(let i=0;i<objs.length;i++){objVels.push({vx:0,vy:0})}
}
function do_physics(){
  //use parameterized time step
  const dt = dT 
  if(chaos){
    for(let i=0;i<objs.length;i++){
      for(let j=i+1;j<objs.length;j++){
        var o1=objs[i];
        var o2=objs[j];
        var dx=o2[0]-o1[0];
        var dy=o2[1]-o1[1];
        var r2=dx*dx+dy*dy;
        if(r2<0.01) r2=0.01;
        var invR=Math.sqrt(1/r2);
        var invR3=invR*invR*invR;
        var accelFactor=G*m1*invR3; //accel on each toward the other
        objVels[i].vx+=dx*accelFactor*dt;
        objVels[i].vy+=dy*accelFactor*dt;
        objVels[j].vx-=dx*accelFactor*dt;
        objVels[j].vy-=dy*accelFactor*dt;
      }
    }
    for(let i=0;i<objs.length;i++){
      objs[i][0]+=objVels[i].vx*dt;
      objs[i][1]+=objVels[i].vy*dt;
      objVels[i].vx*=Drag;
      objVels[i].vy*=Drag;
      if(objs[i][0]<0){objs[i][0]=0;objVels[i].vx*=-0.3}
      if(objs[i][0]>width){objs[i][0]=width;objVels[i].vx*=-0.3}
      if(objs[i][1]<0){objs[i][1]=0;objVels[i].vy*=-0.3}
      if(objs[i][1]>height){objs[i][1]=height;objVels[i].vy*=-0.3}
    }
  }
  
  for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++) {
      var smob = smobs[i][j];
      
      //skip already-captured
      if (smob.captured) continue;
      
      var accelX = 0;
      var accelY = 0;
      
      //remember f=G*m1*m2/r^2
      //so accel=f/m2=G*m1/r^2 where r is distance
      for (let k = 0; k < objs.length; k++) {
        var obj = objs[k];
        var dx = obj[0] - smob.x;
        var dy = obj[1] - smob.y;
        var r2 = dx*dx + dy*dy;
        //otherwise you may get frustrated with it taking forever to converge
        if (r2 < 0.01) r2 = 0.01;
        var invR = 1.0 / Math.sqrt(r2);
        var invR3 = invR * invR * invR;
        var factor = G * m1 * invR3;
        accelX += dx * factor;
        accelY += dy * factor;
      }
      
      smob.vx += accelX * dt;
      smob.vy += accelY * dt;
      smob.x += smob.vx * dt;
      smob.y += smob.vy * dt;
      smob.vx *= Drag;
      smob.vy *= Drag;

      for (let k = 0; k < objs.length; k++) {
        var obj = objs[k];
        var dx = smob.x - obj[0];
        var dy = smob.y - obj[1];
        var r2 = dx*dx + dy*dy;
        var rCap2 = (r1 * 0.5) * (r1 * 0.5);
        if (r2 < rCap2) {
          smob.captured = true;
          smob.capturedBy = k;
          pixelColors[i][j] = k;
          const col = getColor(k);
          basinLayer.stroke(col[0], col[1], col[2]);
          basinLayer.point(smob.initialX, smob.initialY);
          break;
        }
      }
      
      if (!smob.captured && (smob.x < 0 || smob.x > width || smob.y < 0 || smob.y > height)) {
        //smob.captured = true;
        //pixelColors[i][j] = -2; 
      }
    }
  }
}
function draw() {
  do_physics()
  //clear main canvas to avoid trails for moving objects
  background(30)
  //draw basin layer (accumulated captured pixels)
  image(basinLayer,0,0)
  //draw the big objects (planets) on top
  objs.forEach((e,i)=>{
    fill(...getColor(i))
    stroke(...getColor(i))
    ellipse(e[0],e[1],r1,r1)
    fill(10,10,20)
    stroke(10,10,20)
    ellipse(e[0],e[1],r1*0.6,r1*0.6)
  })
}


function mouseDragged(){
  let mult=0.7
  let clo=isClose();
  if((millis()-prevdragtime<50) && !clo){
    mult=3
  }
  prevdragtime=millis();

  //if its over an existing object, make that objects center the mouse
  for(let i=0;i<objs.length;i++){
    let e=objs[i]
    let d=dist(mouseX,mouseY,e[0],e[1])
    if(d<r1*mult){
      e[0]=mouseX
      e[1]=mouseY
      resetSimulation();
      break;
    }
  }
}

function doubleClicked() {
  //add a new object at mouse position
  if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
    objs.push([mouseX, mouseY]);
    resetSimulation();
  }
  //prevent default
  return false; 
}

function mousePressed(event) {
  if (event.button === 2) {
    let minDist = Infinity;
    let minIndex = -1;
    for(let i = 0; i < objs.length; i++) {
      let d = dist(mouseX, mouseY, objs[i][0], objs[i][1]);
      if (d < r1 * 2 && d < minDist) {
        minDist = d;
        minIndex = i;
      }
    }
    if (minIndex >= 0 && objs.length > 1) { 
      objs.splice(minIndex, 1);
      resetSimulation();
    }
    //prevent default
    return false; 
  }
}

function resetSimulation() {
  background(30)
  basinLayer.background(30)
  for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++) {
      smobs[i][j] = {
        x: i,
        y: j,
        vx: 0,
        vy: 0,
        initialX: i,
        initialY: j,
        captured: false,
        capturedBy: -1
      };
      pixelColors[i][j] = -1;
    }
  }
  objVels=[]; for(let i=0;i<objs.length;i++){objVels.push({vx:0,vy:0})}
}
function keyPressed() {
  //s to save
  //r to reset
  if (key === 'r' || key === 'R') {
    resetSimulation();
  }else if (key === 's' || key === 'S') {
    save();
  }

}
