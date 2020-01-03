import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService, RationService } from '../../services';



@Component({
    selector: 'app-schedule',
    templateUrl: './schedule.component.html'
})
export class ScheduleComponent implements OnInit {
    rationsData = [];
    expiryDate=new Date();
    survivalDays=0;
    constructor(

        private route: ActivatedRoute,
        private router: Router,
        private rationService: RationService,
        private alertService: AlertService
    ) {

        this.getSchedule(this.expiryDate);

    }

    ngOnInit() {

    }
    getSchedule(startDate) {
        this.rationService.getSchedule(startDate).subscribe(
            data => {
                if (data) {
                    this.rationsData = data.result;
                    this.survivalDays=Object.keys(this.rationsData).length;
                    console.log(this.rationsData);
                }
            },
            error => {
                this.alertService.error(error);
            }
        );
    }
    
    dateChanged(newValue){
        var scheduleStartDate=newValue;
        if (newValue === null || newValue == ""){
            this.expiryDate = new Date();
            scheduleStartDate=this.expiryDate; 
        }
        this.getSchedule(scheduleStartDate);
    }
    
}