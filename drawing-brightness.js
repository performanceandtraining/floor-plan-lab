/* Fade only the source image; traced walls, openings and labels remain clear. */
let drawingBrightness=70;
const brightnessControl=document.createElement('div');brightnessControl.className='drawing-brightness';brightnessControl.id='drawingBrightnessControl';
const brightnessLabel=document.createElement('label');brightnessLabel.htmlFor='drawingBrightness';brightnessLabel.textContent='Drawing brightness';
const brightnessInput=document.createElement('input');brightnessInput.type='range';brightnessInput.id='drawingBrightness';brightnessInput.min=0;brightnessInput.max=100;brightnessInput.step=5;brightnessInput.value=drawingBrightness;brightnessInput.setAttribute('aria-label','Drawing brightness');brightnessInput.title='Fade the uploaded drawing. Your traced lines stay clear.';
const brightnessOutput=document.createElement('output');brightnessOutput.htmlFor='drawingBrightness';brightnessOutput.id='drawingBrightnessValue';
const originalDrawing=button('Original',()=>{drawingBrightness=100;applyDrawingBrightness()});originalDrawing.title='Show the uploaded drawing at full brightness';
brightnessControl.append(brightnessLabel,brightnessInput,brightnessOutput,originalDrawing);document.querySelector('.zoom-toolbar').append(brightnessControl);
function applyDrawingBrightness(){const value=Number(drawingBrightness);drawingBrightness=Number.isFinite(value)?G.clamp(value,0,100):70;$('canvas').querySelector('image')?.setAttribute('opacity',drawingBrightness/100);brightnessInput.value=drawingBrightness;brightnessOutput.textContent=drawingBrightness+'%';brightnessControl.hidden=step===5&&exploreView==='3d'}
brightnessInput.oninput=()=>{drawingBrightness=Number(brightnessInput.value);applyDrawingBrightness()};
const beforeBrightnessDraw=draw;draw=function(){beforeBrightnessDraw();applyDrawingBrightness()};
applyDrawingBrightness();
