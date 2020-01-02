import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService, RationService } from '../../services';
import { _ParseAST } from '@angular/compiler';


@Component({
    selector: 'app-schedule',
    templateUrl: './schedule.component.html'
})
export class ScheduleComponent implements OnInit {
    rationsData = [];
    constructor(

        private route: ActivatedRoute,
        private router: Router,
        private rationService: RationService,
        private alertService: AlertService
    ) {

        this.getSchedule();

    }

    ngOnInit() {

    }
    getSchedule() {
        this.rationService.getSchedule().subscribe(
            data => {
                if (data) {
                    this.rationsData = data.result;
                    console.log(this.rationsData);
                }
            },
            error => {
                this.alertService.error(error);
            }
        );
    }
    
}