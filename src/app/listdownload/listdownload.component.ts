import { Component, OnInit,EventEmitter,Output,Input} from '@angular/core';
import {Observable} from 'rxjs/Rx';
import {DomSanitizer} from '@angular/platform-browser';
import {VisualiserComponent} from '../visualiser/visualiser.component';
import { Http, Headers,Response,RequestOptions} from '@angular/http';
import { AngularFire, FirebaseListObservable } from 'angularfire2';
import {AudioDataService} from '../audio-data.service';


declare const Recorder: any;
declare const window;
declare const navigator:any;
@Component({
  selector: 'app-listdownload',
  templateUrl: 'listdownload.component.html',
  styleUrls: ['listdownload.component.css']
})
export class ListdownloadComponent {
    public loader:boolean = false;
    public audioRef: any;
    @Output() loadNewAudio = new EventEmitter();
    constructor(private http: Http,public af: AngularFire, public audioSer: AudioDataService) {
        this.audioRef = af.database.list('/audio');
    }

    fileChange(event) {
        let url ="https://apis.voicebase.com/v2-beta/media";
        let headers = new Headers({ 'Accept': 'application/json' ,
                                    'Authorization':'Bearer ' + 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiJlMTdlNDlhMC1jNDEwLTQ4MjAtOTg5ZS05YWJkMGI2ZGRiMTciLCJ1c2VySWQiOiJhdXRoMHw1ODBmOTFjN2ExYmMyY2MwNjZjYWEzYjciLCJvcmdhbml6YXRpb25JZCI6IjZkMzMwNmEwLWI2Y2ItMGYwYy1mMTcyLWVmMWY3YmJlNjE2ZCIsImVwaGVtZXJhbCI6ZmFsc2UsImlhdCI6MTQ3NzQ5NTM3MjMwMSwiaXNzIjoiaHR0cDovL3d3dy52b2ljZWJhc2UuY29tIn0.Xl07d9oevEqBpH0edSdG_mrdkMOzaSPW4LA0ktBfEGY'});
         this.loader = true;
        let fileList: FileList = event.target.files;
            if(fileList.length > 0) {
                let file: File = fileList[0];
                let audioPromise = [this.rawpost(file),this.uploadToServer(file)];
                Promise.all(audioPromise)
                    .then(res => {
                        let data: any = res[0];
                        this.loader = false;
                        data.name = res[1];
                        this.saveFileDetailsFirebase({mediaid: data.mediaId,name: data.name,status: data.status});
                    })
            }
    }
    
    saveFileDetailsFirebase(res) {
        this.audioRef.push(res);
    }
    uploadToServer(data: any) {
        let path  = 'http://54.226.118.162:8000';
        let form  = document.forms.namedItem("fileinfo");
        let Data = new FormData(form);
        return new Promise(function (res,rej) {
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        res(xhr.response);
                    }
                    else {
                         rej(xhr.response);    
                    }
                }
            };
            xhr.open('POST', path, true);
            xhr.send(Data);
        });
    }
    loadAudio(audio) {
        this.getTimeStampFromFirebase(audio)
            .subscribe((res:any) =>{
               this.audioSer.addData(res);
               this.loadNewAudio.next(res);
            })
    }
    getTimeStampFromFirebase(audio) {
        // return this.af.database.list('/words',{
        //                                       query: {
        //                                         orderByValue: 'id',
        //                                         equalTo: "1234"
        //                                       }
        //                                     });
    }
    getAudioJson(audio) {
        
        let path = `https://apis.voicebase.com/v2-beta/media/${audio.mediaId}/transcripts/latest`;
        return new Promise(function (res,rej) {
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        let response = {audio:JSON.parse(xhr.response),file:audio}
                        res(response);
                    }
                    else {
                         rej(xhr.response);    
                    }
                }
            };
            xhr.open('GET', path, true);
            xhr.setRequestHeader('Authorization', 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiJlMTdlNDlhMC1jNDEwLTQ4MjAtOTg5ZS05YWJkMGI2ZGRiMTciLCJ1c2VySWQiOiJhdXRoMHw1ODBmOTFjN2ExYmMyY2MwNjZjYWEzYjciLCJvcmdhbml6YXRpb25JZCI6IjZkMzMwNmEwLWI2Y2ItMGYwYy1mMTcyLWVmMWY3YmJlNjE2ZCIsImVwaGVtZXJhbCI6ZmFsc2UsImlhdCI6MTQ3NzQ5NTM3MjMwMSwiaXNzIjoiaHR0cDovL3d3dy52b2ljZWJhc2UuY29tIn0.Xl07d9oevEqBpH0edSdG_mrdkMOzaSPW4LA0ktBfEGY');
            xhr.send();
        });
    }
    checkStatus(audio) {
        let path = `https://apis.voicebase.com/v2-beta/media/${audio.mediaId}/`;
        new Promise(function (res,rej) {
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        let json = JSON.parse(xhr.response);
                        res(json)
                    }
                    else {
                        let json = JSON.parse(xhr.response);
                         rej(json);    
                    }
                }
            };
            xhr.open('GET', path, true);
            xhr.setRequestHeader('Authorization', 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiJlMTdlNDlhMC1jNDEwLTQ4MjAtOTg5ZS05YWJkMGI2ZGRiMTciLCJ1c2VySWQiOiJhdXRoMHw1ODBmOTFjN2ExYmMyY2MwNjZjYWEzYjciLCJvcmdhbml6YXRpb25JZCI6IjZkMzMwNmEwLWI2Y2ItMGYwYy1mMTcyLWVmMWY3YmJlNjE2ZCIsImVwaGVtZXJhbCI6ZmFsc2UsImlhdCI6MTQ3NzQ5NTM3MjMwMSwiaXNzIjoiaHR0cDovL3d3dy52b2ljZWJhc2UuY29tIn0.Xl07d9oevEqBpH0edSdG_mrdkMOzaSPW4LA0ktBfEGY');
            xhr.send();
        }).then((res: any) => {
            if(res.media.status =="finished") {
                this.af.database.object(`audio/${audio.$key}/`)
                .update(res);
                this.getAudioJson(audio)
                    .then((timestamp: any) => {
                        let savedata: any;
                        savedata = {word:timestamp.audio.transcript.words, id: audio.$key}
                        this.af.database.list(`words/`).push(savedata);
                    }) 
            }
            
                
        });
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
}