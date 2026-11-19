import test from 'node:test';
import assert from 'node:assert/strict';
import { isLabSettings, loadouts, originalSettings } from '../src/lib/sandbox-loadouts.ts';

test('every starting loadout is accepted by the editor contract',()=>{ for(const preset of loadouts) assert.ok(isLabSettings(preset.settings),preset.name); });
test('stored settings reject malformed, nonfinite, and unsupported values',()=>{
  for(const value of [null,{}, {...originalSettings,font:'injected-font'}, {...originalSettings,button:'arbitrary'}, {...originalSettings,ink:{}}, {...originalSettings,ink:{...originalSettings.ink,splat:'url(https://example.com)'}}, {...originalSettings,currentStrength:Infinity}, {...originalSettings,ropeDamping:4}, {...originalSettings,waveAmplitude:-1}]) assert.equal(isLabSettings(value),false);
});
test('editing a saved copy does not alter the original loadout',()=>{const copy=structuredClone(originalSettings);copy.ink.waterMid='#000000';assert.equal(originalSettings.ink.waterMid,'#2a1152');assert.ok(isLabSettings(copy));});
