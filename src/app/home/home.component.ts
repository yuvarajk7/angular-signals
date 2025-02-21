import {Component, computed, effect, inject, Injector, signal} from '@angular/core';
import {CoursesService} from "../services/courses.service";
import {Course, sortCoursesBySeqNo} from "../models/course.model";
import {MatTab, MatTabGroup} from "@angular/material/tabs";
import {CoursesCardListComponent} from "../courses-card-list/courses-card-list.component";
import {MatDialog} from "@angular/material/dialog";
import {MessagesService} from "../messages/messages.service";
import {catchError, from, throwError} from "rxjs";
import {toObservable, toSignal, outputToObservable, outputFromObservable} from "@angular/core/rxjs-interop";
import { CoursesServiceWithFetch } from '../services/courses-fetch.service';

@Component({
    selector: 'home',
    imports: [
        MatTabGroup,
        MatTab,
        CoursesCardListComponent
    ],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss'
})
export class HomeComponent {

    courseSerice = inject(CoursesService);

    #courses = signal<Course[]>([]);

    beginnerCourses = computed(() => 
        {
            const courses = this.#courses();
            return courses.filter(course => course.category === 'BEGINNER');
        });

    advancedCourses = computed(() => this.#courses().filter(course => course.category === 'ADVANCED'));

    

    constructor() {

        effect(() => {
            console.log(`Beginner courses:`, this.beginnerCourses());
            console.log(`Advanced courses:`, this.advancedCourses());
        });

        this.loadCourses()
            .then(() => console.log("Courses loaded", this.#courses()));
    }

    async loadCourses() {
        try {
            const courses = await this.courseSerice.loadAllCourses();
            this.#courses.set(courses.sort(sortCoursesBySeqNo));
        }
        catch (error) {
            console.error(error);
        }
        
    }
}
