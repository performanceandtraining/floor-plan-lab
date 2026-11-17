/* The keyboard and visible Undo button share the same project undo action. */
function undoLastEdit(){
 if(draft.length){draft.pop();render();return true}
 if(history.length){stopPlay();state=restoreUndo();if(floor().outline.length<3)step=1;resetTransient();render();return true}
 if(wallStart||openingStart){wallStart=null;openingStart=null;cursorPoint=null;chainActive=false;render();return true}
 return false;
}
$('undo').onclick=undoLastEdit;
$('undo').textContent='↶ Undo · Ctrl+Z';
$('undo').title='Undo the last change (Ctrl+Z or Command+Z)';
function removeSelectedWall(){
 if(selection?.kind!=='wall')return false;
 const f=floor(),wall=f.walls.find(w=>w.id===selection.id);
 if(!wall){if(/^e\d+$/.test(selection.id)){notify('The outside outline must stay closed. Move its corners, or start this floor from scratch.');return true}return false}
 remember();
 f.walls=f.walls.filter(w=>w.id!==wall.id);
 f.openings=f.openings.filter(o=>o.wallId!==wall.id);
 selection=null;wallStart=null;openingStart=null;cursorPoint=null;chainActive=false;drag=null;
 render();notify('Wall removed. Ctrl+Z restores the wall and its windows or doors.');return true;
}
document.addEventListener('keydown',e=>{
 if(document.querySelector('dialog[open]'))return;
 if(e.target?.isContentEditable||e.target?.closest?.('input,textarea,select,[contenteditable]:not([contenteditable="false"]),[role="textbox"]'))return;
 if(e.key==='Backspace'&&!e.ctrlKey&&!e.metaKey&&!e.altKey){if(removeSelectedWall()){e.preventDefault();e.stopPropagation()}return}
 if(!(e.ctrlKey||e.metaKey)||e.altKey||e.shiftKey||e.key.toLowerCase()!=='z')return;
 if(undoLastEdit()){e.preventDefault();e.stopPropagation()}
});
stepHelpText[2][1]+=' Press Ctrl+Z to undo the last wall. On a Mac, use Command+Z. In Select / curve a wall, select an inside wall and press Backspace to remove it.';
