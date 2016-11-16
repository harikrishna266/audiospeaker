import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule ,JsonpModule} from '@angular/http';
import { MaterialModule } from '@angular/material';
import { AppComponent } from './app.component';
import {WordComponent} from './word/word.component';
import {PlayerComponent} from './player/player.component';
import {VisualiserComponent} from './visualiser/visualiser.component';
import { AngularFireModule } from 'angularfire2';
import {ListdownloadComponent} from './listdownload/listdownload.component';
import {ContextMenuServiceService} from './service/context-menu-service.service';
import { ContextMenuModule } from 'angular2-contextmenu';

export const firebaseConfig = {
  apiKey: "AIzaSyCVuinX6esaVNRCrx5VIp9Uq5HRMF9ngLs",
  authDomain: "audioeditor-e565e.firebaseapp.com",
  databaseURL: "https://audioeditor-e565e.firebaseio.com",
  storageBucket: "audioeditor-e565e.appspot.com",
  messagingSenderId: "747710759787"
};

@NgModule({
  declarations: [
    AppComponent,
    WordComponent,
    PlayerComponent,
    VisualiserComponent,
    ListdownloadComponent
  ],
  imports: [
    BrowserModule,
    AngularFireModule.initializeApp(firebaseConfig),
    FormsModule,
    HttpModule,
    JsonpModule,
    ContextMenuModule,
    MaterialModule.forRoot()
  ],
  providers: [ContextMenuServiceService],
  bootstrap: [AppComponent]
})
export class AppModule { }
