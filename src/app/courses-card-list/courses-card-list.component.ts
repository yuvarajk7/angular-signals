import {Component, inject, input, output} from '@angular/core';
import {RouterLink} from "@angular/router";
import {Course} from "../models/course.model";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import { EditCourseDialogData } from '../edit-course-dialog/edit-course-dialog.data.model';
import { EditCourseDialogComponent, openEditCourseDialog } from '../edit-course-dialog/edit-course-dialog.component';
import { firstValueFrom } from 'rxjs';

@Component({
    selector: 'courses-card-list',
    imports: [
        RouterLink
    ],
    templateUrl: './courses-card-list.component.html',
    styleUrl: './courses-card-list.component.scss'
})
export class CoursesCardListComponent {

    courses = input.required<Course[]>();

    courseUpdated = output<Course>();
    courseDeleted = output<string>();

    dialog = inject(MatDialog);

    async onEditCourse(course: Course) {
        const newCourse = await openEditCourseDialog(
            this.dialog,
            {
                mode: "update",
                title: "Update Existing Course",
                course
            }
        )

        console.log(`Course editied:`, newCourse);
        this.courseUpdated.emit(newCourse);
    }

    onCourseDeleted(course: Course) {
        this.courseDeleted.emit(course.id);
    }
        
}
