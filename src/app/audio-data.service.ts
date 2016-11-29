import { Injectable } from '@angular/core';
import {ReadData} from './models/readData';
import { AngularFire } from 'angularfire2';

@Injectable()
export class AudioDataService {


  public audioData :Array<ReadData> = [];
  public audioId: string;
  constructor(public af: AngularFire) {

  }
  addData(data) {
    for (let i = 0, len = data.length; i < len; i += 1) { 
      let d = data[i];
      let dur = (d.e - d.s);
      let start = d.s;
      let prev = data[i-1];
      let next = data[i+1];
      this.checkEmptyBlock(prev,d,next);
      this.audioData.push(new ReadData(d.w ,dur,start,false,false,start))
    }
    console.log(this.audioData);
  }
  checkEmptyBlock(prev,d,next) {
    
    if(!prev)
      this.audioData.push(new ReadData('' ,next.s,0,false,false,0))
    else {
      if(prev.e != d.s){
        let duration = d.s - prev.e;
        this.audioData.push(new ReadData('' ,duration,prev.e,false,false,prev.e))
      }
    }
  }

  saveWordsToFirebase() {
    this.af.database.object(`words/${this.audioId}`).set(this.audioData);
  }
  resetWords() {
     this.audioData.splice(0,this.audioData.length); 
  }
}
