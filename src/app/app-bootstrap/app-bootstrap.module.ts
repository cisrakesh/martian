import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ModalModule } from 'ngx-bootstrap/modal';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
@NgModule({
    imports: [
        CommonModule,
        BsDropdownModule.forRoot(),
        TooltipModule.forRoot(),
        BsDatepickerModule.forRoot(),
        ModalModule.forRoot()
    ],
    exports: [BsDropdownModule, TooltipModule, ModalModule, BsDatepickerModule]
})
export class AppBootstrapModule { }