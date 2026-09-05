import {TYPES} from '../config.mjs';import {esc,label} from '../utils/ui.mjs';
const {HandlebarsApplicationMixin}=foundry.applications.api;
function controls(value,path='system'){return Object.entries(value).map(([k,v])=>{const name=`${path}.${k}`,title=label(k);if(v&&typeof v==='object'&&!Array.isArray(v))return `<fieldset><legend>${esc(title)}</legend>${controls(v,name)}</fieldset>`;if(typeof v==='boolean')return `<label class="ea-check"><input type="checkbox" name="${name}" ${v?'checked':''}>${esc(title)}</label>`;if(Array.isArray(v))return `<label>${esc(title)}<input name="${name}" value="${esc(v.join(', '))}" data-ea-array></label>`;return `<label>${esc(title)}${['description','narrative','trigger','requirements'].includes(k)?`<textarea name="${name}">${esc(v)}</textarea>`:`<input name="${name}" type="${typeof v==='number'?'number':'text'}" ${typeof v==='number'?'min="0" step="0.5"':''} value="${esc(v)}">`}</label>`;}).join('');}
export class EAItemSheet extends HandlebarsApplicationMixin(foundry.applications.sheets.ItemSheetV2){
 static DEFAULT_OPTIONS={classes:['ea-app','ea-item'],position:{width:520,height:650},window:{resizable:true},form:{submitOnChange:true}};
 static PARTS={body:{template:'systems/eterno-azul/templates/items/item.hbs',scrollable:['']}};
 async _prepareContext(o){return {...await super._prepareContext(o),name:this.item.name,img:this.item.img,type:TYPES[this.item.type],controls:controls(this.item.system.toObject())};}
 _processFormData(event,form,formData){const data=super._processFormData(event,form,formData);for(const input of form.querySelectorAll('[data-ea-array]'))foundry.utils.setProperty(data,input.name,input.value.split(',').map(s=>s.trim()).filter(Boolean));return data;}
}
