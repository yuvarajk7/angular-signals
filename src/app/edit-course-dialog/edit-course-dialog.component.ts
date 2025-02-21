import {Component, effect, inject, signal} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";
import {Course} from "../models/course.model";
import {EditCourseDialogData} from "./edit-course-dialog.data.model";
import {CoursesService} from "../services/courses.service";
import {LoadingIndicatorComponent} from "../loading/loading.component";
import {FormBuilder, ReactiveFormsModule} from '@angular/forms';
import {CourseCategoryComboboxComponent} from "../course-category-combobox/course-category-combobox.component";
import {CourseCategory} from "../models/course-category.model";
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'edit-course-dialog',
  standalone: true,
  imports: [
    LoadingIndicatorComponent,
    ReactiveFormsModule,
    CourseCategoryComboboxComponent
  ],
  templateUrl: './edit-course-dialog.component.html',
  styleUrl: './edit-course-dialog.component.scss'
})
export class EditCourseDialogComponent {


  dialogRef = inject(MatDialogRef);

  data: EditCourseDialogData = inject(MAT_DIALOG_DATA);

  fb = inject(FormBuilder);
  courseService = inject(CoursesService);

  category = signal<CourseCategory>("BEGINNER");

  form = this.fb.group({
    title: [''],
    longDescription: [''],
    iconUrl: ['']
  });

  constructor() {
    this.form.patchValue({
      title: this.data?.course?.title,
      longDescription: this.data?.course?.longDescription,
      iconUrl: this.data?.course?.iconUrl
    });

    this.category.set(this.data?.course?.category || "BEGINNER");

    effect(() => {
      console.log(`Course category bi-directional binding: ${this.category}`);
    });
  }

  onCancel() {
    this.dialogRef.close();
  }

  async onSave() {
    const courseProps = this.form.value as Partial<Course>;
    courseProps.category = this.category();

    if(this.data?.mode === "update") {
      await this.saveCourse(this.data?.course!.id, courseProps);
    }
    else if(this.data?.mode === "create") {
      await this.createCourse(courseProps);
    }
  }

  async createCourse(course: Partial<Course>) {
    try {
      const newCourse = await this.courseService.createCourse(course);
      this.dialogRef.close(newCourse);
    }
    catch (error) {
      console.error(error);
      alert('Failed to create course');
    }
  }

  async saveCourse(courseId: string, changes: Partial<Course>) {
    try {
      const updateCourse = await this.courseService.saveCourse(courseId, changes);
      this.dialogRef.close(updateCourse);
    }
    catch (error) {
      console.error(error);
      alert('Failed to save course');
    }
  }

}


export async function openEditCourseDialog( dialog: MatDialog, data: EditCourseDialogData ) {
  const config = new MatDialogConfig();
  config.disableClose = true;
  config.autoFocus = true;
  config.width = '400px';
  config.data = data;
  const close$ = dialog.open(EditCourseDialogComponent, config).afterClosed();
  return await firstValueFrom(close$);
}
