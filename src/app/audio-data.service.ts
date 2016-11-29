import { Injectable } from '@angular/core';

@Injectable()
export class AudioDataService {


  public audioData :Array <any> = [];

  addData(data) {
    this.audioData = [];
    for(let d of data ) {
      let dur = (d.e - d.s)/1000;
      let start = d.s/1000;
      this.audioData.push({
        "duration": dur, 
        "confidence": d.c,
        "name": d.w, 
        "time": start
      })
    }
  }

  resetWords() {
    this.audioData = [];
    console.log('resetting');
    this.audioData.slice(0,100);
    console.log(this.audioData);
    
  }
}
