import { Component ,ViewChild,EventEmitter,Output,NgZone} from '@angular/core';
import {AudioDataService} from './audio-data.service';
import {WordComponent} from './word/word.component';
import {PlayerComponent} from './player/player.component';
import {ReadData} from './models/readData';
import { Http, Headers,Response,RequestOptions} from '@angular/http';
import { AngularFire, FirebaseListObservable } from 'angularfire2';
import {Observable} from 'rxjs/Rx';
import { ContextMenuService, ContextMenuComponent } from 'angular2-contextmenu';
import {HistoryService} from './service/history.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  providers:[AudioDataService],
  styleUrls: ['app.component.css']
})
export class AppComponent {
    @ViewChild(PlayerComponent) PlayerComponent:PlayerComponent;
    public realdata:Array<ReadData> = [];
    public drag:boolean = false;
    public dragStartIndex:number;
    public dragEndIndex:number;
    public pasteBin:any;
    public lastSelected: any;
    public recordings: any = [];
    
    public music: string;
    public audioRef: any;
    public items: any[] = [
          { name: 'John', otherProperty: 'Foo' },
          { name: 'Joe', otherProperty: 'Bar' },
      ];
    
    constructor(public audioData: AudioDataService,
        private http: Http,
        public af: AngularFire,
        public history:HistoryService,
        private contextMenuService: ContextMenuService) {
        this.audioRef = af.database.list('/audio');
        //this.c();
        
    }
    showMessage(ele) {
        if(ele =="cut") this.cut();
        if(ele =="pasteBefore") this.paste('before');
        if(ele =="pasteAfter") this.paste('after');
        if(ele =="undo") this.undo();
        if(ele =="playselection") this.playselection();
        if(ele =="playfrom") this.playfrom();
        if(ele =="breakline") this.breakline();
    }
    breakline() {
        console.log(this.dragStartIndex);
        let emptyarray = new ReadData('' ,0,0,false,false,false,true);
        this.realdata = [...this.realdata.slice(0, this.dragStartIndex+1),emptyarray,...this.realdata.slice(this.dragStartIndex+1)];
        this.audioData.audioData = this.realdata;
    }

    returnNewArray() {
         this.realdata = [];   
    }
    undo() {
        // console.log(this.history.history.length);
        // if(this.history.history.length>2) {
        //     this.realdata = this.history.history[this.history.history.length-2];
        // } 
        // if(this.history.history.length==2) {
        //     this.realdata = this.history.history[0];
        // }
    }
    clickEvent(data: ReadData) {
        data.hightlight = !data.hightlight; 
        this.selection(0,1);//clear all selection
    }
    selectAnotherWord($event) {
        if($event.action =="remove") {
            this.realdata.splice($event.index,1);
            let elem = (Number($event.ind)).toFixed();
            document.getElementById(elem).focus();
        }
    }
    playselection() {
        this.PlayerComponent.playselection();
    }
    playfrom() {
        this.PlayerComponent.playFromSelection();
    }
    
    draggedStart(e) {
        this.drag = true;
        this.dragStartIndex = e;
    }
    showOptions() {
        console.log('clicked ');
    }
    
    fileChange(event) {
        let url ="https://apis.voicebase.com/v2-beta/media";
        let headers = new Headers({ 'Accept': 'application/json' ,
                                    'Authorization':'Bearer ' + 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiJlMTdlNDlhMC1jNDEwLTQ4MjAtOTg5ZS05YWJkMGI2ZGRiMTciLCJ1c2VySWQiOiJhdXRoMHw1ODBmOTFjN2ExYmMyY2MwNjZjYWEzYjciLCJvcmdhbml6YXRpb25JZCI6IjZkMzMwNmEwLWI2Y2ItMGYwYy1mMTcyLWVmMWY3YmJlNjE2ZCIsImVwaGVtZXJhbCI6ZmFsc2UsImlhdCI6MTQ3NzQ5NTM3MjMwMSwiaXNzIjoiaHR0cDovL3d3dy52b2ljZWJhc2UuY29tIn0.Xl07d9oevEqBpH0edSdG_mrdkMOzaSPW4LA0ktBfEGY'});
        let fileList: FileList = event.target.files;
            if(fileList.length > 0) {
                let file: File = fileList[0];
                this.rawpost(file)
                    .then(res => {
                        this.saveFileDetailsFirebase(res);
                    },(err) => {

                    })
            }
    }
    dataURItoBlob(dataURI) {
        var binary = atob(dataURI.split(',')[1]);
        var array = [];
        for (var i = 0; i < binary.length; i++) {
            array.push(binary.charCodeAt(i));
        }
        return new Blob([new Uint8Array(array)], { type: 'image/jpeg' });
    }
    rawpost(data:any) {
        let path = 'https://apis.voicebase.com/v2-beta/media';
        let form  = document.forms.namedItem("fileinfo");
        let Data = new FormData(form);
        return new Promise(function (res,rej) {
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        res(JSON.parse(xhr.response))
                    }
                    else {
                         rej(xhr.response);    
                    }
                }
            };
            xhr.open('POST', path, true);
            xhr.setRequestHeader('Authorization', 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiJlMTdlNDlhMC1jNDEwLTQ4MjAtOTg5ZS05YWJkMGI2ZGRiMTciLCJ1c2VySWQiOiJhdXRoMHw1ODBmOTFjN2ExYmMyY2MwNjZjYWEzYjciLCJvcmdhbml6YXRpb25JZCI6IjZkMzMwNmEwLWI2Y2ItMGYwYy1mMTcyLWVmMWY3YmJlNjE2ZCIsImVwaGVtZXJhbCI6ZmFsc2UsImlhdCI6MTQ3NzQ5NTM3MjMwMSwiaXNzIjoiaHR0cDovL3d3dy52b2ljZWJhc2UuY29tIn0.Xl07d9oevEqBpH0edSdG_mrdkMOzaSPW4LA0ktBfEGY');
            xhr.send(Data);
        });
    }
    saveFileDetailsFirebase(res) {
        this.audioRef.push(res);
        this.realdata = [...this.realdata.slice(0, 1),this.realdata[1],...this.realdata.slice(2)];
    }
    erroruploading(err) {
        alert('error');
    }
    draggedEnded(e,$event) {
        console.log($event);
        this.drag = false;
        this.dragEndIndex = e;
    }
    pushtoRecording(data) {
        this.recordings.push(data);
    }
    clear() {
        this.dragEndIndex = this.dragStartIndex = 0;
        this.selection(0,1);//clear all selection
        this.pasteBin = undefined;
    }
    
    selection(e,clear) {
        if(this.drag==true || clear ==true) {    
            for(let i=0;i<this.realdata.length;i++) 
                if(i>this.dragStartIndex-1 && i< e)
                    this.realdata[i].hightlight = true;
                else
                    this.realdata[i].hightlight = false;
        }
    }
    
    cut() {
        console.log(this.dragEndIndex-this.dragStartIndex);
        let cliplength = this.dragEndIndex-this.dragStartIndex;
        this.pasteBin = this.realdata.splice(this.dragStartIndex,cliplength);
    }
    
    paste(where) {
        let startFrom;
        if(where =='after')  startFrom = this.dragStartIndex+1;
        else  startFrom = this.dragStartIndex;
        for(let i=this.pasteBin.length-1;i>=0;i--)  {
            this.realdata.splice(startFrom,0,this.pasteBin[i]);
        }
        this.PlayerComponent.stop();
        this.history.pushRow(this.realdata);
        this.clearAllReadSelection();
    }
    clearAllReadSelection() {
        let time = 0;
        for (let i = 1, len = this.realdata.length; i < len; i += 1) { 
            time = time + Number(this.realdata[i-1].duration);
            this.realdata[i].setTime  = Number(time);
            this.realdata[i].read  = false;
        }
        this.realdata = [...this.realdata.slice(0, 1),this.realdata[1],...this.realdata.slice(2)];
    }

    speechhightlight(time) {
        for (let i = 0, len = this.realdata.length; i < len; i += 1) { 
            if(this.realdata[i].time == time) {
                this.lastSelected = i;
                if(i>0)
                this.realdata[i-1].read =false;
                this.realdata[i].read = true;
                break;
            }            
        }   
    }
    
    createArray(newrow) {
        this.realdata = [...this.realdata,newrow];
    }
    loadAudioFile($event){
        this.music = 'http://54.226.118.162:8000/'+$event.name;
        this.realdata.splice(0,this.realdata.length+1);
        this.getAndArrageData();
    }
    getAndArrageData() {
        this.realdata = this.audioData.audioData;
        this.history.pushRow(this.realdata);
    }
    saveDataFirebase() {
        this.af.database.object('/word/${this.audioData.audioId}/word').set(this.realdata)
    }

}
