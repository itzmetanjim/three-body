var objs=[[100,100],[400,100]]
var cols=[
  [255, 173, 173],
  [202, 255, 191],
  [155, 246, 255],
  [253, 255, 182],
  [255, 198, 255],
  [20,20,20],
  [255, 214, 165],
  [189, 178, 255],
  [160, 196, 255]
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
      console.log(d)
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
var r1_param=currentURLParams.get("r1"); //default 30
var m1_param=currentURLParams.get("m1"); //default 10
var m2_param=currentURLParams.get("m2"); //default 1
var G_param=currentURLParams.get("G"); //default 0.6
var r1=r1_param!==null?parseFloat(r1_param):30
var m1=m1_param!==null?parseFloat(m1_param):10
var m2=m2_param!==null?parseFloat(m2_param):1
var G=G_param!==null?parseFloat(G_param):0.6

function setup() {
  createCanvas(600, 600)
}

function draw() {
  isClose()
  console.log("deltatime",deltaTime)
  background(30)
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
  console.log(clo);
  if((millis()-prevdragtime<50) && !clo){
    mult=3
  }
  prevdragtime=millis();

  //if its over an existin object, make that objects center the mouse 
  for(let i=0;i<objs.length;i++){
    let e=objs[i]
    let d=dist(mouseX,mouseY,e[0],e[1])
    if(d<r1*mult){
      e[0]=mouseX
      e[1]=mouseY
      
    }
  }
  
}
