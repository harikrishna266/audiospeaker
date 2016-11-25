import { Injectable } from '@angular/core';
import {ReadData} from '../models/readData';

@Injectable()
export class HistoryService {

    public history:Array<ReadData> = [] ;

    pushRow(row) {
         this.history.push(row)
    }
   
    removeLastentry() {
        this.history.splice(-1,1);
    }  

}
