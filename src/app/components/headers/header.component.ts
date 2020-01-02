import { Component, OnInit } from '@angular/core';
import {Router,ActivatedRoute} from '@angular/router';
import {FormBuilder,FormGroup,Validators} from '@angular/forms';
import { first } from 'rxjs/operators';

declare var $:any;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit {
	currentUser: any;

    constructor(
        private router: Router,
        
    ) {
        
        
    }

  	ngOnInit() {
  		
  	}

  	
}