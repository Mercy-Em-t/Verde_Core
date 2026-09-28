(function(){
  const KEY='tm_cms_v1';
  const DEFAULT={brand:{name:'TRYPHENE MURUGAT',tagline:'SYSTEMS ARCHITECTURE & GOVERNANCE'},
    journey:{title:'Know where you are. Know what happens next.',intro:'A simple client view of the project: what happens, what you provide, what we provide, what you can expect, and what you may want to add.'},
    settings:{leadThresholds:{priority:75,review:50}}};
  function get(){try{return JSON.parse(localStorage.getItem(KEY)||'null')||DEFAULT}catch(e){return DEFAULT}}
  function save(v){localStorage.setItem(KEY,JSON.stringify(v));return v}
  function reset(){return save(JSON.parse(JSON.stringify(DEFAULT)))}
  window.TMCMS={KEY,DEFAULT,get,save,reset};
})();
