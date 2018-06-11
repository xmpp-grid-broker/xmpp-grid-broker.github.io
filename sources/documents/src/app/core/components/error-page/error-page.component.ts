import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

/**
 * An error view that can be displayed
 * for 404 errors and other reasons.
 */
@Component({
  selector: 'xgb-not-found',
  templateUrl: './error-page.component.html',
  styleUrls: ['./error-page.component.css']
})
export class ErrorPageComponent implements OnInit {

  /**
   * The error code provided over url data.
   */
  errorCode: string;

  constructor(private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.route.data.subscribe((data) => {
      this.errorCode = data['errorCode'];
    });
  }

}
