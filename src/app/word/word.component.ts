import { Component, OnInit, Input, EventEmitter,Output} from '@angular/core';

@Component({
  selector: 'app-word',
  templateUrl: 'word.component.html',
  styleUrls: ['word.component.css']
})
export class WordComponent implements OnInit {


  @Input() data; 
  @Input() index; 
  @Output() draggedStart= new EventEmitter();
  @Output() draggedEnded= new EventEmitter();
  @Output() selection= new EventEmitter();
  @Output() clickEvent = new EventEmitter();
  @Output() selectAnotherWord = new EventEmitter();
   public selected:boolean = false;
 
  constructor() { }

  ngOnInit() {
    
  }
  contentEdited($event){
    if(this.data.name.length ==0){
      this.selectAnotherWord.emit({action:'remove',ind:this.index});
    }
  }
  select() {
      this.clickEvent.emit(this.data);
  }
  mousedown($event) {
      if($event.which == 1)
      this.draggedStart.emit(this.data);  
  }
  mouseup($event) {
    if($event.which == 1)
    this.draggedEnded.emit(this.data);  
  }

  mousemove() {
    this.selection.emit(this.data);
  }

}
