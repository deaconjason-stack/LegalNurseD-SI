import assert from 'node:assert/strict';
import {setLocale,t,getLocale} from '../public/modules/i18n.js';
setLocale('zz');assert.equal(t('home.startNew'),'Start a New Story');assert.equal(getLocale(),'zz');
setLocale('en');assert.equal(t('common.home'),'Home');assert.equal(t('home.greeting',{name:'Jay'}),'Welcome back, Jay');
assert.equal(t('missing.key'),'missing.key');
console.log('i18n tests passed');
