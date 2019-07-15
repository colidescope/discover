import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component'
import {SocketIoConfig, SocketIoModule} from "ngx-socket-io";
import {NavbarComponent} from './navbar/navbar.component';
import {SidepanelComponent} from './sidebar/sidepanel/sidepanel.component';
import {SidemenuComponent} from './sidebar/sidemenu/sidemenu.component';
import {SidebarComponent} from './sidebar/sidebar.component';

const config: SocketIoConfig = {url: 'http://localhost:5000', options: {}};

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    SidepanelComponent,
    SidemenuComponent,
    SidebarComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    SocketIoModule.forRoot(config)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
