import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import {  Observable } from 'rxjs';
import { AppConfig } from './appConfig';
@Injectable({ providedIn: 'root' })
export class RationService {
    

    constructor(private http: HttpClient) {
        
    }
    //add ration to the database using service
    addRationInfo(postData) {

        return this.http.post<any>(`${AppConfig.API_URL}/api/v1/ration`, postData);
    }
    
    //get list of all rations
    getRations() {

        return this.http.get<any>(`${AppConfig.API_URL}/api/v1/ration`, {});
    }
    
    //delete any particular ration 
    deleteRation(rationId){
        var data={id:rationId};
        return this.http.delete<any>(`${AppConfig.API_URL}/api/v1/ration`, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
            params: data
        });
    }

    //get schedule of ration
    getSchedule(startDate) {
        
        
        let params = new HttpParams().set("startDate", new Date(startDate).getTime().toString());
        return this.http.get<any>(`${AppConfig.API_URL}/api/v1/ration-schedule`, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
            params: params
        });
    }

    

}