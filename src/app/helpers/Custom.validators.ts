import { Injectable } from '@angular/core';
import { AbstractControl, FormControl, Validators } from '@angular/forms';


@Injectable()
export class CustomValidators{

	static matchValue(feildOne:string,feildTwo:string){
		return (control:AbstractControl):{[key:string]:any}| null=>{
			const controlToCompareOne =control.get(feildOne);
			const controlToCompareTwo =control.get(feildTwo);
			console.log(controlToCompareOne);
			if(controlToCompareTwo && controlToCompareTwo.value !==controlToCompareOne.value){
				return {'notEqual':true};
			}
		};
	}

    static number(prms = {})  {
        return (control: AbstractControl): { [key: string]: any }|null => {
            
            if(control.errors){
                return null;
            }
            let val = control.value;

            if (isNaN(val) || /\D/.test(val.toString())) {

                return { "number": true };
            } else {

                return null;
            }
        };
    }
	 checkAvailability(serviceObject){
		return (control:AbstractControl):{[key:string]:any}|null=>{
			//const controlFeild =control.get(feildControlName);
			console.log(control);
			if(!control.touched){
				return new Promise(resolve => {resolve(null)});
			}else{
			
				var postData={};
				postData['email']=control.value;
				
				if(control.parent && control.parent.value.profile){
					postData['profileId']=control.parent.value.profile;
				}
				//return {'notAvailable':true};
				
				return new Promise(resolve => {
					serviceObject.checkEmailAvilaibility(postData).subscribe(
						(data)=>{
				        	if (data.count>0) {
						        resolve({'notAvailable':true});	
						     }else{
						     	resolve(null);
						     }
				    	},
				    	(err)=>{
				    		resolve({'notAvailable':true});	
				    	}
			    	);
					
		        });
	        }
			
		}
	}

	emailTaken(serviceObject){

		return (control: FormControl): Promise<any> => {
    
		    let q = new Promise((resolve, reject) => {
			      	//var headers = new Headers();
			      	//headers.append('Content-Type', 'application/json');
			      	var userdata: { email?: any, profileId?: any } = {};
			      	userdata.email = control.value;
				    if (control.parent && control.parent.value.profile) {
				        userdata.profileId = control.parent.value['profile'];
				    }

			      	serviceObject.checkEmailAvilaibility(userdata)
		        	.subscribe(
		        		(data: any) => {
		          			if (data.count>0) {
						        resolve({'notAvailable':true});	
						     }else{
						     	resolve(null);
						     }
		        		},
		        		(error: any) => {
		          			console.log(error);
		          			resolve(null);
		        		}
		        	);
		      
	    		});
		    return q;
	  	}
	}
}