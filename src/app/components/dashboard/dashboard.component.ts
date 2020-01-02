import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { AlertService, RationService } from '../../services';


@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
    rationsData=[];
    constructor(

        private route: ActivatedRoute,
        private router: Router,
        private rationService: RationService,
        private alertService: AlertService
    ) {
        
        this.getRations();

    }

    ngOnInit() {

    }
    getRations(){
        this.rationService.getRations().subscribe(
            data => {
                if (data) {
                    this.rationsData = data;
                    console.log(data);
                }
            },
            error => {
                this.alertService.error(error);
            }
        );
    }
    deleteRation(rationId){
        var con=confirm("Are you sure?");
        if(con){
            this.rationService.deleteRation(rationId).subscribe(
                data => {
                    if (data) {
                        this.alertService.success(data.message);
                        this.getRations();
                    }
                },
                error => {
                    this.alertService.error(error);
                }
            );
        }
        
    }
    editRation(rationId){
        this.router.navigate(['/add-ration/']);
    }
}