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
import { openEditCourseDialog } from '../edit-course-dialog/edit-course-dialog.component';
import { LoadingService } from '../loading/loading.service';

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

    loadingService = inject(LoadingService);
    messagesService = inject(MessagesService);

    courseSerice = inject(CoursesService);
    dialog = inject(MatDialog);

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
            this.messagesService.showMessage("Failed to load courses", "error");
            console.error(error);
        }
    }

    onCourseUpdated(updatedCourse: Course) {
        const courses = this.#courses();
        const newCourses = courses.map(course => course.id === updatedCourse.id ? updatedCourse : course);
        this.#courses.set(newCourses);
    }
        
    async onCourseDeleted(courseId: string) {
        try{
            await this.courseSerice.deleteCourse(courseId);
            const courses = this.#courses();
            const newCourses = courses.filter(course => course.id !== courseId);
            this.#courses.set(newCourses);
        }
        catch (error) {
            console.error(error);
            alert('Failed to delete course');
        }
    }

    async onAddCourse() {
        const newCourse = await openEditCourseDialog(
            this.dialog,
            {
                mode: "create", 
                title: "Create New Course"
            });
        
        if(!newCourse) {
            return;
        }
        
        const newCourses = [...this.#courses(), newCourse];
        this.#courses.set(newCourses
            .sort(sortCoursesBySeqNo));
    }
        
}
