import { Injectable } from '@angular/core';
import { AbstractControl, FormControl, Validators } from '@angular/forms';


@Injectable()
export class CustomValidators{

	

    static number(prms = {})  {
        return (control: AbstractControl): { [key: string]: any }|null => {
            
            if(control.errors){
                return null;
            }
            let val = control.value;
            if(val==="" || val===null){
                return null;
            }
            if (isNaN(val) || /\D/.test(val.toString())) {

                return { "number": true };
            } else {

                return null;
            }
        };
    }
	
}