export class ReadData {
    public name:string;
    public duration:string;
    public time:string;
    public read:boolean;
    public hightlight:boolean;
    public setTime:number;
    public empty: boolean = false;
    constructor(name,duration,time,read,hightlight,setTime,empty=false) {
        this.name = name;
        this.duration = duration;
        this.time = time;
        this.read = read;
        this.hightlight = hightlight;
        this.setTime = setTime;
        this.empty = empty;
    }
}