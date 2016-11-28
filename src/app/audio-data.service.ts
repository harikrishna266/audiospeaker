import { Injectable } from '@angular/core';

@Injectable()
export class AudioDataService {


  public audioData : any = {"words": []};

  addData(data) {
    for(let d of data ) {
      let dur = (d.e - d.s)/1000;
      let start = d.s/1000;
      this.audioData.words.push({
        "duration": dur, 
        "confidence": d.c,
        "name": d.w, 
        "time": start
      })
    }
  }


}
