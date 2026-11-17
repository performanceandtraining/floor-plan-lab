/* Display names are independent of the room use chosen for traditional guidance. */
(function(root){
 const other='Other / custom';
 function suggest(name){const n=String(name||'').toLowerCase().replace(/[’']/g,'');if(/powder|guest wc/.test(n))return 'Powder room';if(/bathroom|\bwc\b|toilet|ensuite|en-suite/.test(n))return 'Bathroom';if(/\bmaid|\bstaff\b/.test(n))return "Maid's room";if(/\bdriver/.test(n))return "Driver's room";if(/\bmaster\b|\bprimary\b/.test(n)&&/bed|suite/.test(n))return 'Master bedroom';if(/\bbed\b|bedroom|guest suite|guest room|kids room|childrens room|nursery/.test(n))return 'Bedroom';if(/\bkitchen\b/.test(n))return 'Kitchen';if(/\bdining\b/.test(n))return 'Dining room';if(/living|lounge|family room|cinema|media room/.test(n))return 'Living room';if(/study|office|library/.test(n))return 'Study';if(/entrance|foyer|entry/.test(n))return 'Entrance';return other}
 function display(r){return typeof r.label==='string'&&r.label.trim()?r.label.trim():r.type===other?'Room':r.type}
 const api={other,suggest,display};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.RoomLabels=api;
})(typeof globalThis!=='undefined'?globalThis:this);
