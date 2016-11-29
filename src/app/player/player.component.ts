import { Component, OnInit,EventEmitter,Output,Input} from '@angular/core';
import {Observable} from 'rxjs/Rx';
import {DomSanitizer} from '@angular/platform-browser';
import {VisualiserComponent} from '../visualiser/visualiser.component';


declare const Recorder: any;
declare const window;
declare const navigator:any;
@Component({
  selector: 'app-player',
  templateUrl: 'player.component.html',
  styleUrls: ['player.component.css']
})
export class PlayerComponent {
    @Input() audioUrl;
    @Input() soundtimestamps;
    @Input() dragStartIndex;
    @Input() dragEndIndex;
    @Output() timestampemit = new EventEmitter();
    @Output() newrecording = new EventEmitter();
    @Output() clearAllSelection = new EventEmitter();
    @Input() setTimeoutStart;
    public context;
    public audioBuffer: any;
    public nowBufferingIndex: number = 0;
    public PlayableBuffer :any;
    public nowBuffering: any = [];
    public source: any;
    public analyser:any;
    public canvasctx:any;
    public canvas: any;
    public timeOutId: any = [];
    public rec: any;
    public recordStatus: boolean  = false;
    public recorderArray: any = [];
    public playing:boolean = false; 
    public recording: boolean = false;
    public paused: boolean = false;
    public audioLoader:boolean = false;
    constructor(public sanitizer: DomSanitizer ) {
        this.context = new (window.AudioContext || window.webkitAudioContext)(); // define audio context
    }
    ngOnChanges(changes) {
        if(this.audioBuffer) {
            if(changes.soundtimestamps && changes.soundtimestamps.currentValue) {
                this.soundtimestamps = changes.soundtimestamps.currentValue;
                this.clearTimeOut();
            }
        }
        if(changes.audioUrl && changes.audioUrl.currentValue) {
            this.audioLoader = false;
           this.loadAudio();
        }
        
    }

    loadAudio() {
        var request = new XMLHttpRequest();
        console.log(this.audioUrl);
        request.open('GET', this.audioUrl, true);
        request.responseType = 'arraybuffer';
        request.onload = () => {
            this.context.decodeAudioData(request.response,(buffer) => {
                this.audioBuffer  = buffer.getChannelData(0);   
                this.createNewEmptyBuffer();
                this.audioLoader =true;
            });
        }
        request.send();
    }
    reorderBuffer() {
        this.createNewEmptyBuffer();
    }
    getBufferLength() {
        if(!this.soundtimestamps) return;
        let lastElement  = this.soundtimestamps[this.soundtimestamps.length-1];
        return Math.ceil(Number(lastElement.time)+ Number(lastElement.duration));
    }
    
    createNewEmptyBuffer() {
        let audioLength     = this.getBufferLength();
        this.PlayableBuffer = this.context.createBuffer(1, this.context.sampleRate*audioLength,this.context.sampleRate);
        this.LoadDataIntoEmptyBuffer();
    }
    pushToBuffer(index,time) {
        let framestart =  (Number(this.context.sampleRate)* Number(time.time))|0;
        let frameend =  (Number(this.context.sampleRate)*(Number(time.time) + Number(time.duration)))|0;
        for (let i = framestart; i < frameend; i++) {
            this.nowBuffering[this.nowBufferingIndex]  = this.audioBuffer[i];
            this.nowBufferingIndex++;
        }
    }
    LoadDataIntoEmptyBuffer() {
        this.nowBuffering = this.PlayableBuffer.getChannelData(0);
        for(let index in this.soundtimestamps) {
            this.pushToBuffer(index,this.soundtimestamps[index]);
        }
        this.makeBufferSource();
    }

    makeBufferSource() {
        this.analyser = this.context.createAnalyser();
        this.source = this.context.createBufferSource();
        this.source.connect(this.analyser);
        this.source.buffer = this.PlayableBuffer;
        this.source.connect(this.context.destination);
    }
    clearTimeOut() {
        for(let time of this.timeOutId) {
            window.clearInterval(time);
        }
        this.timeOutId = [];
    }
    stop() {
        this.nowBufferingIndex = 0;
        try {
            if(this.playing) {
                this.source.stop();
                this.playing = false    
            }   
            this.paused = false;
            this.context.resume();
            this.clearAllSelection.emit(1);
            this.reorderBuffer();
            this.clearTimeOut();
            console.log('stoped');
        } catch(e) {
         }
        
    }
    starthightlighting(track) {
        track.obser.emit(track.track.time);
    }
    playselection() {
        let startTime = this.soundtimestamps[this.dragStartIndex]['time'];
        let EndTime = this.soundtimestamps[this.dragEndIndex+1]['time'];
        let EndTimeForTimeer = this.soundtimestamps[this.dragEndIndex]['time'];
        let StartTimeForTimeer = this.soundtimestamps[this.dragStartIndex]['time'];
        let duration = EndTime - startTime;
        let highlightEndTime = ((EndTimeForTimeer - StartTimeForTimeer));
        setTimeout(() => {
            this.stop();
        },highlightEndTime*1000)
        console.log(highlightEndTime*1000);
        this.play(startTime,0,this.dragStartIndex,duration);
    }
    playFromSelection() {
        let startTime = this.soundtimestamps[this.dragStartIndex]['time'];
        this.play(startTime,0,this.dragStartIndex);
    }
    highlight(startFrom) {
        let k = startFrom;
        let len = 0;
        let offset = (startFrom==0)?0:this.soundtimestamps[startFrom]['setTime'];
        for (k, len = this.soundtimestamps.length; k < len; k += 1) { 
            let id = setTimeout(this.starthightlighting, (this.soundtimestamps[k]['setTime']-offset)*1000,{track:this.soundtimestamps[k],index:k,obser:this.timestampemit,context:this.context});
            this.timeOutId.push(id);
        }
    }
    record() {
        this.recording = true;
        this.rec = new Recorder(this.source);
        this.rec.record();
        this.recordStatus = true;
    }

    stopRecord() {
        this.rec.stop();
        this.recordStatus = false;
        this.createDownloadLink();
        this.recording = false;
    }
    createDownloadLink() {
        this.rec.exportWAV((blob)=>{
            let data = {
                download: new Date().getTime()+".wav",
                href: this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(blob))    
            }
            this.newrecording.emit(data)
        })
    }
    play(start=0,end=0,highlight=0,duration=null) {
        this.playing = true;
        this.highlight(highlight);
        if(duration)
            this.source.start(0,start,duration); 
        else
            this.source.start(0,start); 
    }
    pause() {
        this.paused = true;
        this.context.suspend();
        this.clearTimeOut();
    }
    resume() {
        this.paused = false;
        this.context.resume();
        this.highlight(this.setTimeoutStart);
    }

  
}
