// Original algorithmic lullaby: C pentatonic, a slow 16-note motif and soft triads.
export class BloomAudio{
 context:AudioContext|null=null;gain:GainNode|null=null;timer:number|undefined;step=0;playing=false;
 start(volume:number){if(!this.context){this.context=new AudioContext();this.gain=this.context.createGain();this.gain.connect(this.context.destination);}this.context.resume();this.setVolume(volume);if(this.playing)return;this.playing=true;this.note();this.timer=window.setInterval(()=>this.note(),520);}
 note(){const c=this.context!,g=this.gain!;const melody=[72,76,79,76,74,72,69,67,72,74,76,79,81,79,76,72];const tone=(midi:number,length:number,amp:number)=>{const o=c.createOscillator(),v=c.createGain();o.type='sine';o.frequency.value=440*2**((midi-69)/12);v.gain.setValueAtTime(0,c.currentTime);v.gain.linearRampToValueAtTime(amp,c.currentTime+0.025);v.gain.exponentialRampToValueAtTime(0.001,c.currentTime+length);o.connect(v);v.connect(g);o.start();o.stop(c.currentTime+length+0.05);};tone(melody[this.step%16],1.8,0.2);if(this.step%4===0){const root=[48,53,57,55][Math.floor(this.step%16/4)];[root,root+7,root+12].forEach(n=>tone(n,2.6,0.045));}this.step++;}
 pause(){clearInterval(this.timer);this.playing=false;this.context?.suspend();}
 setVolume(volume:number){if(this.gain&&this.context)this.gain.gain.setTargetAtTime(volume,this.context.currentTime,0.08);}
}
