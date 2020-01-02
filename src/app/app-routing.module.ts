import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {
    AddRationComponent,
    DashboardComponent,
    ScheduleComponent
  
} from './components/index';

const routes: Routes = [
    { path: '', component: DashboardComponent, pathMatch: 'full'},
    { path: 'dashboard', component: DashboardComponent },
    { path: 'schedule', component: ScheduleComponent },
    { path: 'add-ration', component: AddRationComponent},
    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
