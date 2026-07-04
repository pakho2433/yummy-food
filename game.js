import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js';

const $ = (id) => document.getElementById(id);
const canvas = $('gameCanvas');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffc36d);
scene.fog = new THREE.Fog(0xffc36d, 22, 58);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;

const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
const clock = new THREE.Clock();

const questions = [
  {type:'Adjective', sentence:'This ________ girl is playing on the swing.', answer:'happy', choices:['happily','happy','happiness'], ingredient:'sweet corn', emoji:'🌽'},
  {type:'Adverb', sentence:'Mandy reads the book ____________.', answer:'quietly', choices:['quiet','quietly','quietness'], ingredient:'green peas', emoji:'🟢'},
  {type:'Adjective', sentence:'The chef cuts the ________ carrots.', answer:'fresh', choices:['fresh','freshly','freshness'], ingredient:'fresh carrots', emoji:'🥕'},
  {type:'Adverb', sentence:'Tom stirs the soup ____________.', answer:'carefully', choices:['careful','carefully','care'], ingredient:'herbs', emoji:'🌿'},
  {type:'Adjective', sentence:'We bake a ________ cake for Grandma.', answer:'delicious', choices:['deliciously','delicious','delight'], ingredient:'cream', emoji:'🍦'},
  {type:'Adverb', sentence:'The children eat their lunch ____________.', answer:'slowly', choices:['slow','slowness','slowly'], ingredient:'golden noodles', emoji:'🍜'},
  {type:'Adjective', sentence:'The ________ lemon makes the drink special.', answer:'sour', choices:['sourly','sour','sourness'], ingredient:'lemon slices', emoji:'🍋'},
  {type:'Adverb', sentence:'The waiter smiles ____________ at the guests.', answer:'politely', choices:['polite','politely','politeness'], ingredient:'magic seasoning', emoji:'✨'},
  {type:'Adjective', sentence:'There is a ________ pizza on the table.', answer:'round', choices:['round','roundly','roundness'], ingredient:'tomatoes', emoji:'🍅'},
  {type:'Adverb', sentence:'Dad cooks the fish ____________.', answer:'well', choices:['good','well','best'], ingredient:'fish fillet', emoji:'🐟'},
  {type:'Adjective', sentence:'The ________ soup warms my hands.', answer:'hot', choices:['hotly','hot','heat'], ingredient:'warm soup base', emoji:'🥣'},
  {type:'Adverb', sentence:'The class answers the question ____________.', answer:'correctly', choices:['correct','correctly','correction'], ingredient:'star sprinkles', emoji:'⭐'}
];

let player = { name:'', className:'', number:'' };
let index = 0, score = 0, locked = false;
let correctItems = [], wrongItems = [];
let foodBits = [], steamBits = [], confetti = [];

const mats = {
  floor: mat(0xd48643, .78),
  wall: mat(0xffe2b5, .7),
  wood: mat(0x9a5a31, .56),
  metal: mat(0xb7c2c8, .23, .35),
  pot: mat(0x6f7e86, .25, .25),
  soup: mat(0xf39c3d, .38),
  chefWhite: mat(0xfffbf1, .48),
  skin: mat(0xe2a174, .46),
  green: mat(0x4eb569, .62),
  red: mat(0xd95335, .48),
  yellow: mat(0xf6c84f, .5),
  orange: mat(0xf08a35, .5)
};

function mat(color, roughness=.55, metalness=0){
  return new THREE.MeshPhysicalMaterial({color, roughness, metalness, clearcoat:.18, clearcoatRoughness:.6});
}
function mesh(geo, material, x=0, y=0, z=0, parent=scene){
  const m = new THREE.Mesh(geo, material);
  m.position.set(x,y,z);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}
function roundedLabel(text, bg='#fff7e8', fg='#59301c'){
  const c = document.createElement('canvas');
  c.width = 1024; c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = bg;
  g.beginPath();
  g.roundRect?.(18,18,988,220,58) || g.rect(18,18,988,220);
  g.fill();
  g.strokeStyle = '#ffffff';
  g.lineWidth = 12;
  g.stroke();
  g.fillStyle = fg;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = '900 78px system-ui, sans-serif';
  g.fillText(text,512,132);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false}));
  s.scale.set(5.2,1.3,1);
  return s;
}

function buildKitchen(){
  scene.add(new THREE.HemisphereLight(0xfff5df,0x6b4637,2.25));
  const sun = new THREE.DirectionalLight(0xffdfad,3.4);
  sun.position.set(-10,18,8);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048,2048);
  sun.shadow.camera.left = sun.shadow.camera.bottom = -22;
  sun.shadow.camera.right = sun.shadow.camera.top = 22;
  scene.add(sun);
  const rim = new THREE.DirectionalLight(0x9fd7ff,1.2);
  rim.position.set(12,9,-10);
  scene.add(rim);
  const warm = new THREE.PointLight(0xff8a3a,14,20,2);
  warm.position.set(0,5,2);
  scene.add(warm);

  const floor = mesh(new THREE.PlaneGeometry(50,50), mats.floor, 0,-.04,0);
  floor.rotation.x = -Math.PI/2;
  mesh(new THREE.BoxGeometry(46,7,.55), mats.wall, 0,3.45,-14);
  mesh(new THREE.BoxGeometry(.55,7,28), mats.wall, -23,3.45,0);
  mesh(new THREE.BoxGeometry(.55,7,28), mats.wall, 23,3.45,0);

  for(let x=-15;x<=15;x+=7.5){
    mesh(new THREE.BoxGeometry(4.8,3,.2), mat(0x7d503b,.45), x,3.2,-13.68);
    const w = mesh(new THREE.PlaneGeometry(4.2,2.45), new THREE.MeshPhysicalMaterial({color:0xa6e6ff,roughness:.12,transparent:true,opacity:.78}), x,3.2,-13.55);
    w.castShadow = false;
  }
  for(let x of [-10,0,10]){
    mesh(new THREE.CylinderGeometry(.04,.04,1.3,8), mat(0x3a2a24), x,6.1,-2.5);
    const shade = mesh(new THREE.ConeGeometry(.7,.55,24,1,true), mat(0xd8582c,.48), x,5.45,-2.5);
    shade.rotation.x = Math.PI;
    const l = new THREE.PointLight(0xffc266,8,10,2);
    l.position.set(x,5.2,-2.5); scene.add(l);
  }

  const island = new THREE.Group();
  scene.add(island);
  mesh(new THREE.BoxGeometry(9,1.25,4.2), mats.wood, 0,.62,0,island);
  mesh(new THREE.BoxGeometry(9.6,.34,4.8), mat(0xffe6c7,.42), 0,1.4,0,island);
  mesh(new THREE.CylinderGeometry(2.15,2.3,.8,40), mats.pot, 0,2.05,0,island);
  mesh(new THREE.CylinderGeometry(1.85,1.95,.18,40), mats.soup, 0,2.5,0,island);
  const spoon = mesh(new THREE.CylinderGeometry(.055,.055,4.1,12), mat(0xb88950,.35), 2,2.75,.55,island);
  spoon.rotation.z = .72; spoon.rotation.x = .35;
  const label = roundedLabel('Tap the best word!');
  label.position.set(0,4.65,-.4);
  island.add(label);

  makeChef(-4.6,0,1.9);
  makeChef(4.6,0,1.9,true);
}

function makeChef(x,y,z, flip=false){
  const g = new THREE.Group(); g.position.set(x,y,z); g.rotation.y = flip ? -.45 : .45; scene.add(g);
  mesh(new THREE.SphereGeometry(.48,24,18), mats.skin, 0,2.35,0,g);
  mesh(new THREE.SphereGeometry(.58,24,18), mats.chefWhite, 0,1.36,0,g).scale.set(.8,1.25,.55);
  mesh(new THREE.CylinderGeometry(.42,.5,.23,20), mats.chefWhite, 0,2.78,0,g);
  for(let i=-1;i<=1;i++) mesh(new THREE.SphereGeometry(.25,16,10), mats.chefWhite, i*.22,2.98,0,g);
  mesh(new THREE.SphereGeometry(.045,8,8), mat(0x1d1714), -.16,2.4,.42,g);
  mesh(new THREE.SphereGeometry(.045,8,8), mat(0x1d1714), .16,2.4,.42,g);
  const mouth = mesh(new THREE.TorusGeometry(.13,.014,8,18,Math.PI), mat(0x9d3e32), 0,2.25,.43,g);
  mouth.rotation.z = Math.PI;
  mesh(new THREE.CylinderGeometry(.1,.1,1.05,12), mats.chefWhite, -.55,1.42,.05,g).rotation.z = -.55;
  mesh(new THREE.CylinderGeometry(.1,.1,1.05,12), mats.chefWhite, .55,1.42,.05,g).rotation.z = .55;
}

function addIngredient(q){
  const colors = [0x4eb569,0xf6c84f,0xf08a35,0xd95335,0xf8f1d0,0x8fd3ff];
  const group = new THREE.Group();
  scene.add(group);
  const color = colors[foodBits.length % colors.length];
  const material = mat(color,.45,0);
  for(let i=0;i<7;i++){
    const geo = i%3===0 ? new THREE.SphereGeometry(.13+Math.random()*.08,16,10)
      : i%3===1 ? new THREE.BoxGeometry(.22,.12,.18)
      : new THREE.ConeGeometry(.13,.28,14);
    const a = Math.random()*Math.PI*2, r = Math.random()*1.35;
    const bit = mesh(geo, material, Math.cos(a)*r, 2.77 + Math.random()*.25, Math.sin(a)*r, group);
    bit.rotation.set(Math.random()*2,Math.random()*2,Math.random()*2);
    bit.userData = {a,r,s:Math.random()*2+1};
  }
  foodBits.push(group);
  correctItems.push(`${q.emoji} ${q.ingredient}`);
  updateDishCard();
  burst(q.emoji);
}

function makeSteam(){
  for(let i=0;i<18;i++){
    const s = new THREE.Sprite(new THREE.SpriteMaterial({color:0xffffff,transparent:true,opacity:.25,depthWrite:false}));
    s.scale.set(.28,.28,.28);
    resetSteam(s,true);
    scene.add(s); steamBits.push(s);
  }
}
function resetSteam(s, first=false){
  s.position.set((Math.random()-.5)*2.5, 2.7 + (first?Math.random()*2.5:0), (Math.random()-.5)*2.3);
  s.material.opacity = .1 + Math.random()*.28;
  s.userData = {speed:.25+Math.random()*.35, drift:(Math.random()-.5)*.22};
}
function burst(emoji){
  toast(`Correct! ${emoji} added!`);
  for(let i=0;i<18;i++){
    const c = new THREE.Sprite(new THREE.SpriteMaterial({color:[0xffffff,0xffde59,0x82e585,0xff8b6b][i%4],transparent:true,opacity:1,depthWrite:false}));
    c.position.set((Math.random()-.5)*2,3.3,(Math.random()-.5)*1.6);
    c.scale.set(.13,.13,.13);
    c.userData = {v:new THREE.Vector3((Math.random()-.5)*3,Math.random()*2+2,(Math.random()-.5)*3),life:1};
    scene.add(c); confetti.push(c);
  }
}

function setSize(){
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w,h,false);
  camera.aspect = w/h;
  camera.updateProjectionMatrix();
  updateCamera();
}
window.addEventListener('resize', setSize);

function updateCamera(){
  const w = window.innerWidth;
  const mobile = w < 760;
  camera.position.set(0, mobile ? 7.4 : 6.4, mobile ? 10.5 : 9.2);
  camera.lookAt(0,2.1,0);
}

function shuffle(arr){
  return [...arr].sort(()=>Math.random()-.5);
}

function showQuestion(){
  locked = false;
  const q = questions[index];
  $('typeTag').textContent = q.type;
  $('typeTag').style.background = q.type === 'Adjective' ? '#ffe3a9' : '#dff3ff';
  $('sentence').textContent = q.sentence;
  $('qNo').textContent = `${index+1}/${questions.length}`;
  $('feedback').textContent = '';
  $('answers').innerHTML = '';
  shuffle(q.choices).forEach(choice=>{
    const b = document.createElement('button');
    b.textContent = choice;
    b.addEventListener('click',()=>choose(choice,b));
    $('answers').appendChild(b);
  });
}

function choose(choice, button){
  if(locked) return;
  locked = true;
  const q = questions[index];
  const ok = choice === q.answer;
  [...$('answers').children].forEach(b=>{
    b.disabled = true;
    if(b.textContent === q.answer) b.classList.add('correct');
  });
  if(ok){
    score++;
    $('score').textContent = score;
    $('feedback').textContent = `Great! "${q.answer}" is the best ${q.type.toLowerCase()}.`;
    addIngredient(q);
  }else{
    button.classList.add('wrong');
    $('feedback').textContent = `No seasoning added. Correct answer: ${q.answer}`;
    wrongItems.push({sentence:q.sentence, answer:q.answer, chosen:choice, type:q.type});
    toast('Try the next one! No seasoning this time.');
  }
  setTimeout(()=>{
    index++;
    if(index >= questions.length) finish();
    else showQuestion();
  }, 1350);
}

function updateDishCard(){
  const percent = Math.round((score/questions.length)*100);
  $('progressFill').style.width = `${percent}%`;
  $('ingredientList').textContent = correctItems.length ? correctItems.join('  ') : 'No ingredients yet.';
}

function finish(){
  $('hud').classList.add('hidden');
  $('result').classList.remove('hidden');
  const pct = Math.round(score/questions.length*100);
  $('resultTitle').textContent = pct >= 80 ? 'Excellent chef!' : pct >= 60 ? 'Good cooking!' : 'Keep practising!';
  $('resultSummary').innerHTML = `<b>${player.name}</b> (${player.className} No. ${player.number}) scored <b>${score}/${questions.length}</b> (${pct}%).<br>Ingredients added: ${correctItems.length ? correctItems.join(' ') : 'none'}.`;
  if(wrongItems.length){
    $('wrongReview').innerHTML = '<b>Review:</b><br>' + wrongItems.map((w,i)=>`${i+1}. ${w.sentence}<br>Chosen: ${w.chosen} → Correct: <b>${w.answer}</b> (${w.type})`).join('<br><br>');
  }else{
    $('wrongReview').innerHTML = '<b>Perfect! All answers were correct.</b>';
  }
}

function resultText(){
  const pct = Math.round(score/questions.length*100);
  const lines = [
    'Cooking Grammar Chef Result',
    `Name: ${player.name}`,
    `Class: ${player.className}`,
    `Class number: ${player.number}`,
    `Score: ${score}/${questions.length} (${pct}%)`,
    `Ingredients added: ${correctItems.length ? correctItems.join(', ') : 'none'}`,
    '',
    'Wrong answers / review:'
  ];
  if(wrongItems.length){
    wrongItems.forEach((w,i)=>lines.push(`${i+1}. ${w.sentence} | Chosen: ${w.chosen} | Correct: ${w.answer} | Type: ${w.type}`));
  }else lines.push('None. Perfect score!');
  lines.push('', `Finished at: ${new Date().toLocaleString()}`);
  return lines.join('\n');
}

function sendEmail(){
  const subject = encodeURIComponent(`Cooking Grammar Chef Result - ${player.className} No.${player.number} ${player.name}`);
  const body = encodeURIComponent(resultText());
  window.location.href = `mailto:lauyuetki@twghscysps.edu.hk?subject=${subject}&body=${body}`;
}

async function copyResult(){
  try{
    await navigator.clipboard.writeText(resultText());
    toast('Result copied!');
  }catch{
    toast('Copy failed. Please use email button.');
  }
}

function toast(text){
  const t = $('toast');
  t.textContent = text;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(()=>t.classList.remove('show'),1200);
}

function resetGame(){
  index = 0; score = 0; locked = false; correctItems = []; wrongItems = [];
  foodBits.forEach(g=>scene.remove(g)); foodBits = [];
  $('score').textContent = '0';
  $('progressFill').style.width = '0%';
  $('ingredientList').textContent = 'No ingredients yet.';
  $('result').classList.add('hidden');
  $('start').classList.remove('hidden');
}

$('playerForm').addEventListener('submit', (e)=>{
  e.preventDefault();
  player = {
    name: $('studentName').value.trim(),
    className: $('studentClass').value.trim(),
    number: $('studentNumber').value.trim()
  };
  if(!player.name || !player.className || !player.number) return;
  $('start').classList.add('hidden');
  $('hud').classList.remove('hidden');
  showQuestion();
});
$('emailBtn').addEventListener('click', sendEmail);
$('copyBtn').addEventListener('click', copyResult);
$('againBtn').addEventListener('click', resetGame);

buildKitchen();
makeSteam();
setSize();

function animate(){
  const dt = Math.min(clock.getDelta(), .033);
  const time = clock.elapsedTime;
  foodBits.forEach((g,gi)=>{
    g.children.forEach((m,i)=>{
      if(m.userData && 'a' in m.userData){
        m.rotation.x += dt*(.5+i*.08);
        m.rotation.y += dt*(.35+i*.05);
        m.position.y += Math.sin(time*m.userData.s + gi + i)*.002;
      }
    });
  });
  steamBits.forEach(s=>{
    s.position.y += s.userData.speed * dt;
    s.position.x += Math.sin(time*1.5 + s.position.z)*s.userData.drift*dt;
    s.material.opacity *= .998;
    if(s.position.y > 5.6) resetSteam(s);
  });
  for(let i=confetti.length-1;i>=0;i--){
    const c = confetti[i];
    c.userData.life -= dt;
    c.userData.v.y -= 4.8*dt;
    c.position.addScaledVector(c.userData.v,dt);
    c.material.opacity = Math.max(0,c.userData.life);
    if(c.userData.life <= 0){
      scene.remove(c); confetti.splice(i,1);
    }
  }
  renderer.render(scene,camera);
  requestAnimationFrame(animate);
}
animate();
