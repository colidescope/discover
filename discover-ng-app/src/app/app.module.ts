import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import 'hammerjs';
import 'chartjs-plugin-zoom';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component'
import {SocketIoConfig, SocketIoModule} from "ngx-socket-io";
import {NavbarComponent} from './navbar/navbar.component';
import {SidepanelComponent} from './sidebar/sidepanel/sidepanel.component';
import {SidemenuComponent} from './sidebar/sidemenu/sidemenu.component';
import {SidebarComponent} from './sidebar/sidebar.component';
import {RunContainerComponent} from './run-container/run-container.component';
import {StepperInputComponent} from './stepper-input/stepper-input.component';
import {FormsModule} from "@angular/forms";
import {ExploreContainerComponent} from './explore-container/explore-container.component';
import {SelectInputComponent} from './select-input/select-input.component';
import {CheckboxInputComponent} from './checkbox-input/checkbox-input.component';
import {HttpClientModule} from "@angular/common/http";
import {LoadProjectComponent} from './load-project/load-project.component';
import {ChartsModule} from "ng2-charts";
import {ScatterChartComponent} from './scatter-chart/scatter-chart.component';
import {DesignsContainerComponent} from './designs-container/designs-container.component';

const config: SocketIoConfig = {url: 'http://localhost:5000', options: {}};

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    SidepanelComponent,
    SidemenuComponent,
    SidebarComponent,
    RunContainerComponent,
    StepperInputComponent,
    ExploreContainerComponent,
    SelectInputComponent,
    CheckboxInputComponent,
    LoadProjectComponent,
    ScatterChartComponent,
    DesignsContainerComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ChartsModule,
    FormsModule,
    NgbModule,
    SocketIoModule.forRoot(config)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
