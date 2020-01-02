import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {  Observable } from 'rxjs';
import { AppConfig } from './appConfig';
@Injectable({ providedIn: 'root' })
export class RationService {
    

    constructor(private http: HttpClient) {
        
    }

    
    addRationInfo(postData) {

        return this.http.post<any>(`${AppConfig.API_URL}/api/v1/ration`, postData);
    }
    
    getRations() {

        return this.http.get<any>(`${AppConfig.API_URL}/api/v1/ration`, {});
    }
    
    deleteRation(rationId){
        var data={id:rationId};
        return this.http.delete<any>(`${AppConfig.API_URL}/api/v1/ration`, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
            params: data
        });
    }

    getSchedule() {

        return this.http.get<any>(`${AppConfig.API_URL}/api/v1/ration-schedule`, {});
    }

    checkPackageIdAvailablity(postData) {
        return this.http.post<any>(`${AppConfig.API_URL}/api/v1/check-package-id`, postData)
    }


    handleError(error: Response) {
        console.log(error);
        return Observable.throw(error);
    }



    handlePromiseError(error: Response) {
        console.log(error);
        throw (error);
    }

}