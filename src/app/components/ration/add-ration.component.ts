import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { CustomValidators } from '../../helpers';
import { AlertService, RationService } from '../../services';
@Component({
    selector: 'app-add-ration',
    templateUrl: './add-ration.component.html'
    
})

export class AddRationComponent implements OnInit {


    loading = false;
    rationForm: FormGroup;
    submitted = false;
    packetTypes = [{ title: "Select Any", value: "" }, { title: "Food", value: "Food" }, { title: "Water", value: "Water" }];
    constructor(
        private fb: FormBuilder,
        private router: Router,
        private rationService: RationService,
        private alertService: AlertService
    ) {

        
    }

    ngOnInit() {
        this.loadFormData();
        
    }
    loadFormData(): void {
        this.rationForm = this.fb.group({
            packetId: ['', Validators.required],
            packetType: ['', Validators.required],
            packetContent: ['', Validators.required],
            calories: ['', Validators.compose([Validators.required, Validators.max(2500), Validators.min(0), CustomValidators.number()])],
            expiryDate: ['', Validators.required],
            liters: ['', Validators.compose([Validators.required, Validators.max(2), Validators.min(2), CustomValidators.number()])],
        });
        this.formControlValueChanged();
    }
    formControlValueChanged() {

        const packetContent = this.rationForm.get('packetContent');
        const calories = this.rationForm.get('calories');
        const expiryDate = this.rationForm.get('expiryDate');
        const liters = this.rationForm.get('liters');
        this.rationForm.get('packetType').valueChanges.subscribe(
            (mode: string) => {
                console.log(mode);
                if (mode === 'Food') {
                    packetContent.setValidators([Validators.required]);
                    calories.setValidators(Validators.compose([Validators.required, Validators.max(2500), Validators.min(0), CustomValidators.number()]));
                    expiryDate.setValidators([Validators.required]);
                    liters.clearValidators();
                }
                else if (mode === 'Water') {
                    packetContent.clearValidators();
                    calories.clearValidators();
                    expiryDate.clearValidators();
                    liters.setValidators(Validators.compose([Validators.required, Validators.max(2), Validators.min(1), CustomValidators.number()]));
                }
                packetContent.updateValueAndValidity();
                calories.updateValueAndValidity();
                expiryDate.updateValueAndValidity();
                liters.updateValueAndValidity();
            });

    }
    resetForm() {

        this.submitted = false;
        this.rationForm.reset();


    }
    get f() { return this.rationForm.controls; }

    onSubmit() {
        this.submitted = true;
        // reset alerts on submit

        // stop here if form is invalid
        if (this.rationForm.invalid) {
            return;
        }

        this.loading = true;

        const postData = {
            packetId: this.f.packetId.value,
            packetType: this.f.packetType.value,
            packetContent: this.f.packetContent.value,
            calories: this.f.calories.value,
            expiryDate: this.f.expiryDate.value,
            liters: this.f.liters.value
        };
        this.rationService.addRationInfo(postData).subscribe(
            data => {
                if (data) {
                    this.alertService.success(data.message);
                    this.resetForm();
                    console.log(data);
                }
                this.loading = false;
            },
            error => {
                this.alertService.error(error);
                this.loading = false;
            }
        );

    }
}