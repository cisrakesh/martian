import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { COMPONENT_DECLARATIONS } from './components/componentlist';
import { AppBootstrapModule } from './app-bootstrap/app-bootstrap.module';
@NgModule({
  declarations: [
    AppComponent,
      ...COMPONENT_DECLARATIONS,
  ],
  imports: [
      BrowserAnimationsModule,
        BrowserModule,
        AppBootstrapModule,
        ReactiveFormsModule,
        HttpClientModule,
        AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
