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
      let dur = (d.e - d.s)/1000;
      let start = d.s/1000;
      this.audioData.push(new ReadData(d.w ,dur,start,false,false,start))
    }
  }
  // checkBlankAudio(prev,pres,fur) {
  //     let PREtime = 0;;
  //       if(prev && fur) {
  //         let PREVduration = (prev.e - prev.s)/1000;
  //         let PREVstart = prev.s/1000;
  //         PREtime = +(pres.s/1000).toFixed(2);
  //           let preEndtime = PREVstart + PREVduration;
  //           preEndtime = +preEndtime.toFixed(2);
  //           console.log(preEndtime,PREtime);
  //           if(preEndtime!= PREtime) {

  //               let duration = (PREtime  - +preEndtime).toFixed(3);
  //               this.insertBlankRow("",duration,preEndtime);    
  //           }
  //       } 
  //       if(!prev) {
  //           this.insertBlankRow("",PREtime,0);    
  //       }
  //   }
  
  // insertBlankRow(name ,duration,time) {
  //       this.audioData.push(new ReadData(name ,duration,time,false,false,time));
  // }
  saveWordsToFirebase() {
    this.af.database.object(`words/${this.audioId}`).set(this.audioData);
  }
  resetWords() {
     this.audioData.splice(0,this.audioData.length); 
  }
}
